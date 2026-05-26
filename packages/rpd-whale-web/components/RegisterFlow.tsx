"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { QRCodeSVG } from "qrcode.react";

import {
  generateBjjSecret,
  deriveBjjPubkey,
  bjjSecretToHex,
  encodeBjjSecretQr,
  saveBjjSecretLocal,
} from "@/lib/bjj";
import {
  fetchRegistrationStatus,
  fetchRegistrationMessage,
  submitRegistration,
} from "@/lib/registry-client";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false },
);

const TOKEN = {
  symbol: "RPD",
  name: "Red Panda",
  threshold: 10_000_000,
};

type Phase =
  | "idle"
  | "checking"
  | "not-whale"
  | "already-registered"
  | "ready"
  | "generating"
  | "signing"
  | "submitting"
  | "success"
  | "error";

interface PendingHolder { balance: string }
interface SnapshotShape {
  meta: { totalWhales: number; totalRegistered: number; totalPending: number };
  pending: Record<string, PendingHolder>;
}

async function fetchSnapshot(): Promise<SnapshotShape> {
  const base = process.env.NEXT_PUBLIC_BOT_API_URL || "https://zkrune-production.up.railway.app";
  const res = await fetch(`${base}/snapshot.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("Snapshot not available");
  return res.json();
}

export default function RegisterFlow() {
  const { publicKey, connected, signMessage } = useWallet();

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [whaleBalance, setWhaleBalance] = useState<string | null>(null);
  const [existingBinding, setExistingBinding] = useState<{ x: string; y: string } | null>(null);
  const [newSecret, setNewSecret] = useState<bigint | null>(null);
  const [hexBackup, setHexBackup] = useState<string>("");
  const [qrPayload, setQrPayload] = useState<string>("");

  // ── Check status whenever wallet connects ────────────────────────────────
  const checkStatus = useCallback(async () => {
    if (!publicKey) return;
    const addr = publicKey.toBase58();
    setPhase("checking");
    setError("");
    try {
      const [reg, snap] = await Promise.all([
        fetchRegistrationStatus(addr),
        fetchSnapshot(),
      ]);

      const pendingEntry = snap.pending[addr];

      if (reg.registered) {
        setExistingBinding({ x: reg.bjjPubkeyX!, y: reg.bjjPubkeyY! });
        setPhase("already-registered");
        return;
      }

      if (!pendingEntry) {
        setPhase("not-whale");
        return;
      }

      setWhaleBalance(pendingEntry.balance);
      setPhase("ready");
    } catch (e: any) {
      setError(e.message || "Could not fetch status");
      setPhase("error");
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      checkStatus();
    } else {
      setPhase("idle");
      setExistingBinding(null);
      setWhaleBalance(null);
    }
  }, [connected, publicKey, checkStatus]);

  // ── Registration flow ────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!publicKey || !signMessage) {
      setError("Wallet does not support signMessage.");
      setPhase("error");
      return;
    }

    try {
      // 1. Generate BJJ secret + derive pubkey locally
      setPhase("generating");
      const sk = generateBjjSecret();
      const pk = await deriveBjjPubkey(sk);
      const pkX = pk.x.toString();
      const pkY = pk.y.toString();

      // 2. Fetch the canonical message bytes from the bot
      const message = await fetchRegistrationMessage(pkX, pkY);
      const messageBytes = new TextEncoder().encode(message);

      // 3. Ask the wallet to sign
      setPhase("signing");
      const signatureBytes = await signMessage(messageBytes);
      const signatureB58 = bs58.encode(signatureBytes);

      // 4. Submit binding to the bot
      setPhase("submitting");
      const submission = await submitRegistration({
        solanaAddress: publicKey.toBase58(),
        bjjPubkeyX: pkX,
        bjjPubkeyY: pkY,
        signature: signatureB58,
      });

      if ("error" in submission) {
        setError(submission.error);
        setPhase("error");
        return;
      }

      // 5. Persist locally + show QR + backup
      saveBjjSecretLocal(sk);
      setNewSecret(sk);
      setHexBackup(bjjSecretToHex(sk));
      setQrPayload(encodeBjjSecretQr(sk));
      setPhase("success");
    } catch (e: any) {
      // Wallet rejection has a specific shape; treat all errors uniformly
      const msg = e?.message || String(e);
      if (/user rejected|rejected the request/i.test(msg)) {
        setError("Signature rejected in wallet.");
      } else {
        setError(msg);
      }
      setPhase("error");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-rpd-darker text-white">
      <main className="px-4 sm:px-6 py-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            🐼 {TOKEN.name} <span className="text-rpd-primary">Whale</span> Registration
          </h1>
          <p className="text-rpd-gray text-sm max-w-md mx-auto leading-relaxed">
            One-time setup: bind a BabyJubjub identity to your Solana wallet, so
            the Mini App can prove whale ownership without exposing your
            address — to anyone, including the bot.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          {/* Wallet connect */}
          <div className="mb-6">
            <p className="text-rpd-gray/60 text-xs font-mono uppercase mb-2">
              Step 1 — Connect wallet
            </p>
            <WalletMultiButton />
            {connected && publicKey && (
              <p className="text-rpd-primary text-xs font-mono mt-2 break-all">
                ✓ {publicKey.toBase58()}
              </p>
            )}
          </div>

          {phase === "checking" && (
            <div className="text-center py-6">
              <div className="w-8 h-8 mx-auto mb-3 rounded-full border-2 border-rpd-primary/30 border-t-rpd-primary animate-spin" />
              <p className="text-rpd-gray text-sm">Checking registry…</p>
            </div>
          )}

          {phase === "not-whale" && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-center">
              <p className="text-yellow-400 font-semibold mb-1">Below threshold</p>
              <p className="text-rpd-gray text-sm">
                This address is not a {TOKEN.symbol} whale in the current
                snapshot. Need ≥ {TOKEN.threshold.toLocaleString("en-US")} {TOKEN.symbol}.
              </p>
            </div>
          )}

          {phase === "already-registered" && existingBinding && (
            <div className="space-y-3">
              <div className="rounded-xl border border-rpd-primary/30 bg-rpd-primary/5 p-4">
                <p className="text-rpd-primary font-semibold mb-1">✓ Already registered</p>
                <p className="text-rpd-gray text-xs">
                  A BabyJubjub identity is already bound to this Solana address.
                  If you still have its private key, open the Telegram Mini App
                  and import it. Otherwise click below to issue a fresh one.
                </p>
                <p className="text-white font-mono text-[10px] mt-3 break-all">
                  BJJ X: {existingBinding.x.slice(0, 24)}…
                </p>
              </div>
              <button
                onClick={handleRegister}
                disabled={!signMessage}
                className="w-full py-3 rounded-xl border border-white/15 text-white disabled:opacity-40"
              >
                Generate new identity (replaces old)
              </button>
            </div>
          )}

          {phase === "ready" && whaleBalance && (
            <div className="space-y-4">
              <div className="rounded-xl border border-rpd-primary/30 bg-rpd-primary/5 p-4">
                <p className="text-rpd-primary font-semibold mb-1">🐋 Whale confirmed</p>
                <p className="text-rpd-gray text-sm">
                  Balance: <span className="text-white font-mono">
                    {Number(whaleBalance).toLocaleString("en-US")} {TOKEN.symbol}
                  </span>
                </p>
              </div>

              <div>
                <p className="text-rpd-gray/60 text-xs font-mono uppercase mb-2">
                  Step 2 — Bind BJJ identity to this wallet
                </p>
                <p className="text-rpd-gray text-xs mb-3 leading-relaxed">
                  We'll generate a fresh BabyJubjub keypair in your browser. Your
                  Solana wallet will be asked to sign a single message binding
                  that BJJ pubkey to this address. The signature proves
                  ownership; the BJJ secret stays in your browser.
                </p>
                <button
                  onClick={handleRegister}
                  disabled={!signMessage}
                  className="w-full py-3 rounded-xl bg-rpd-primary text-white font-bold disabled:opacity-40"
                >
                  Generate + Sign
                </button>
              </div>
            </div>
          )}

          {(phase === "generating" || phase === "signing" || phase === "submitting") && (
            <div className="rounded-xl border border-rpd-primary/20 bg-black/30 p-4 font-mono text-xs space-y-1 mt-4">
              <p className={phase === "generating" ? "text-rpd-primary" : "text-rpd-gray/60"}>
                {phase === "generating" ? "▸" : "✓"} Generating BJJ keypair…
              </p>
              <p
                className={
                  phase === "signing"
                    ? "text-rpd-primary"
                    : phase === "submitting"
                      ? "text-rpd-gray/60"
                      : "text-rpd-gray/40"
                }
              >
                {phase === "signing" ? "▸" : phase === "submitting" ? "✓" : "○"} Waiting for wallet signature…
              </p>
              <p className={phase === "submitting" ? "text-rpd-primary" : "text-rpd-gray/40"}>
                {phase === "submitting" ? "▸" : "○"} Submitting to registry…
              </p>
            </div>
          )}

          {phase === "success" && newSecret && (
            <div className="space-y-4">
              <div className="rounded-xl border border-rpd-primary/30 bg-rpd-primary/5 p-4">
                <p className="text-rpd-primary font-semibold mb-1">
                  ✓ Registration complete
                </p>
                <p className="text-rpd-gray text-xs">
                  Your BabyJubjub identity is now bound to this Solana address
                  and will appear in the next snapshot refresh. The secret below
                  is the ONLY way to prove ownership — back it up before closing
                  this page.
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 flex justify-center">
                <QRCodeSVG value={qrPayload} size={224} level="M" />
              </div>

              <div>
                <p className="text-rpd-gray/60 text-xs font-mono uppercase mb-2">
                  BJJ secret (hex backup)
                </p>
                <p className="text-white font-mono text-[10px] break-all p-3 bg-black/40 rounded-lg border border-white/10">
                  {hexBackup}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(hexBackup)}
                  className="mt-2 text-xs text-rpd-primary hover:text-rpd-primary/80"
                >
                  Copy to clipboard
                </button>
              </div>

              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
                <p className="text-yellow-400 font-semibold text-sm mb-2">Next step</p>
                <ol className="text-rpd-gray text-xs space-y-1 list-decimal list-inside">
                  <li>Open the Telegram bot and tap the Mini App button.</li>
                  <li>Choose "Scan registration QR" inside the Mini App.</li>
                  <li>Scan the QR above — or paste the hex secret.</li>
                  <li>The Mini App stores it locally and generates proofs.</li>
                </ol>
              </div>
            </div>
          )}

          {phase === "error" && (
            <div className="text-center py-4">
              <p className="text-red-400 font-semibold mb-2">Error</p>
              <p className="text-rpd-gray text-sm mb-3 break-words">{error}</p>
              <button
                onClick={checkStatus}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        <p className="text-rpd-gray/40 text-xs text-center mt-6 leading-relaxed">
          The bot never learns which Solana address registered. The registry
          stores the binding only to keep the snapshot in sync with on-chain
          balances; once registered, every proof carries only the BJJ identity.
        </p>
      </main>
    </div>
  );
}
