'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navigation from '@/components/Navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { addressToField } from '@/lib/merkle';

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
  { ssr: false },
);

const WHALE_THRESHOLD_PERCENT = 1;
const WHALE_THRESHOLD = 10_000_000; // 1% of 1B supply
const TELEGRAM_LINK = process.env.NEXT_PUBLIC_WHALE_CHAT_LINK ?? '';

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase =
  | 'input'       // enter / connect address
  | 'fetching'    // fetching Merkle path from API
  | 'ready'       // path found, ready to prove
  | 'proving'     // proof running in browser
  | 'verified'    // proof valid
  | 'not_found'   // address not in snapshot
  | 'insufficient'// balance < threshold
  | 'error';

interface MerklePathResponse {
  address: string;
  balance: string;    // decimal string (bigint) — use BigInt(balance) for circuit input
  index: number;
  pathElements: string[];
  pathIndices: number[];
  root: string;
  snapshotTimestamp: string;
  snapshotBlock: number;
  totalHolders: number;
}

interface ProofResult {
  proofHash: string;
  publicSignals: string[]; // [hasMinimum, nullifier, root, minimumBalance]
  timing: number;
  rawProof: any;
  snapshotRoot: string;
  snapshotBlock: number;
  nullifier: string;
  nullifierSecret: string;
}

// ── Snapshot cache (loaded once per session) ──────────────────────────────────
let snapshotCache: import('@/lib/merkle').Snapshot | null = null;

