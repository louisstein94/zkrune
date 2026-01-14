"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function VerifyPage() {
  const params = useParams();
  const proofId = params.id as string;

  // Example proof data - in production would be fetched from IPFS or database
  const proofData = {
    statement: "User is 18 or older",
    isValid: true,
    timestamp: new Date().toISOString(),
    proofHash: `0x${proofId}...`,
    template: "Age Verification",
    verificationKey: `vk_${proofId.substring(0, 10)}`,
  };

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-32 px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Privacy Hack Banner */}
          <div className="mb-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl font-bold">SPH</span>
              <div>
                <h3 className="text-purple-400 font-medium mb-1">Solana Privacy Hack 2026</h3>
                <p className="text-sm text-zk-gray">
                  This is a proof verification page. To verify your own ZK proofs,{" "}
                  <Link href="/verify-proof" className="text-zk-primary underline">click here</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
              <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse" />
              <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
                Proof Verification
              </span>
            </div>

            <h1 className="font-hatton text-5xl text-white mb-4">
              Verify <span className="text-zk-primary">ZK Proof</span>
            </h1>
            <p className="text-xl text-zk-gray">
              Independently verify this zero-knowledge proof
            </p>
          </div>

          {/* Proof Card */}
          <div className="bg-zk-dark/30 border border-zk-primary/30 rounded-2xl p-8 mb-8">
            {/* Status */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zk-gray/20">
              <svg className="w-16 h-16 text-[#F4B728]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h2 className="font-hatton text-3xl text-white mb-1">
                  Proof Verified
                </h2>
                <p className="text-zk-gray">
                  This proof is cryptographically valid
                </p>
              </div>
            </div>

            {/* Statement */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zk-gray uppercase tracking-wider mb-2">
                Proven Statement
              </h3>
              <p className="text-2xl font-hatton text-white">
                "{proofData.statement}"
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-zk-darker/50 rounded-lg">
                <p className="text-xs text-zk-gray mb-1">Template</p>
                <p className="text-white font-medium">{proofData.template}</p>
              </div>
              <div className="p-4 bg-zk-darker/50 rounded-lg">
                <p className="text-xs text-zk-gray mb-1">Generated</p>
                <p className="text-white font-medium">
                  {new Date(proofData.timestamp).toLocaleString('en-US')}
                </p>
              </div>
              <div className="p-4 bg-zk-darker/50 rounded-lg">
                <p className="text-xs text-zk-gray mb-1">Proof Hash</p>
                <p className="text-white font-mono text-xs">
                  {proofData.proofHash}
                </p>
              </div>
              <div className="p-4 bg-zk-darker/50 rounded-lg">
                <p className="text-xs text-zk-gray mb-1">Verification Key</p>
                <p className="text-white font-mono text-xs">
                  {proofData.verificationKey}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-zk-secondary/10 border border-zk-secondary/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl font-bold text-purple-400">ZK</div>
              <div>
                <h3 className="font-medium text-zk-secondary mb-2">
                  Privacy Protected
                </h3>
                <p className="text-sm text-zk-gray leading-relaxed">
                  This proof verifies the statement above without revealing any
                  sensitive information. The original data used to generate this
                  proof remains completely private and cannot be derived from the
                  proof itself.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 py-3 border border-zk-gray/30 text-white rounded-lg hover:border-zk-primary hover:text-zk-primary transition-all text-center"
            >
              ← Back to Home
            </Link>
            <Link
              href="/#templates"
              className="flex-1 py-3 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all text-center"
            >
              Create Your Own
            </Link>
          </div>

          {/* How to Verify */}
          <div className="mt-12 bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
            <h3 className="font-hatton text-xl text-white mb-4">
              How to Verify This Proof
            </h3>
            <ol className="space-y-3 text-sm text-zk-gray">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zk-primary/20 text-zk-primary rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                <span>
                  Check the proof hash matches the one provided
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zk-primary/20 text-zk-primary rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                <span>
                  Verify the cryptographic signature using the verification key
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-zk-primary/20 text-zk-primary rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                <span>
                  Confirm the statement without accessing private data
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}

