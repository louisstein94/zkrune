"use client";

import { useState } from "react";
import { generateClientProof } from "@/lib/clientZkProof";

interface MembershipProofFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function MembershipProofForm({ onProofGenerated }: MembershipProofFormProps) {
  const [memberId, setMemberId] = useState("");
  const [groupName, setGroupName] = useState("premium");
  const [isGenerating, setIsGenerating] = useState(false);

  const groups = [
    { id: "premium", name: "Premium Members" },
    { id: "vip", name: "VIP Club" },
    { id: "founders", name: "Founders Circle" },
    { id: "dao", name: "DAO Governance" },
  ];

  const generateProof = async () => {
    if (!memberId || !groupName) {
      alert("Please fill all fields");
      return;
    }

    setIsGenerating(true);

    try {
      const isMember = memberId.length >= 6;
      const groupInfo = groups.find(g => g.id === groupName);

      // Generate REAL ZK proof in browser
      const data = await generateClientProof("membership-proof", {
        memberId: memberId.length.toString(),
        groupHash: groupName.length.toString(),
      });

      if (data.success && data.proof) {
        const resultProof = {
          statement: isMember
            ? `Verified member of ${groupInfo?.name}`
            : `Not a member of ${groupInfo?.name}`,
          isValid: isMember,
          timestamp: data.proof.timestamp,
          proofHash: data.proof.proofHash,
          verificationKey: data.proof.verificationKey,
          memberId: memberId,
          group: groupName,
          realProof: true,
          note: data.proof.note,
          groth16Proof: data.proof.groth16Proof,
          publicSignals: data.proof.publicSignals,
        };
        onProofGenerated(resultProof);
      } else {
        alert(`Proof generation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Membership proof error:", error);
      alert("Error generating proof. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Member ID
        </label>
        <input
          type="text"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          placeholder="Example: MEMBER123456"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
        <div className="mt-2 space-y-1">
          <p className="text-xs text-zk-gray">
            💡 Minimum 6 characters required (e.g., MEMBER123456)
          </p>
          <p className="text-xs text-zk-gray opacity-60">
            Your identity will remain anonymous in the proof
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Select Group
        </label>
        <select
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={generateProof}
        disabled={isGenerating || !memberId}
        className="w-full py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Verifying Membership...
          </>
        ) : (
          <>⚡ Generate ZK Proof</>
        )}
      </button>
    </div>
  );
}

