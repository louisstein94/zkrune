"use client";

import { useCallback, useEffect, useState } from "react";

import {
  bjjSecretFromHex,
  clearBjjSecretLocal,
  decodeBjjSecretQr,
  deriveBjjPubkey,
  loadBjjSecretLocal,
  saveBjjSecretLocal,
} from "@/lib/bjj";

const TOKEN = {
  symbol: "RPD",
  name: "Red Panda",
  mint: "BeSKJL54vJ8VeqhPBXeHMgFMJnbHxfDN3pARDmvApump",
  threshold: 10_000_000,
};

const REGISTER_URL =
  process.env.NEXT_PUBLIC_REGISTER_URL || "https://rpd-whale-web.vercel.app/register";
const BOT_API =
  (process.env.NEXT_PUBLIC_BOT_API_URL || "https://zkrune-production.up.railway.app").replace(/\/$/, "");

type Phase =
  | "loading-key"
  | "no-key"
  | "fetching-snapshot"
  | "not-in-snapshot"
  | "ready"
  | "proving"
  | "verified"
  | "submitted"
  | "error";

interface TreeEntry {
  balance: string;
  index: number;
  pathElements: string[];
  pathIndices: number[];
  bjjPubkeyY: string;
}

interface SnapshotV2 {
  meta: {
    circuit: "whale-holder-v2";
    root: string;
    depth: number;
    blockHeight: number;
    timestamp: string;
    totalWhales: number;
    totalRegistered: number;
    totalPending: number;
  };
  tree: Record<string, TreeEntry>;
  pending: Record<string, { balance: string }>;
}

