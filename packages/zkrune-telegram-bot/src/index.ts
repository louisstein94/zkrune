import "dotenv/config";
import { Bot } from "grammy";
import * as fs from "fs";
import * as path from "path";
import { startSnapshotCron } from "./snapshot";
import { startHttpServer } from "./server";

// @ts-ignore — snarkjs has no proper type exports
const snarkjs = require("snarkjs");

// ── Config ───────────────────────────────────────────────────────────────────

const BOT_TOKEN = process.env.BOT_TOKEN;
const WHALE_GROUP_ID = process.env.WHALE_GROUP_ID;
const PROOF_URL = process.env.PROOF_URL || "https://zkrune.com/whale-chat";
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

// ── Nullifier store (flat file, survives restarts) ──────────────────────────

const NULLIFIER_FILE = path.resolve(__dirname, "../nullifiers.json");

function loadNullifiers(): Set<string> {
  try {
    const data = JSON.parse(fs.readFileSync(NULLIFIER_FILE, "utf-8"));
    return new Set(data);
  } catch {
    return new Set();
  }
}

function saveNullifier(nullifier: string): boolean {
  const set = loadNullifiers();
  if (set.has(nullifier)) return false;
  set.add(nullifier);
  fs.writeFileSync(NULLIFIER_FILE, JSON.stringify([...set], null, 2));
  return true;
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

  // Check nullifier replay
  const nullifier = payload.publicSignals[1];
  if (!saveNullifier(nullifier)) {
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

bot.command("start", async (ctx) => {
  await ctx.reply(
    `🔐 *zkRune Whale Verification Bot*\n\n` +
      `This bot lets zkRUNE token holders access the whale group ` +
      `without revealing their identity.\n\n` +
      `*How it works:*\n` +
      `1️⃣  Start with /verify\n` +
      `2️⃣  Generate your ZK proof on the web\n` +
      `3️⃣  Send the proof JSON file here\n` +
      `4️⃣  Bot verifies and sends an invite link\n\n` +
      `Your address and balance are never exposed.`,
    { parse_mode: "Markdown" }
  );
});

bot.command("verify", async (ctx) => {
  await ctx.reply(
    `🐋 *Whale Verification*\n\n` +
      `Follow these steps:\n\n` +
      `1. [Click this link](${PROOF_URL}) and generate your ZK proof\n` +
      `2. Click "Export Proof JSON"\n` +
      `3. Send the downloaded \`zkrune-whale-proof.json\` file here\n\n` +
      `Your proof will be verified against the snapshot Merkle root. ` +
      `Your address and balance never appear in the proof — only "does this holder meet the threshold?" is verified.`,
    { parse_mode: "Markdown" }
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    `*Commands:*\n` +
      `/start — About this bot\n` +
      `/verify — Verification steps\n` +
      `/help — This message\n\n` +
      `Send your proof file (JSON) directly to this chat.`,
    { parse_mode: "Markdown" }
  );
});

// Handle document (proof JSON)
bot.on("message:document", async (ctx) => {
  const doc = ctx.message.document;

  if (!doc.file_name?.endsWith(".json")) {
    await ctx.reply("❌ Please send a proof file in `.json` format.", {
      parse_mode: "Markdown",
    });
    return;
  }

  await ctx.reply("⏳ Verifying proof...");

  try {
    const file = await ctx.getFile();
    const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    const res = await fetch(url);
    const payload = (await res.json()) as ProofPayload;

    const result = await verifyProof(payload);

    if (result.valid) {
      let inviteMsg =
        `✅ *Proof verified!*\n\n` +
        `Groth16 ZK-SNARK verification successful.\n` +
        `Your address and balance remained private — only the threshold claim was proven.`;

      if (WHALE_GROUP_ID) {
        try {
          const invite = await bot.api.createChatInviteLink(WHALE_GROUP_ID, {
            member_limit: 1,
            name: `zkproof-${Date.now()}`,
          });
          inviteMsg +=
            `\n\n🐋 [Join Whale Chat](${invite.invite_link})\n` +
            `_This link is single-use._`;
        } catch {
          inviteMsg += `\n\n⚠️ Could not generate invite link. Contact the group admin.`;
        }
      }

      await ctx.reply(inviteMsg, { parse_mode: "Markdown" });
    } else {
      await ctx.reply(`❌ *Verification failed*\n\n${result.reason}`, {
        parse_mode: "Markdown",
      });
    }
  } catch (err: any) {
    await ctx.reply(
      `❌ Could not read proof file or invalid format.\n\n` +
        `Please send the file exported via "Export Proof JSON" ` +
        `from zkrune.com/whale-chat.\n\n` +
        `Error: \`${err.message}\``,
      { parse_mode: "Markdown" }
    );
  }
});

// ── Launch ───────────────────────────────────────────────────────────────────

const HTTP_PORT = parseInt(process.env.PORT || "3000", 10);

startSnapshotCron();
startHttpServer(HTTP_PORT);

bot.start({
  onStart: () => {
    console.log("[zkrune-bot] Whale verification bot is running");
    console.log("[zkrune-bot] Proof URL:", PROOF_URL);
    console.log("[zkrune-bot] Group ID:", WHALE_GROUP_ID || "(not set)");
  },
});
