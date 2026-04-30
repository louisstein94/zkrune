'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { addressToField, type Snapshot } from '@/lib/merkle';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false },
);

const TOKEN = {
  symbol: 'RPD',
  name: 'Red Panda',
  mint: 'BeSKJL54vJ8VeqhPBXeHMgFMJnbHxfDN3pARDmvApump',
  threshold: 10_000_000,
  thresholdPercent: 1,
  snapshotUrl: '/snapshot.json',
};

type Phase =
  | 'input'
  | 'fetching'
  | 'ready'
  | 'proving'
  | 'verified'
  | 'submitted'
  | 'not_found'
  | 'insufficient'
  | 'error';

interface PathData {
  address: string;
  balance: string;
  index: number;
  pathElements: string[];
  pathIndices: number[];
  root: string;
  snapshotTimestamp: string;
  snapshotBlock: number;
  totalHolders: number;
}

interface ProofResult {
  publicSignals: string[];
  rawProof: any;
  snapshotRoot: string;
  snapshotBlock: number;
  nullifier: string;
  nullifierSecret: string;
  timing: number;
}

let snapshotCache: Snapshot | null = null;

async function loadSnapshot(): Promise<Snapshot> {
  if (snapshotCache) return snapshotCache;
  const res = await fetch(TOKEN.snapshotUrl);
  if (!res.ok) throw new Error('Failed to load snapshot.');
  snapshotCache = (await res.json()) as Snapshot;
  return snapshotCache;
}