export default function RpdVerifier() {
  const [phase, setPhase] = useState<Phase>("loading-key");
  const [bjjSk, setBjjSk] = useState<bigint | null>(null);
  const [pasteInput, setPasteInput] = useState("");
  const [entry, setEntry] = useState<(TreeEntry & { pkX: string }) | null>(null);
  const [snapshotRoot, setSnapshotRoot] = useState<string | null>(null);
  const [snapshotTs, setSnapshotTs] = useState<string | null>(null);
  const [proofLines, setProofLines] = useState<string[]>([]);
  const [nullifier, setNullifier] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [inTelegram, setInTelegram] = useState(false);
  const [tgUser, setTgUser] = useState<{ id: number; name: string } | null>(null);

  const addLine = (line: string) => setProofLines((prev) => [...prev, line]);

  // ── Boot: detect Telegram + load locally-stored BJJ secret ──────────────
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setInTelegram(true);
      try { tg.ready(); tg.expand(); } catch {}
      const u = tg.initDataUnsafe.user;
      if (u) setTgUser({ id: u.id, name: u.first_name || u.username || `tg-${u.id}` });
    }

    const sk = loadBjjSecretLocal();
    if (sk) {
      setBjjSk(sk);
      setPhase("fetching-snapshot");
    } else {
      setPhase("no-key");
    }
  }, []);

  // ── Look the user up in the live snapshot ────────────────────────────────
  const lookup = useCallback(async (sk: bigint) => {
    setPhase("fetching-snapshot");
    setErrorMsg("");
    try {
      const pk = await deriveBjjPubkey(sk);
      const pkX = pk.x.toString();

      const res = await fetch(`${BOT_API}/snapshot.json`, { cache: "no-store" });
      if (!res.ok) throw new Error("Snapshot not available from bot");
      const snap = (await res.json()) as SnapshotV2;

      setSnapshotRoot(snap.meta.root);
      setSnapshotTs(snap.meta.timestamp);

      const treeEntry = snap.tree[pkX];
      if (!treeEntry) {
        setPhase("not-in-snapshot");
        return;
      }

      setEntry({ ...treeEntry, pkX });
      setPhase("ready");
    } catch (e: any) {
      setErrorMsg(e.message || "Snapshot lookup failed");
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    if (bjjSk && phase === "fetching-snapshot") lookup(bjjSk);
  }, [bjjSk, phase, lookup]);

  // ── QR scan handler ──────────────────────────────────────────────────────
  const handleScanQr = () => {
    const tg = window.Telegram?.WebApp;
    if (!tg || !tg.showScanQrPopup) {
      setErrorMsg(
        "QR scanning is not supported here — paste the hex backup below instead.",
      );
      return;
    }
    tg.showScanQrPopup({ text: "Scan the BJJ registration QR" }, (raw: string) => {
      try {
        tg.closeScanQrPopup?.();
      } catch {}
      const sk = decodeBjjSecretQr(raw);
      if (!sk) {
        setErrorMsg("That QR does not look like a zkRune BJJ registration code.");
        return;
      }
      saveBjjSecretLocal(sk);
      setBjjSk(sk);
      setPasteInput("");
      setErrorMsg("");
      setPhase("fetching-snapshot");
    });
  };

  const handlePasteImport = () => {
    try {
      const sk = bjjSecretFromHex(pasteInput);
      saveBjjSecretLocal(sk);
      setBjjSk(sk);
      setPasteInput("");
      setErrorMsg("");
      setPhase("fetching-snapshot");
    } catch (e: any) {
      setErrorMsg(`Invalid hex: ${e.message}`);
    }
  };

  const handleForgetKey = () => {
    clearBjjSecretLocal();
    setBjjSk(null);
    setEntry(null);
    setSnapshotRoot(null);
    setPhase("no-key");
  };

  // ── Proof generation ─────────────────────────────────────────────────────
  const generateProof = async () => {
    if (!entry || !bjjSk || !snapshotRoot) return;
    setPhase("proving");
    setProofLines([]);
    setNullifier(null);
    setErrorMsg("");

    try {
      addLine("> Initializing snarkjs (Groth16)…");
      const snarkjs = (await import("snarkjs")) as any;

      addLine("> Circuit: WhaleHolderProofV2(depth=20)");
      addLine(`> Public:  root=${snapshotRoot.slice(0, 18)}…`);
      addLine("> Loading WASM + zkey…");

      const cv = process.env.NEXT_PUBLIC_CIRCUIT_V || "";
      const qs = cv ? `?v=${cv}` : "";

      const input = {
        bjjSk: bjjSk.toString(),
        balance: entry.balance,
        pathElements: entry.pathElements,
        pathIndices: entry.pathIndices.map(String),
        root: snapshotRoot,
        minimumBalance: TOKEN.threshold.toString(),
      };

      addLine("> Proving in browser (~1–3s)…");
      const t0 = Date.now();
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        `/circuits-v2/whale-holder-v2.wasm${qs}`,
        `/circuits-v2/whale-holder-v2.zkey${qs}`,
      );
      const ms = Date.now() - t0;

      addLine("> Self-verifying…");
      const vKey = await (
        await fetch(`/circuits-v2/whale-holder-v2_vkey.json${qs}`)
      ).json();
      const ok = await snarkjs.groth16.verify(vKey, publicSignals, proof);

      if (ok && publicSignals[0] === "1") {
        addLine(`> ✓ Merkle inclusion verified`);
        addLine(`> ✓ Ownership proof verified (BJJ scalar mult)`);
        addLine(`> ✓ Generated in ${(ms / 1000).toFixed(2)}s`);
        setNullifier(publicSignals[1]);
        setPhase("verified");
        try {
          window.Telegram?.WebApp.HapticFeedback?.notificationOccurred("success");
        } catch {}

        // Stash payload on window so submitToBot can pick it up. Address is
        // NOT included anywhere — the bot only sees BJJ-bound public signals.
        (window as any).__rpdProofPayload = {
          circuit: "whale-holder-v2",
          protocol: "groth16",
          curve: "bn254",
          depth: 20,
          token: TOKEN.symbol,
          mint: TOKEN.mint,
          minimumBalance: TOKEN.threshold,
          snapshotRoot,
          hasMinimum: publicSignals[0],
          nullifier: publicSignals[1],
          proof,
          publicSignals,
          tgInitData: window.Telegram?.WebApp?.initData || undefined,
          generatedAt: new Date().toISOString(),
        };
      } else {
        addLine("> ✗ Proof invalid.");
        setErrorMsg("Proof self-verification failed.");
        setPhase("error");
      }
    } catch (e: any) {
      addLine(`> ✗ ${e.message}`);
      setErrorMsg(e.message || "Proof generation failed.");
      setPhase("error");
    }
  };

  const submitToBot = () => {
    const payload = (window as any).__rpdProofPayload;
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setErrorMsg("Telegram WebApp not available — open this page from inside the bot.");
      setPhase("error");
      return;
    }
    if (!payload) {
      setErrorMsg("No proof payload — please regenerate.");
      setPhase("error");
      return;
    }
    try {
      tg.sendData(JSON.stringify(payload));
      setPhase("submitted");
      setTimeout(() => { try { tg.close(); } catch {} }, 800);
    } catch (e: any) {
      setErrorMsg(`Could not send proof to bot: ${e.message}`);
      setPhase("error");
    }
  };

  const reset = () => {
    setProofLines([]);
    setNullifier(null);
    setErrorMsg("");
    if (bjjSk) setPhase("fetching-snapshot");
    else setPhase("no-key");
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-rpd-darker text-white">
      <main className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rpd-primary/30 bg-rpd-primary/10 text-rpd-primary text-xs font-mono mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-rpd-primary animate-pulse" />
            BabyJubjub-bound proof · v2
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            🐼 {TOKEN.name} <span className="text-rpd-primary">Whale</span>
          </h1>
          <p className="text-rpd-gray text-sm max-w-md mx-auto">
            Prove ownership of a registered {TOKEN.symbol} whale identity. Your
            Solana address never enters the proof or the bot — only the BJJ
            identity you bound at registration.
          </p>
          {tgUser && (
            <p className="text-rpd-gray/60 text-xs mt-2 font-mono">
              tg: @{tgUser.name} (#{tgUser.id})
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {phase !== "no-key" && phase !== "submitted" && phase !== "loading-key" && (
                <button
                  onClick={reset}
                  className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-rpd-gray hover:text-white hover:border-white/30"
                >
                  ←
                </button>
              )}
              <h2 className="text-sm text-white">Access Gate</h2>
            </div>
            {bjjSk && entry && (
              <button
                onClick={handleForgetKey}
                className="text-rpd-gray/60 hover:text-red-400 text-[10px] font-mono uppercase"
              >
                Forget key
              </button>
            )}
          </div>

          <div className="p-5">
            {(phase === "loading-key" || phase === "fetching-snapshot") && (
              <div className="text-center py-8">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-rpd-primary/30 border-t-rpd-primary animate-spin" />
                <p className="text-rpd-gray text-sm">
                  {phase === "loading-key" ? "Loading…" : "Querying snapshot…"}
                </p>
              </div>
            )}

            {phase === "no-key" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
                  <p className="text-yellow-400 font-semibold text-sm mb-1">No identity stored</p>
                  <p className="text-rpd-gray text-xs leading-relaxed">
                    You need to bind a BabyJubjub identity to your Solana wallet
                    first. This is a one-time browser flow — open it on the
                    public web, sign once, then come back and scan the QR.
                  </p>
                </div>

                <a
                  href={REGISTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 rounded-xl border border-rpd-primary/40 text-rpd-primary font-bold"
                >
                  Open registration page ↗
                </a>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-rpd-gray/40 text-xs">already registered?</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                <button
                  onClick={handleScanQr}
                  className="w-full py-3 rounded-xl bg-rpd-primary text-white font-bold"
                >
                  📷 Scan registration QR
                </button>

                <div>
                  <p className="text-rpd-gray/60 text-xs font-mono uppercase mb-2">
                    Or paste hex backup
                  </p>
                  <input
                    type="text"
                    value={pasteInput}
                    onChange={(e) => setPasteInput(e.target.value)}
                    placeholder="62-character hex secret"
                    className="w-full px-3 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white font-mono text-xs placeholder:text-rpd-gray/30 focus:outline-none focus:border-rpd-primary/40"
                  />
                  <button
                    onClick={handlePasteImport}
                    disabled={!pasteInput}
                    className="mt-2 w-full py-2.5 rounded-lg border border-white/15 text-white text-sm disabled:opacity-40"
                  >
                    Import secret
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-red-400 text-xs">{errorMsg}</p>
                )}
              </div>
            )}

            {phase === "not-in-snapshot" && (
              <div className="text-center py-6 space-y-3">
                <p className="text-yellow-400 font-semibold">Not in current snapshot</p>
                <p className="text-rpd-gray text-sm">
                  Your registered identity is not in the current snapshot tree.
                  This usually means the snapshot has not refreshed since your
                  registration — wait for the next cycle (every 6 h) or check
                  the registration page again.
                </p>
                <p className="text-rpd-gray/60 text-xs">
                  Snapshot taken {snapshotTs ? new Date(snapshotTs).toLocaleString() : "?"}
                </p>
              </div>
            )}

            {phase === "ready" && entry && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-rpd-gray/50 text-xs font-mono">Balance</p>
                      <p className="font-semibold text-rpd-primary">
                        {Number(entry.balance).toLocaleString("en-US")} {TOKEN.symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-rpd-gray/50 text-xs font-mono">Snapshot</p>
                      <p className="text-white text-xs">
                        {snapshotTs ? new Date(snapshotTs).toLocaleDateString() : "?"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateProof}
                  className="w-full py-3 rounded-xl bg-rpd-primary text-white font-bold"
                >
                  Generate ZK Proof
                </button>
              </div>
            )}

            {phase === "proving" && (
              <div className="rounded-xl border border-rpd-primary/20 bg-black/50 p-4 font-mono text-xs space-y-1 min-h-[180px]">
                {proofLines.map((line, i) => (
                  <p
                    key={i}
                    className={
                      line.includes("✓")
                        ? "text-rpd-primary"
                        : line.includes("✗")
                          ? "text-red-400"
                          : "text-rpd-gray/80"
                    }
                  >
                    {line}
                  </p>
                ))}
                <span className="inline-block w-1.5 h-3 bg-rpd-primary animate-pulse" />
              </div>
            )}

            {phase === "verified" && nullifier && (
              <div className="space-y-4">
                <div className="rounded-xl border border-rpd-primary/30 bg-rpd-primary/5 p-4">
                  <p className="text-rpd-primary font-semibold mb-1">✓ Proof generated</p>
                  <p className="text-rpd-gray text-xs">
                    Ownership of your BJJ identity is proven inside the circuit.
                    Neither your address nor your balance appears in the proof —
                    only the snapshot root and the threshold claim are public.
                  </p>
                </div>

                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                  <p className="text-yellow-400 text-xs font-semibold mb-1">Nullifier</p>
                  <p className="text-white font-mono text-xs break-all">{nullifier}</p>
                </div>

                {inTelegram ? (
                  <button
                    onClick={submitToBot}
                    className="w-full py-3 rounded-xl bg-rpd-primary text-white font-bold"
                  >
                    Submit to Bot
                  </button>
                ) : (
                  <p className="text-rpd-gray text-xs text-center">
                    Open this page from inside the Telegram bot to auto-submit.
                  </p>
                )}
              </div>
            )}

            {phase === "submitted" && (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🐼</div>
                <p className="text-rpd-primary font-semibold mb-1">Proof sent to bot</p>
                <p className="text-rpd-gray text-sm">
                  Check your chat with the bot for the invite link.
                </p>
              </div>
            )}

            {phase === "error" && (
              <div className="text-center py-6">
                <p className="text-red-400 font-semibold mb-2">Error</p>
                <p className="text-rpd-gray text-sm mb-4 break-words">{errorMsg}</p>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg border border-white/10 text-sm"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-rpd-gray/40 text-xs text-center mt-4">
          whale-holder-v2.circom · Groth16 · BabyJubjub + Poseidon · depth=20
        </p>
      </main>
    </div>
  );
}
