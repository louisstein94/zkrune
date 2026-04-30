import "dotenv/config";
import { Bot, Context } from "grammy";
import * as fs from "fs";
import * as path from "path";
import { startSnapshotCron } from "./snapshot";
import { startHttpServer } from "./server";

// @ts-ignore — snarkjs has no proper type exports
const snarkjs = require("snarkjs");

// ── Config ───────────────────────────────────────────────────────────────────

const BOT_TOKEN = process.env.BOT_TOKEN;
const WHALE_INVITE_URL = process.env.WHALE_INVITE_URL || "";
const MINI_APP_URL = process.env.MINI_APP_URL || "";
const PROOF_URL = process.env.PROOF_URL || MINI_APP_URL || "https://zkrune.com/whale-chat";
const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL || "zkRUNE";
const TOKEN_NAME = process.env.TOKEN_NAME || "zkRune";
const EXPECTED_MIN_BALANCE = process.env.EXPECTED_MIN_BALANCE
  ? BigInt(process.env.EXPECTED_MIN_BALANCE)
  : null;
const INVITE_TTL_SECONDS = Number(process.env.INVITE_TTL_SECONDS || 30);
const STORE_DIR = path.resolve(__dirname, process.env.STORE_DIR || "..");

const VKEY_PATH =
  process.env.VKEY_PATH ||
  path.resolve(__dirname, "../keys/whale-holder_vkey.json");

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is required. Set it in .env");
  process.exit(1);
}

// ── Verification key (loaded once) ──────────────────────────────────────────

let vKey: any;
try {
  vKey = JSON.parse(fs.readFileSync(VKEY_PATH, "utf-8"));
  console.log("[boot] Verification key loaded:", VKEY_PATH);
} catch {
  console.error("[boot] Cannot load vkey from", VKEY_PATH);
  process.exit(1);
}

// ── Persistent stores (flat files, survive restarts) ────────────────────────

if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });

const NULLIFIER_FILE = path.resolve(STORE_DIR, "nullifiers.json");
const VERIFIED_USERS_FILE = path.resolve(STORE_DIR, "verified-users.json");

function loadJsonSet(file: string): Set<string> {
  try {
    return new Set(JSON.parse(fs.readFileSync(file, "utf-8")));
  } catch {
    return new Set();
  }
}

function saveJsonSet(file: string, set: Set<string>): void {
  fs.writeFileSync(file, JSON.stringify([...set], null, 2));
}

function tryAddToSet(file: string, value: string): boolean {
  const set = loadJsonSet(file);
  if (set.has(value)) return false;
  set.add(value);
  saveJsonSet(file, set);
  return true;
}

function isUserVerified(userId: number): boolean {
  return loadJsonSet(VERIFIED_USERS_FILE).has(String(userId));
}

function markUserVerified(userId: number): void {
  tryAddToSet(VERIFIED_USERS_FILE, String(userId));
}

// ── Proof verification ──────────────────────────────────────────────────────

interface ProofPayload {
  circuit: string;
  protocol: string;
  proof: any;
  publicSignals: string[];
  nullifier: string;
}

async function verifyProof(
  payload: ProofPayload
): Promise<{ valid: boolean; reason?: string }> {
  if (payload.circuit !== "whale-holder") {
    return { valid: false, reason: "Wrong circuit. Expected whale-holder." };
  }
  if (payload.protocol !== "groth16") {
    return { valid: false, reason: "Wrong protocol. Expected groth16." };
  }

  // publicSignals: [hasMinimum, nullifier, root, minimumBalance]
  const hasMinimum = payload.publicSignals[0];
  if (hasMinimum !== "1") {
    return { valid: false, reason: "Balance threshold not met (hasMinimum=0)." };
  }

  // Sanity-check that the proof was generated for our expected threshold,
  // not some lower value — the circuit would otherwise accept any holder.
  if (EXPECTED_MIN_BALANCE !== null) {
    let provedMin: bigint;
    try {
      provedMin = BigInt(payload.publicSignals[3]);
    } catch {
      return { valid: false, reason: "minimumBalance public signal invalid." };
    }
    if (provedMin < EXPECTED_MIN_BALANCE) {
      return {
        valid: false,
        reason: `Proof was generated for a lower threshold (${provedMin}) than required (${EXPECTED_MIN_BALANCE}).`,
      };
    }
  }

  // Check nullifier replay
  const nullifier = payload.publicSignals[1];
  if (!tryAddToSet(NULLIFIER_FILE, nullifier)) {
    return { valid: false, reason: "This proof has already been used (nullifier replay)." };
  }

  // Cryptographic verification
  try {
    const isValid = await snarkjs.groth16.verify(
      vKey,
      payload.publicSignals,
      payload.proof
    );
    if (!isValid) {
      return { valid: false, reason: "Cryptographic verification failed." };
    }
  } catch (err: any) {
    return { valid: false, reason: `Verification error: ${err.message}` };
  }

  return { valid: true };
}