export default function RpdVerifier() {
  const { publicKey, connected } = useWallet();

  const [phase, setPhase] = useState<Phase>('input');
  const [addressInput, setAddressInput] = useState('');
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [proofLines, setProofLines] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [snapshotTimestamp, setSnapshotTimestamp] = useState<string | null>(null);
  const [nullifierSecret, setNullifierSecret] = useState<string>('');
  const [tgUser, setTgUser] = useState<{ id: number; name: string } | null>(null);
  const [inTelegram, setInTelegram] = useState(false);

  // Boot Telegram WebApp + capture user
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    setInTelegram(true);
    try {
      tg.ready();
      tg.expand();
    } catch {}
    const u = tg.initDataUnsafe.user;
    if (u) setTgUser({ id: u.id, name: u.first_name || u.username || `tg-${u.id}` });
  }, []);

  // Fresh nullifierSecret on mount (BN254 field element)
  useEffect(() => {
    const bytes = new Uint8Array(31);
    crypto.getRandomValues(bytes);
    const secret = BigInt(
      '0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(''),
    );
    setNullifierSecret(secret.toString());
  }, []);

  // Auto-fill from connected wallet
  useEffect(() => {
    if (connected && publicKey) setAddressInput(publicKey.toBase58());
  }, [connected, publicKey]);

  const addLine = (line: string) => setProofLines((prev) => [...prev, line]);

  const fetchPath = useCallback(async (address: string) => {
    setPhase('fetching');
    setErrorMsg('');
    try {
      const snap = await loadSnapshot();
      const entry = snap.entries[address];
      if (!entry) {
        setSnapshotTimestamp(snap.meta.timestamp);
        setPhase('not_found');
        return;
      }
      setPathData({
        address,
        balance: entry.balance,
        index: entry.index,
        pathElements: entry.pathElements,
        pathIndices: entry.pathIndices,
        root: snap.meta.root,
        snapshotTimestamp: snap.meta.timestamp,
        snapshotBlock: snap.meta.blockHeight,
        totalHolders: snap.meta.totalHolders,
      });
      setPhase(BigInt(entry.balance) >= BigInt(TOKEN.threshold) ? 'ready' : 'insufficient');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Network error');
      setPhase('error');
    }
  }, []);

  const generateProof = async () => {
    if (!pathData) return;
    setPhase('proving');
    setProofLines([]);

    try {
      addLine('> Initializing snarkjs (Groth16)...');
      const snarkjs = (await import('snarkjs')) as any;

      addLine(`> Circuit: WhaleHolderProof(depth=20)`);
      addLine(`> Public:  root=${pathData.root.slice(0, 18)}... · min=${TOKEN.threshold.toLocaleString('en-US')}`);
      addLine('> Loading WASM + zkey...');

      const inputs = {
        address: addressToField(pathData.address).toString(),
        balance: pathData.balance,
        pathElements: pathData.pathElements,
        pathIndices: pathData.pathIndices.map(String),
        nullifierSecret,
        root: pathData.root,
        minimumBalance: TOKEN.threshold.toString(),
      };

      const cv = process.env.NEXT_PUBLIC_CIRCUIT_V || '';
      const qs = cv ? `?v=${cv}` : '';

      const t0 = Date.now();
      addLine('> Proving in browser (10–40s)...');
      const { proof: rawProof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        `/circuits/whale-holder.wasm${qs}`,
        `/circuits/whale-holder.zkey${qs}`,
      );

      addLine('> Verifying...');
      const vKey = await (await fetch(`/circuits/whale-holder_vkey.json${qs}`)).json();
      const ok = await snarkjs.groth16.verify(vKey, publicSignals, rawProof);
      const timing = Date.now() - t0;

      if (ok && publicSignals[0] === '1') {
        const nullifier = publicSignals[1];
        addLine(`> ✓ Merkle inclusion verified`);
        addLine(`> ✓ hasMinimum = 1`);
        addLine(`> ✓ Generated in ${(timing / 1000).toFixed(2)}s`);
        setProofResult({
          publicSignals,
          rawProof,
          snapshotRoot: pathData.root,
          snapshotBlock: pathData.snapshotBlock,
          nullifier,
          nullifierSecret,
          timing,
        });
        setPhase('verified');
        try { window.Telegram?.WebApp.HapticFeedback?.notificationOccurred('success'); } catch {}
      } else {
        addLine('> ✗ Proof invalid.');
        setErrorMsg('Proof verification failed.');
        setPhase('error');
      }
    } catch (err: any) {
      addLine(`> ✗ ${err.message}`);
      setErrorMsg(err.message ?? 'Proof generation failed.');
      setPhase('error');
    }
  };

  const buildPayload = () => {
    if (!proofResult) return null;
    return {
      circuit: 'whale-holder',
      protocol: 'groth16',
      curve: 'bn254',
      depth: 20,
      token: TOKEN.symbol,
      mint: TOKEN.mint,
      minimumBalance: TOKEN.threshold,
      snapshotRoot: proofResult.snapshotRoot,
      snapshotBlock: proofResult.snapshotBlock,
      hasMinimum: proofResult.publicSignals[0],
      nullifier: proofResult.nullifier,
      proof: proofResult.rawProof,
      publicSignals: proofResult.publicSignals,
      generatedAt: new Date().toISOString(),
    };
  };

  const submitToBot = () => {
    const payload = buildPayload();
    if (!payload) return;
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setErrorMsg('Telegram WebApp not available — open this page from inside the bot.');
      setPhase('error');
      return;
    }
    try {
      tg.sendData(JSON.stringify(payload));
      setPhase('submitted');
      // sendData triggers the bot to receive the proof; close after a beat
      setTimeout(() => { try { tg.close(); } catch {} }, 800);
    } catch (err: any) {
      setErrorMsg(`Could not send proof to bot: ${err.message}`);
      setPhase('error');
    }
  };

  const downloadJson = () => {
    const payload = buildPayload();
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rpd-whale-proof.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setPhase('input');
    setPathData(null);
    setProofResult(null);
    setProofLines([]);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-rpd-darker text-white">
      <main className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rpd-primary/30 bg-rpd-primary/10 text-rpd-primary text-xs font-mono mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-rpd-primary animate-pulse" />
            Snapshot Merkle Proof
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            🐼 {TOKEN.name} <span className="text-rpd-primary">Whale</span>
          </h1>
          <p className="text-rpd-gray text-sm max-w-md mx-auto">
            Prove you hold {TOKEN.thresholdPercent}%+
            ({TOKEN.threshold.toLocaleString('en-US')} {TOKEN.symbol})
            without revealing your address or balance.
          </p>
          {tgUser && (
            <p className="text-rpd-gray/60 text-xs mt-2 font-mono">
              tg: @{tgUser.name} (#{tgUser.id})
            </p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">

          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {phase !== 'input' && phase !== 'submitted' && (
                <button
                  onClick={reset}
                  className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-rpd-gray hover:text-white hover:border-white/30"
                >
                  ←
                </button>
              )}
              <h2 className="text-sm text-white">Access Gate</h2>
            </div>
            {pathData && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${
                BigInt(pathData.balance) >= BigInt(TOKEN.threshold)
                  ? 'bg-rpd-primary/10 border-rpd-primary/30 text-rpd-primary'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {BigInt(pathData.balance) >= BigInt(TOKEN.threshold) ? '🐋 Whale' : '✗ Below'}
              </span>
            )}
          </div>

          <div className="p-5">

            {phase === 'input' && (
              <div className="space-y-4">
                <p className="text-rpd-gray text-xs leading-relaxed">
                  Your address is used only to look up your Merkle path locally.
                  It enters the circuit as a <span className="text-white">private witness</span> —
                  never sent anywhere.
                </p>

                <div>
                  <p className="text-rpd-gray/60 text-xs font-mono uppercase mb-2">
                    Connect wallet
                  </p>
                  <WalletMultiButton />
                  {connected && publicKey && (
                    <p className="text-rpd-primary text-xs font-mono mt-2">
                      ✓ {publicKey.toBase58().slice(0, 8)}…{publicKey.toBase58().slice(-6)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-rpd-gray/40 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addressInput && fetchPath(addressInput)}
                  placeholder="Paste Solana address"
                  className="w-full px-3 py-2.5 rounded-lg bg-black/30 border border-white/10 text-white font-mono text-sm placeholder:text-rpd-gray/30 focus:outline-none focus:border-rpd-primary/40"
                />

                <button
                  onClick={() => addressInput && fetchPath(addressInput)}
                  disabled={!addressInput}
                  className="w-full py-3 rounded-xl bg-rpd-primary text-white font-bold disabled:opacity-40"
                >
                  Look Up in Snapshot
                </button>
              </div>
            )}

            {phase === 'fetching' && (
              <div className="text-center py-8">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-rpd-primary/30 border-t-rpd-primary animate-spin" />
                <p className="text-rpd-gray text-sm">Querying snapshot...</p>
              </div>
            )}

            {phase === 'not_found' && (
              <div className="text-center py-6 space-y-3">
                <p className="text-yellow-400 font-semibold">Address not in snapshot</p>
                <p className="text-rpd-gray text-sm">
                  Snapshot was taken on{' '}
                  {snapshotTimestamp ? new Date(snapshotTimestamp).toLocaleDateString() : 'unknown date'}.
                  You may have acquired tokens after that block.
                </p>
                <button onClick={reset} className="px-4 py-2 rounded-lg border border-white/10 text-sm">
                  Try Another Address
                </button>
              </div>
            )}

            {(phase === 'ready' || phase === 'insufficient') && pathData && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-rpd-gray/50 text-xs font-mono">Balance</p>
                      <p className={`font-semibold ${BigInt(pathData.balance) >= BigInt(TOKEN.threshold) ? 'text-rpd-primary' : 'text-white'}`}>
                        {Number(pathData.balance).toLocaleString('en-US')} {TOKEN.symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-rpd-gray/50 text-xs font-mono">Holders</p>
                      <p className="text-white font-semibold">{pathData.totalHolders.toLocaleString('en-US')}</p>
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${BigInt(pathData.balance) >= BigInt(TOKEN.threshold) ? 'bg-rpd-primary' : 'bg-red-500/60'}`}
                      style={{ width: `${Math.min((Number(pathData.balance) / TOKEN.threshold) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {BigInt(pathData.balance) >= BigInt(TOKEN.threshold) ? (
                  <button
                    onClick={generateProof}
                    className="w-full py-3 rounded-xl bg-rpd-primary text-white font-bold"
                  >
                    Generate ZK Proof
                  </button>
                ) : (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                    <p className="text-red-400 font-semibold">Below Threshold</p>
                    <p className="text-rpd-gray text-sm mt-1">
                      Need {TOKEN.threshold.toLocaleString('en-US')} {TOKEN.symbol}.
                      Short by {(TOKEN.threshold - Number(pathData.balance)).toLocaleString('en-US')}.
                    </p>
                  </div>
                )}
              </div>
            )}

            {phase === 'proving' && (
              <div className="rounded-xl border border-rpd-primary/20 bg-black/50 p-4 font-mono text-xs space-y-1 min-h-[180px]">
                {proofLines.map((line, i) => (
                  <p
                    key={i}
                    className={
                      line.includes('✓') ? 'text-rpd-primary' :
                      line.includes('✗') ? 'text-red-400' :
                      'text-rpd-gray/80'
                    }
                  >{line}</p>
                ))}
                <span className="inline-block w-1.5 h-3 bg-rpd-primary animate-pulse" />
              </div>
            )}

            {phase === 'verified' && proofResult && (
              <div className="space-y-4">
                <div className="rounded-xl border border-rpd-primary/30 bg-rpd-primary/5 p-4">
                  <p className="text-rpd-primary font-semibold mb-1">✓ Proof generated</p>
                  <p className="text-rpd-gray text-xs">
                    Address and balance never appeared in the proof. Only hasMinimum=1
                    and the snapshot root are public.
                  </p>
                </div>

                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                  <p className="text-yellow-400 text-xs font-semibold mb-1">Nullifier</p>
                  <p className="text-white font-mono text-xs break-all">{proofResult.nullifier}</p>
                </div>

                {inTelegram ? (
                  <button
                    onClick={submitToBot}
                    className="w-full py-3 rounded-xl bg-rpd-primary text-white font-bold"
                  >
                    Submit to Bot
                  </button>
                ) : (
                  <>
                    <p className="text-rpd-gray text-xs text-center">
                      Open this page from inside the Telegram bot to auto-submit.
                      Or download the proof and forward it manually.
                    </p>
                    <button
                      onClick={downloadJson}
                      className="w-full py-3 rounded-xl border border-white/15 text-white"
                    >
                      Download Proof JSON
                    </button>
                  </>
                )}
              </div>
            )}

            {phase === 'submitted' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🐼</div>
                <p className="text-rpd-primary font-semibold mb-1">Proof sent to bot</p>
                <p className="text-rpd-gray text-sm">
                  Check your chat with the bot for the invite link.
                </p>
              </div>
            )}

            {phase === 'error' && (
              <div className="text-center py-6">
                <p className="text-red-400 font-semibold mb-2">Error</p>
                <p className="text-rpd-gray text-sm mb-4">{errorMsg}</p>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg border border-white/10 text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-rpd-gray/40 text-xs text-center mt-4">
          whale-holder.circom · Groth16 · Poseidon · depth=20
        </p>
      </main>
    </div>
  );
}
