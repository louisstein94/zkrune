"use client";

import { useState, useMemo } from "react";
import { generateClientProof } from "@/lib/clientZkProof";
import { MembershipRegistry } from "@/packages/zkrune-sdk/src/membership/registry";

interface MembershipProofFormProps {
  onProofGenerated: (proof: any) => void;
}

const DEMO_MEMBERS = ["alice", "bob", "charlie", "diana", "eve"];

export default function MembershipProofForm({ onProofGenerated }: MembershipProofFormProps) {
  const [mode, setMode] = useState<'demo' | 'advanced'>('demo');
  const [selectedMember, setSelectedMember] = useState(DEMO_MEMBERS[0]);
  const [customMemberId, setCustomMemberId] = useState("");
  const [customRoot, setCustomRoot] = useState("");
  const [customPathElements, setCustomPathElements] = useState("");
  const [customPathIndices, setCustomPathIndices] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  const demoRegistry = useMemo(() => {
    return MembershipRegistry.fromMembers(DEMO_MEMBERS);
  }, []);

  const demoRoot = useMemo(() => demoRegistry.getRoot(), [demoRegistry]);

  const generateProof = async () => {
    setIsGenerating(true);
    setProofError(null);

    try {
      let circuitInputs: {
        memberId: string;
        pathElements: string[];
        pathIndices: string[];
        root: string;
      };

      if (mode === 'demo') {
        circuitInputs = demoRegistry.getCircuitInputs(selectedMember);
      } else {
        if (!customMemberId || !customRoot || !customPathElements || !customPathIndices) {
          setProofError("All fields are required in advanced mode.");
          setIsGenerating(false);
          return;
        }
        try {
          circuitInputs = {
            memberId: customMemberId,
            pathElements: JSON.parse(customPathElements),
            pathIndices: JSON.parse(customPathIndices),
            root: customRoot,
          };
        } catch {
          setProofError("Invalid JSON in pathElements or pathIndices.");
          setIsGenerating(false);
          return;
        }
      }

      const data = await generateClientProof("membership-proof", circuitInputs);

      if (data.success && data.proof) {
        const resultProof = {
          statement: mode === 'demo'
            ? `Verified member of Demo Group (as "${selectedMember}")`
            : `Verified membership in group with root ${circuitInputs.root.slice(0, 12)}...`,
          isValid: true,
          timestamp: data.proof.timestamp,
          proofHash: data.proof.proofHash,
          verificationKey: data.proof.verificationKey,
          merkleRoot: circuitInputs.root,
          realProof: true,
          note: data.proof.note,
          groth16Proof: data.proof.groth16Proof,
          publicSignals: data.proof.publicSignals,
          circuitName: 'membership-proof',
        };
        onProofGenerated(resultProof);
      } else {
        const msg = data.error || 'Unknown error';
        if (msg.includes('Assert') || msg.includes('constraint')) {
          setProofError('Membership verification failed. The provided member ID is not in the group or the Merkle path is invalid.');
        } else {
          setProofError(`Proof generation failed: ${msg}`);
        }
      }
    } catch (error) {
      console.error("Membership proof error:", error);
      setProofError("Unexpected error during proof generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex gap-2">
        {(['demo', 'advanced'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setProofError(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? 'bg-zk-primary text-white'
                : 'bg-zk-darker text-zk-gray border border-zk-gray/20 hover:border-zk-primary/50'
            }`}
          >
            {m === 'demo' ? 'Demo Group' : 'Advanced'}
          </button>
        ))}
      </div>

      {mode === 'demo' ? (
        <>
          {/* Demo group info */}
          <div className="bg-gradient-to-r from-zk-primary/10 to-zk-dark/30 border border-zk-primary/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <label className="text-sm font-bold text-zk-primary uppercase tracking-wider">
                Demo Group (Merkle Tree)
              </label>
            </div>
            <p className="text-xs text-zk-gray mb-3">
              This demo group has {DEMO_MEMBERS.length} members in a Poseidon Merkle tree (depth 16).
              Select a member to generate a ZK proof of inclusion.
            </p>
            <div className="flex items-center gap-2 text-xs text-zk-gray">
              <span className="text-zk-gray/60">Root:</span>
              <code className="text-zk-primary font-mono text-[11px] bg-zk-darker px-2 py-0.5 rounded">
                {demoRoot.slice(0, 20)}...
              </code>
            </div>
          </div>

          {/* Member selection */}
          <div>
            <label className="block text-sm font-medium text-zk-gray mb-2">
              Select Member
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DEMO_MEMBERS.map((member) => (
                <button
                  key={member}
                  onClick={() => { setSelectedMember(member); setProofError(null); }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedMember === member
                      ? 'bg-zk-primary/20 text-zk-primary border border-zk-primary/50'
                      : 'bg-zk-darker text-zk-gray border border-zk-gray/20 hover:border-zk-primary/30'
                  }`}
                >
                  {member}
                </button>
              ))}
            </div>
            <p className="text-xs text-zk-gray mt-2">
              Your identity remains anonymous — the proof only shows you are <em>some</em> member, not <em>which</em> one.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Advanced mode */}
          <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-zk-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <label className="text-sm font-bold text-zk-secondary uppercase tracking-wider">
                Custom Merkle Proof
              </label>
            </div>
            <p className="text-xs text-zk-gray">
              Provide your own Merkle root and path from a MembershipRegistry instance.
              Use <code className="text-zk-primary">registry.getCircuitInputs(memberId)</code> from the SDK.
            </p>

            <div>
              <label className="block text-xs font-medium text-zk-gray mb-1">Member ID (field element)</label>
              <input
                type="text"
                value={customMemberId}
                onChange={(e) => { setCustomMemberId(e.target.value); setProofError(null); }}
                placeholder="123456789..."
                className="w-full px-3 py-2 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-sm font-mono focus:border-zk-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zk-gray mb-1">Merkle Root</label>
              <input
                type="text"
                value={customRoot}
                onChange={(e) => { setCustomRoot(e.target.value); setProofError(null); }}
                placeholder="1234567890123456789..."
                className="w-full px-3 py-2 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-sm font-mono focus:border-zk-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zk-gray mb-1">Path Elements (JSON array)</label>
              <textarea
                value={customPathElements}
                onChange={(e) => { setCustomPathElements(e.target.value); setProofError(null); }}
                placeholder='["123...", "456...", ...]'
                rows={3}
                className="w-full px-3 py-2 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-xs font-mono focus:border-zk-primary focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zk-gray mb-1">Path Indices (JSON array)</label>
              <textarea
                value={customPathIndices}
                onChange={(e) => { setCustomPathIndices(e.target.value); setProofError(null); }}
                placeholder='["0", "1", "0", ...]'
                rows={2}
                className="w-full px-3 py-2 bg-zk-darker border border-zk-gray/30 rounded-lg text-white text-xs font-mono focus:border-zk-primary focus:outline-none resize-none"
              />
            </div>
          </div>
        </>
      )}

      {/* Error display */}
      {proofError && (
        <div className="flex items-start gap-2.5 p-4 bg-red-500/10 rounded-xl border border-red-500/25">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-red-300 font-medium mb-1">Proof Failed</p>
            <p className="text-xs text-red-400/80">{proofError}</p>
          </div>
          <button onClick={() => setProofError(null)} className="ml-auto text-red-400/60 hover:text-red-300 flex-shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <button
        onClick={generateProof}
        disabled={isGenerating}
        className="w-full py-4 bg-zk-primary text-white font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating Proof...
          </>
        ) : (
          <>Generate ZK Proof</>
        )}
      </button>
    </div>
  );
}