async function loadSnapshot(): Promise<import('@/lib/merkle').Snapshot> {
  if (snapshotCache) return snapshotCache;
  const res = await fetch('/snapshot.json');
  if (!res.ok) throw new Error('Failed to load snapshot. Please try again later.');
  snapshotCache = await res.json();
  return snapshotCache!;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WhaleChatPage() {
  const { publicKey, connected } = useWallet();

  const [phase, setPhase] = useState<Phase>('input');
  const [addressInput, setAddressInput] = useState('');
  const [pathData, setPathData] = useState<MerklePathResponse | null>(null);
  const [proofResult, setProofResult] = useState<ProofResult | null>(null);
  const [proofLines, setProofLines] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [snapshotTimestamp, setSnapshotTimestamp] = useState<string | null>(null);
  const [nullifierSecret, setNullifierSecret] = useState<string>('');

  // Generate a fresh random nullifierSecret on mount
  useEffect(() => {
    const bytes = new Uint8Array(31); // 248 bits — fits in BN254 field
    crypto.getRandomValues(bytes);
    const secret = BigInt('0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(''));
    setNullifierSecret(secret.toString());
  }, []);

  // Auto-fill address from connected wallet
  useEffect(() => {
    if (connected && publicKey) {
      setAddressInput(publicKey.toBase58());
    }
  }, [connected, publicKey]);

  const addLine = (line: string) => setProofLines((prev) => [...prev, line]);

  // ── Fetch Merkle path (client-side lookup from static /snapshot.json) ────────
  const fetchPath = useCallback(async (address: string) => {
    setPhase('fetching');
    setErrorMsg('');

    try {
      const snapshot = await loadSnapshot();
      const entry = snapshot.entries[address];

      if (!entry) {
        setSnapshotTimestamp(snapshot.meta.timestamp);
        setPhase('not_found');
        return;
      }

      const pathData: MerklePathResponse = {
        address,
        balance:           entry.balance,
        index:             entry.index,
        pathElements:      entry.pathElements,
        pathIndices:       entry.pathIndices,
        root:              snapshot.meta.root,
        snapshotTimestamp: snapshot.meta.timestamp,
        snapshotBlock:     snapshot.meta.blockHeight,
        totalHolders:      snapshot.meta.totalHolders,
      };

      setPathData(pathData);

      if (BigInt(entry.balance) < BigInt(WHALE_THRESHOLD)) {
        setPhase('insufficient');
      } else {
        setPhase('ready');
      }
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Network error');
      setPhase('error');
    }
  }, []);

  // ── ZK Proof generation ────────────────────────────────────────────────────
  const generateProof = async () => {
    if (!pathData) return;

    setPhase('proving');
    setProofLines([]);

    try {
      addLine('> Initializing snarkjs (Groth16)...');
      await new Promise((r) => setTimeout(r, 300));

      const snarkjs = (await import('snarkjs')) as any;

      addLine(`> Circuit: WhaleHolderProof(depth=20)`);
      addLine(`> Private inputs: address=[REDACTED], balance=[REDACTED]`);
      addLine(`>                 nullifierSecret=[REDACTED]`);
      addLine(`>                 pathElements=[...20 hashes...]`);
      addLine(`> Public inputs:  root=${pathData.root.slice(0, 18)}...`);
      addLine(`>                 minimumBalance=${WHALE_THRESHOLD.toLocaleString('en-US')}`);
      await new Promise((r) => setTimeout(r, 400));

      addLine('> Loading circuit WASM & proving key...');

      const inputs = {
        address:         addressToField(pathData.address).toString(),
        balance:         pathData.balance, // already a decimal string from API
        pathElements:    pathData.pathElements,
        pathIndices:     pathData.pathIndices.map(String),
        nullifierSecret: nullifierSecret,
        root:            pathData.root,
        minimumBalance:  WHALE_THRESHOLD.toString(),
      };

      const t0 = Date.now();
      addLine('> Generating zk-SNARK proof in browser...');
      addLine('> (This may take 10–40 seconds for depth=20)');

      const { proof: rawProof, publicSignals } = await snarkjs.groth16.fullProve(
        inputs,
        '/circuits/whale-holder.wasm',
        '/circuits/whale-holder.zkey',
      );

      addLine('> Loading verification key...');
      const vKey = await (await fetch('/circuits/whale-holder_vkey.json')).json();

      addLine('> Verifying proof...');
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, rawProof);
      const timing = Date.now() - t0;

      // publicSignals order: [hasMinimum, nullifier, root, minimumBalance]
      if (isValid && publicSignals[0] === '1') {
        const nullifier = publicSignals[1];
        addLine(`> ✓ Merkle inclusion verified — address IS in snapshot`);
        addLine(`> ✓ Balance threshold satisfied (hasMinimum = 1)`);
        addLine(`> ✓ Nullifier: ${nullifier.slice(0, 20)}...`);
        addLine(`> ✓ Proof generated in ${(timing / 1000).toFixed(2)}s`);
        addLine('> ✓ No address or balance disclosed. Access granted.');
        setProofResult({
          proofHash: JSON.stringify(rawProof).substring(0, 66) + '...',
          publicSignals,
          timing,
          rawProof,
          snapshotRoot: pathData.root,
          snapshotBlock: pathData.snapshotBlock,
          nullifier,
          nullifierSecret,
        });
        setPhase('verified');
      } else {
        addLine('> ✗ Proof invalid.');
        setErrorMsg('Proof verification failed. Please try again.');
        setPhase('error');
      }
    } catch (err: any) {
      addLine(`> ✗ Error: ${err.message}`);
      setErrorMsg(err.message ?? 'Proof generation failed.');
      setPhase('error');
    }
  };

  // ── Export proof JSON ──────────────────────────────────────────────────────
  const exportProof = () => {
    if (!proofResult) return;
    const exportData = {
      circuit: 'whale-holder',
      protocol: 'groth16',
      curve: 'bn254',
      depth: 20,
      minimumBalance: WHALE_THRESHOLD,
      snapshotRoot: proofResult.snapshotRoot,
      snapshotBlock: proofResult.snapshotBlock,
      // Public signals — [hasMinimum, nullifier, root, minimumBalance]
      hasMinimum: proofResult.publicSignals[0],
      nullifier: proofResult.nullifier,
      proof: proofResult.rawProof,
      publicSignals: proofResult.publicSignals,
      generatedAt: new Date().toISOString(),
      note: 'No wallet address or exact balance included. Submit to the verifier bot. Nullifier prevents replay.',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zkrune-whale-proof.json';
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

  // ── Terminal box ───────────────────────────────────────────────────────────
  const Terminal = ({ showCursor = false }: { showCursor?: boolean }) => (
    <div className="rounded-2xl border border-zk-primary/20 bg-black/50 p-5 font-mono text-sm min-h-[200px]">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="text-zk-gray/40 text-xs ml-2">whale-holder.circom — Groth16 · depth=20</span>
      </div>
      <div className="space-y-1">
        {proofLines.map((line, i) => (
          <p
            key={i}
            className={
              line.includes('✓') ? 'text-zk-primary' :
              line.includes('✗') ? 'text-red-400' :
              'text-zk-gray/80'
            }
          >
            {line}
          </p>
        ))}
        {showCursor && <span className="inline-block w-2 h-4 bg-zk-primary animate-pulse" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zk-darker text-white">
      <Navigation />

      <main className="pt-24 pb-20 px-4 sm:px-8 max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zk-primary/30 bg-zk-primary/5 text-zk-primary text-sm font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
            Snapshot Merkle Proof
          </div>
          <h1 className="font-hatton text-5xl sm:text-6xl text-white mb-4">
            zkRune <span className="text-zk-primary">Whale</span> Chat
          </h1>
          <p className="text-zk-gray text-lg max-w-2xl mx-auto leading-relaxed">
            Prove you hold{' '}
            <span className="text-white font-semibold">
              {WHALE_THRESHOLD_PERCENT}%+ ({WHALE_THRESHOLD.toLocaleString('en-US')} zkRUNE)
            </span>{' '}
            using a cryptographic Merkle inclusion proof.
            No address revealed. No balance revealed. No screenshot.
          </p>
        </div>

        {/* How it really works */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-10">
          {[
            { n: '01', color: 'text-zk-primary', border: 'border-zk-primary/20', title: 'Snapshot', desc: 'zkRune takes a Poseidon Merkle tree of all holders at a specific block.' },
            { n: '02', color: 'text-purple-400', border: 'border-purple-400/20', title: 'Merkle Path', desc: 'Your address + balance = a leaf. The API returns your path through the tree.' },
            { n: '03', color: 'text-yellow-400', border: 'border-yellow-400/20', title: 'ZK Proof', desc: 'Circuit proves: leaf is in tree (root matches) AND balance ≥ threshold.' },
            { n: '04', color: 'text-blue-400', border: 'border-blue-400/20', title: 'Access', desc: 'Only hasMinimum=1 and the root are public. Address and balance stay private.' },
          ].map((s) => (
            <div key={s.n} className={`p-4 rounded-2xl bg-white/[0.02] border ${s.border} relative overflow-hidden`}>
              <span className={`font-hatton text-4xl ${s.color} opacity-15 absolute top-2 right-3`}>{s.n}</span>
              <p className={`text-xs font-mono ${s.color} uppercase tracking-widest mb-1`}>Step {s.n}</p>
              <p className="text-white text-sm font-semibold mb-1">{s.title}</p>
              <p className="text-zk-gray text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">

          {/* Card header */}
          <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {phase !== 'input' && (
                <button
                  onClick={reset}
                  className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zk-gray hover:text-white hover:border-white/30 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div>
                <h2 className="font-hatton text-lg text-white">Access Gate</h2>
                <p className="text-zk-gray/50 text-xs font-mono">
                  threshold: {WHALE_THRESHOLD.toLocaleString('en-US')} zkRUNE · Poseidon Merkle · depth=20
                </p>
              </div>
            </div>
            {pathData && (
              <div className={`px-3 py-1.5 rounded-full text-xs font-mono border ${
                BigInt(pathData.balance) >= BigInt(WHALE_THRESHOLD)
                  ? 'bg-zk-primary/10 border-zk-primary/30 text-zk-primary'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {BigInt(pathData.balance) >= BigInt(WHALE_THRESHOLD) ? '🐋 Whale' : '✗ Below threshold'}
              </div>
            )}
          </div>

          <div className="p-8">

            {/* ── Phase: input ── */}
            {phase === 'input' && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-zk-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <div className="text-sm text-zk-gray leading-relaxed">
                      Your address is used <span className="text-white">only</span> to fetch your Merkle path from the snapshot.
                      It enters the circuit as a <span className="text-white">private witness</span> — never disclosed in the proof or sent anywhere else.
                    </div>
                  </div>
                </div>

                {/* Wallet connect (auto-fills address) */}
                <div>
                  <p className="text-zk-gray/60 text-xs font-mono uppercase tracking-widest mb-3">
                    Option A — Connect wallet to auto-fill address
                  </p>
                  <div className="flex items-center gap-3">
                    <WalletMultiButton />
                    {connected && publicKey && (
                      <span className="text-zk-primary text-xs font-mono">
                        ✓ {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-6)} auto-filled
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-zk-gray/40 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Manual address input */}
                <div>
                  <p className="text-zk-gray/60 text-xs font-mono uppercase tracking-widest mb-2">
                    Option B — Enter Solana address manually
                  </p>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addressInput && fetchPath(addressInput)}
                    placeholder="7xKp3m...Rn (base58 Solana address)"
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white font-mono text-sm placeholder:text-zk-gray/30 focus:outline-none focus:border-zk-primary/40 transition-colors"
                  />
                </div>

                <button
                  onClick={() => addressInput && fetchPath(addressInput)}
                  disabled={!addressInput}
                  className="w-full py-4 rounded-2xl bg-zk-primary text-white font-bold text-base hover:bg-zk-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Look Up in Snapshot
                </button>
              </div>
            )}

            {/* ── Phase: fetching ── */}
            {phase === 'fetching' && (
              <div className="text-center py-10">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-zk-primary/30 border-t-zk-primary animate-spin" />
                <p className="text-white font-medium mb-1">Querying snapshot...</p>
                <p className="text-zk-gray text-sm">Fetching Merkle path for your address</p>
              </div>
            )}

            {/* ── Phase: not_found ── */}
            {phase === 'not_found' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-1">Address Not in Snapshot</h3>
                  <p className="text-zk-gray text-sm max-w-sm mx-auto">
                    Your address wasn&apos;t in the snapshot taken on{' '}
                    <span className="text-white">
                      {snapshotTimestamp ? new Date(snapshotTimestamp).toLocaleDateString() : 'unknown date'}
                    </span>.
                    You may have acquired tokens after that block.
                  </p>
                  <p className="text-zk-gray/50 text-xs mt-3">
                    Contact the zkRune team to request a snapshot refresh.
                  </p>
                </div>
                <button onClick={reset} className="px-5 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-sm">
                  Try Another Address
                </button>
              </div>
            )}

            {/* ── Phase: ready / insufficient ── */}
            {(phase === 'ready' || phase === 'insufficient') && pathData && (
              <div className="space-y-5">
                {/* Merkle position info */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    {[
                      { label: 'Balance', value: `${Number(pathData.balance).toLocaleString('en-US')} zkRUNE`, highlight: BigInt(pathData.balance) >= BigInt(WHALE_THRESHOLD) },
                      { label: 'Leaf Index', value: `#${pathData.index}` },
                      { label: 'Snapshot Block', value: pathData.snapshotBlock.toLocaleString('en-US') },
                      { label: 'Total Holders', value: pathData.totalHolders.toLocaleString('en-US') },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-zk-gray/50 text-xs font-mono mb-1">{item.label}</p>
                        <p className={`font-semibold text-sm ${item.highlight ? 'text-zk-primary' : 'text-white'}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${BigInt(pathData.balance) >= BigInt(WHALE_THRESHOLD) ? 'bg-zk-primary' : 'bg-red-500/60'}`}
                      style={{ width: `${Math.min((Number(pathData.balance) / WHALE_THRESHOLD) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zk-gray/40 mt-1 font-mono">
                    <span>0</span>
                    <span>Threshold: {WHALE_THRESHOLD.toLocaleString('en-US')}</span>
                  </div>
                </div>

                {BigInt(pathData.balance) >= BigInt(WHALE_THRESHOLD) ? (
                  <button
                    onClick={generateProof}
                    className="w-full py-4 rounded-2xl bg-zk-primary text-white font-bold text-base hover:bg-zk-primary/90 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Generate Merkle ZK Proof
                  </button>
                ) : (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-center">
                    <p className="text-red-400 font-semibold mb-1">Below Threshold</p>
                    <p className="text-zk-gray text-sm">
                      You need at least <span className="text-white">{WHALE_THRESHOLD.toLocaleString('en-US')} zkRUNE</span>.
                      You are <span className="text-white">{(WHALE_THRESHOLD - Number(pathData.balance)).toLocaleString('en-US')}</span> tokens short.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Phase: proving ── */}
            {phase === 'proving' && (
              <div className="space-y-4">
                <Terminal showCursor />
                <p className="text-center text-zk-gray text-sm">
                  Running Groth16 prover in browser — depth=20 may take 10–40 seconds...
                </p>
              </div>
            )}

            {/* ── Phase: verified ── */}
            {phase === 'verified' && proofResult && (
              <div className="space-y-6">
                <Terminal />

                {/* Proof metadata — zero sensitive info */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'hasMinimum (public)', value: '1 (true)', color: 'text-zk-primary' },
                    { label: 'Proof time', value: `${(proofResult.timing / 1000).toFixed(2)}s` },
                    { label: 'Snapshot Root (public)', value: proofResult.snapshotRoot.slice(0, 22) + '...' },
                    { label: 'Snapshot Block (public)', value: proofResult.snapshotBlock.toLocaleString('en-US') },
                    { label: 'Address in proof', value: 'None ✓', color: 'text-zk-primary' },
                    { label: 'Balance in proof', value: 'None ✓', color: 'text-zk-primary' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                      <p className="text-zk-gray/50 text-xs mb-1">{item.label}</p>
                      <p className={`text-sm font-mono truncate ${item.color ?? 'text-white'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Nullifier — anti-replay */}
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-yellow-400 text-xs font-semibold mb-1">Nullifier (anti-replay)</p>
                      <p className="text-white font-mono text-xs break-all">{proofResult.nullifier}</p>
                      <p className="text-yellow-400/60 text-xs mt-2">
                        The verifier stores this nullifier. Submitting the same proof again — or sharing it — will be rejected.
                        This is the only public output linking your proof to this session.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Telegram + Export */}
                <div className="relative rounded-2xl border border-zk-primary/40 bg-gradient-to-br from-zk-primary/10 to-transparent p-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-zk-primary/5 to-transparent pointer-events-none" />
                  <div className="relative flex flex-col sm:flex-row items-center gap-5">
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-hatton text-2xl text-white mb-1">Welcome to Whale Chat</h3>
                      <p className="text-zk-gray text-sm">
                        Merkle + ZK proof verified. {WHALE_THRESHOLD_PERCENT}%+ holder confirmed — no identity disclosed.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full sm:w-auto shrink-0">
                      <a
                        href={TELEGRAM_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zk-primary text-white font-bold hover:bg-zk-primary/90 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        Join the Group
                      </a>
                      <button
                        onClick={exportProof}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white hover:bg-white/5 transition-all text-sm whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Proof JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Phase: error ── */}
            {phase === 'error' && (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-red-400 font-semibold mb-2">Error</h3>
                <p className="text-zk-gray text-sm mb-5 max-w-sm mx-auto">{errorMsg}</p>
                <button
                  onClick={reset}
                  className="px-6 py-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security model footer */}
        <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Security Model
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zk-gray leading-relaxed">
            <div>
              <p className="text-white/80 font-medium mb-1">Why Merkle?</p>
              <p>
                Unlike simple balance checks, the Merkle proof cryptographically binds your
                (address, balance) to a published root — making self-reported inputs impossible.
                There is no way to fake a valid path for a non-existent leaf.
              </p>
            </div>
            <div>
              <p className="text-white/80 font-medium mb-1">What is disclosed?</p>
              <p>
                The proof reveals only: <span className="text-zk-primary font-mono">hasMinimum=1</span> and the{' '}
                <span className="text-zk-primary font-mono">root</span> (already public).
                Address and exact balance are private circuit witnesses — they appear nowhere in the proof.
              </p>
            </div>
            <div>
              <p className="text-white/80 font-medium mb-1">Circuit</p>
              <p>
                <span className="font-mono text-zk-primary/80">whale-holder.circom</span> — WhaleHolderProof(20).
                Poseidon(2) leaf + 20-level Merkle path + GreaterEqThan(64) comparator.
                ~5,600 R1CS constraints · verified against snapshot root.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
