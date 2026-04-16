"use client";

import { FC, useState } from 'react';
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';

const VERIFIER_ADDRESS = (process.env.NEXT_PUBLIC_EVM_VERIFIER_ADDRESS ||
  '0xa03A353d890033aC9b3044776440C2a4c9E849EA') as `0x${string}`;

const TEMPLATE_ID_MAP: Record<string, number> = {
  'age-verification': 0,
  'balance-proof': 1,
  'membership-proof': 2,
  'credential-proof': 3,
  'private-voting': 4,
  'nft-ownership': 5,
  'range-proof': 6,
  'hash-preimage': 7,
  'quadratic-voting': 8,
  'anonymous-reputation': 9,
  'token-swap': 10,
  'patience-proof': 11,
  'signature-verification': 12,
  'whale-holder': 13,
};

const ABI = parseAbi([
  'function verifyProofStatic(uint8 templateId, uint256[2] a, uint256[2][2] b, uint256[2] c, uint256[] publicInputs) view returns (bool)',
]);

const client = createPublicClient({ chain: base, transport: http() });

interface Props {
  proof: any;
  publicSignals: string[];
  templateId?: string;
}

export const BaseVerifier: FC<Props> = ({
  proof,
  publicSignals,
  templateId = 'age-verification',
}) => {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'fail' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const numericId = TEMPLATE_ID_MAP[templateId];

  const verifyOnChain = async () => {
    if (numericId === undefined) {
      setErrorMsg(`Template "${templateId}" is not registered for Base verification.`);
      setStatus('error');
      return;
    }

    try {
      setStatus('verifying');
      setErrorMsg('');

      const a: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
      const b: [[bigint, bigint], [bigint, bigint]] = [
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ];
      const c: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
      const pubInputs = publicSignals.map((s) => BigInt(s));

      const result = await client.readContract({
        address: VERIFIER_ADDRESS,
        abi: ABI,
        functionName: 'verifyProofStatic',
        args: [numericId, a, b, c, pubInputs],
      });

      setStatus(result ? 'success' : 'fail');
    } catch (err: any) {
      setErrorMsg(err.shortMessage || err.message || 'Verification failed');
      setStatus('error');
    }
  };

  return (
    <div className="w-full mt-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#0052FF] inline-block"></span>
            Verify on Base
            <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-blue-600/30 text-blue-300 border-blue-500/30">
              MAINNET
            </span>
          </h3>
          <span className="text-xs text-blue-300/70">read-only · no gas</span>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Run the proof through the Base mainnet verifier contract via{' '}
          <code className="text-blue-300">verifyProofStatic</code>. This is a view
          call — no wallet, no gas.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        <button
          onClick={verifyOnChain}
          disabled={status === 'verifying'}
          className={`
            w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 text-white
            ${
              status === 'verifying'
                ? 'bg-blue-600/50 cursor-wait'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
            }
          `}
        >
          {status === 'verifying' ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Verifying on Base…
            </>
          ) : (
            <>
              Verify On-Chain (Base)
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </>
          )}
        </button>

        {status === 'success' && (
          <div className="mt-4 p-4 bg-green-900/30 border border-green-500/40 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xl">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-green-100">Verified on Base!</h4>
                <p className="text-xs text-green-300/80">
                  Groth16 pairing check passed via {VERIFIER_ADDRESS.slice(0, 6)}…{VERIFIER_ADDRESS.slice(-4)}
                </p>
              </div>
            </div>
            <a
              href={`https://basescan.org/address/${VERIFIER_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 hover:underline"
            >
              View contract on Basescan
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {status === 'fail' && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/40 rounded-xl">
            <h4 className="font-bold text-red-100">Invalid proof</h4>
            <p className="text-xs text-red-300/80">
              The Base verifier returned false — the proof or public signals do not satisfy the registered VK.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