// ── Bot ─────────────────────────────────────────────────────────────────────

const bot = new Bot(BOT_TOKEN);

function startVerificationKeyboard() {
  // Custom reply keyboard with a Mini App button. When the user opens the
  // app and calls Telegram.WebApp.sendData(...), the bot receives a
  // message:web_app_data event — no HTTP server hop, no admin rights.
  if (!MINI_APP_URL) return undefined;
  return {
    keyboard: [[{ text: `🐋 Verify ${TOKEN_SYMBOL} Whale`, web_app: { url: MINI_APP_URL } }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

function startVerificationMessage(): string {
  if (MINI_APP_URL) {
    return (
      `🐋 *${TOKEN_NAME} Whale Verification*\n\n` +
      `Tap the button below to open the proof generator inside Telegram. ` +
      `Connect your wallet, generate the proof in ~10–40 seconds, and the result ` +
      `comes straight back to me.\n\n` +
      `Your address and exact balance never leave your browser.`
    );
  }
  // Fallback: legacy text instructions when no Mini App is configured
  return (
    `🐋 *${TOKEN_NAME} Whale Verification*\n\n` +
    `Prove you are a whale holder without revealing your address or balance.\n\n` +
    `*How it works:*\n` +
    `1️⃣  [Open the proof page](${PROOF_URL}) and connect your wallet\n` +
    `2️⃣  Generate the ZK proof (10–40 seconds in your browser)\n` +
    `3️⃣  Send the exported proof JSON to me here`
  );
}

async function sendStart(ctx: Context) {
  const userId = ctx.from?.id;
  if (userId && isUserVerified(userId)) {
    await ctx.reply(
      `✅ You are already verified.\n\n` +
        `If you lost the invite link, contact a group admin.`,
    );
    return;
  }
  await ctx.reply(startVerificationMessage(), {
    parse_mode: "Markdown",
    link_preview_options: { is_disabled: true },
    reply_markup: startVerificationKeyboard(),
  });
}

bot.command("start", sendStart);
bot.command("verify", sendStart);

bot.command("help", async (ctx) => {
  await ctx.reply(
    `*Commands:*\n` +
      `/start — Begin verification\n` +
      `/help — This message\n\n` +
      (MINI_APP_URL
        ? `Tap the keyboard button after /start to open the verifier.`
        : `Send your proof file (JSON) directly to this chat.`),
    { parse_mode: "Markdown" },
  );
});

// ── Shared verification handler — used by both Mini App and JSON upload paths
async function handleProof(ctx: Context, payload: ProofPayload): Promise<void> {
  const userId = ctx.from?.id;
  if (userId && isUserVerified(userId)) {
    await ctx.reply(`✅ You are already verified — no need to submit again.`);
    return;
  }

  await ctx.reply("⏳ Verifying proof...");

  const result = await verifyProof(payload);

  if (!result.valid) {
    await ctx.reply(`❌ *Verification failed*\n\n${result.reason}`, {
      parse_mode: "Markdown",
    });
    return;
  }

  if (userId) markUserVerified(userId);

  let inviteText =
    `✅ *Proof verified!*\n\n` +
    `Groth16 ZK-SNARK verification successful.\n` +
    `Your address and balance remained private — only the threshold claim was proven.`;

  if (WHALE_INVITE_URL) {
    inviteText +=
      `\n\n🐋 [Join Whale Chat](${WHALE_INVITE_URL})\n` +
      `_This link will disappear in ${INVITE_TTL_SECONDS}s — open it now._`;
  } else {
    inviteText += `\n\n(No whale group invite configured.)`;
  }

  const inviteMessage = await ctx.reply(inviteText, {
    parse_mode: "Markdown",
    link_preview_options: { is_disabled: true },
    reply_markup: { remove_keyboard: true },
  });

  if (WHALE_INVITE_URL) {
    setTimeout(async () => {
      try {
        await bot.api.deleteMessage(
          inviteMessage.chat.id,
          inviteMessage.message_id,
        );
      } catch (err: any) {
        console.warn(`[bot] Could not auto-delete invite message: ${err.message}`);
      }
    }, INVITE_TTL_SECONDS * 1000);
  }
}

// ── Mini App proof receipt ─────────────────────────────────────────────────
// Triggered when the Mini App calls Telegram.WebApp.sendData(JSON.stringify(payload)).
bot.on("message:web_app_data", async (ctx) => {
  let payload: ProofPayload;
  try {
    payload = JSON.parse(ctx.message.web_app_data.data) as ProofPayload;
  } catch (err: any) {
    await ctx.reply(`❌ Could not parse Mini App payload: ${err.message}`);
    return;
  }
  await handleProof(ctx, payload);
});

// ── Manual JSON upload (fallback for power users) ──────────────────────────
bot.on("message:document", async (ctx) => {
  const doc = ctx.message.document;

  if (!doc.file_name?.endsWith(".json")) {
    await ctx.reply("❌ Please send a proof file in `.json` format.", {
      parse_mode: "Markdown",
    });
    return;
  }

  let payload: ProofPayload;
  try {
    const file = await ctx.getFile();
    const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    const res = await fetch(url);
    payload = (await res.json()) as ProofPayload;
  } catch (err: any) {
    await ctx.reply(
      `❌ Could not read proof file.\n\nError: \`${err.message}\``,
      { parse_mode: "Markdown" },
    );
    return;
  }
  await handleProof(ctx, payload);
});

// ── Launch ───────────────────────────────────────────────────────────────────

const HTTP_PORT = parseInt(process.env.PORT || "3000", 10);

startSnapshotCron();
startHttpServer(HTTP_PORT);

async function launchBot(retries = 5): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await bot.api.deleteWebhook({ drop_pending_updates: true });
      await bot.start({
        onStart: () => {
          console.log(`[${TOKEN_SYMBOL}-bot] Whale verification bot is running`);
          console.log(`[${TOKEN_SYMBOL}-bot] Token:       ${TOKEN_NAME} (${TOKEN_SYMBOL})`);
          console.log(`[${TOKEN_SYMBOL}-bot] Mini App:    ${MINI_APP_URL || "(not set)"}`);
          console.log(`[${TOKEN_SYMBOL}-bot] Proof URL:   ${PROOF_URL}`);
          console.log(`[${TOKEN_SYMBOL}-bot] Invite URL:  ${WHALE_INVITE_URL ? "(set)" : "(not set)"}`);
          console.log(`[${TOKEN_SYMBOL}-bot] Invite TTL:  ${INVITE_TTL_SECONDS}s`);
          console.log(`[${TOKEN_SYMBOL}-bot] Store dir:   ${STORE_DIR}`);
        },
      });
      return;
    } catch (err: any) {
      if (err?.error_code === 409 && attempt < retries) {
        const delay = attempt * 3000;
        console.warn(
          `[${TOKEN_SYMBOL}-bot] Conflict (attempt ${attempt}/${retries}), retrying in ${delay / 1000}s...`,
        );
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

launchBot().catch((err) => {
  console.error(`[${TOKEN_SYMBOL}-bot] Fatal:`, err.message);
});
