"use client";

import { FC, useState } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import {
  convertProofForSui,
  convertPublicInputsForSui,
} from '@/lib/sui/converter';

const PACKAGE_ID =
  process.env.NEXT_PUBLIC_SUI_GROTH16_PACKAGE ||
  '0x278301424c954dcfdb6e46407728964271fbfff3dc1d4fae5b799c7e977bd4c5';
const REGISTRY_ID =
  process.env.NEXT_PUBLIC_SUI_VERIFIER_REGISTRY ||
  '0xa4ef7d43ae5f0bd32248f32555663dd9f13d0054bc120c8e71bbc21663d809ab';
const NETWORK =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as 'mainnet' | 'testnet' | 'devnet') ||
  'mainnet';

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
};

const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

const ZERO_ADDR = '0x0000000000000000000000000000000000000000000000000000000000000000';

interface Props {
  proof: any;
  publicSignals: string[];
  templateId?: string;
}

export const SuiVerifier: FC<Props> = ({
  proof,
  publicSignals,
  templateId = 'age-verification',
}) => {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'fail' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const numericId = TEMPLATE_ID_MAP[templateId];

  const verifyOnChain = async () => {
    if (numericId === undefined) {
      setErrorMsg(`Template "${templateId}" is not registered for Sui verification.`);
      setStatus('error');
      return;
    }

    try {
      setStatus('verifying');
      setErrorMsg('');

      const { proofPointsBytes } = convertProofForSui(proof);
      const publicInputsBytes = convertPublicInputsForSui(publicSignals);

      const tx = new Transaction();
      tx.setSender(ZERO_ADDR);
      tx.moveCall({
        target: `${PACKAGE_ID}::groth16_verifier::verify_proof_static`,
        arguments: [
          tx.object(REGISTRY_ID),
          tx.pure.u8(numericId),
          tx.pure.vector('u8', Array.from(proofPointsBytes)),
          tx.pure.vector('u8', Array.from(publicInputsBytes)),
        ],
      });

      const result = await client.devInspectTransactionBlock({
        sender: ZERO_ADDR,
        transactionBlock: tx,
      });

      if (result.error) {
        setErrorMsg(String(result.error));
        setStatus('error');
        return;
      }

      const ret = result.results?.[0]?.returnValues?.[0];
      if (!ret) {
        setErrorMsg('No return value from devInspect');
        setStatus('error');
        return;
      }
      const [bytes] = ret;
      const value = Array.isArray(bytes) ? bytes[0] === 1 : false;
      setStatus(value ? 'success' : 'fail');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed');
      setStatus('error');
    }
  };

  return (
    <div className="w-full mt-6 bg-gradient-to-br from-sky-900/20 to-teal-900/20 border border-sky-500/30 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-600/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#4DA2FF] inline-block"></span>
            Verify on Sui
            <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-sky-600/30 text-sky-300 border-sky-500/30">
              {NETWORK.toUpperCase()}
            </span>
          </h3>
          <span className="text-xs text-sky-300/70">read-only · no gas</span>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Run the proof through Sui's native <code className="text-sky-300">sui::groth16</code> BN254 verifier via
          <code className="text-sky-300"> devInspect</code>. No wallet, no gas.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-sm text-red-200 break-all">
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
                ? 'bg-sky-600/50 cursor-wait'
                : 'bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500'
            }
          `}
        >
          {status === 'verifying' ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Verifying on Sui…
            </>
          ) : (
            <>
              Verify On-Chain (Sui)
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
                <h4 className="font-bold text-green-100">Verified on Sui!</h4>
                <p className="text-xs text-green-300/80">
                  Groth16 BN254 pairing check passed via package {PACKAGE_ID.slice(0, 6)}…{PACKAGE_ID.slice(-4)}
                </p>
              </div>
            </div>
            <a
              href={`https://suiscan.xyz/${NETWORK}/object/${PACKAGE_ID}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-sky-300 hover:text-sky-200 hover:underline"
            >
              View package on Suiscan
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
              Sui verifier returned false — the proof or public signals do not satisfy the registered VK.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
