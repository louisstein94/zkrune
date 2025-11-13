"use client";

import { useState } from "react";

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
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Simulate membership check
    const isMember = memberId.length >= 6; // Simple validation

    const proof = {
      statement: isMember
        ? `Verified member of ${groups.find(g => g.id === groupName)?.name}`
        : `Not a member of ${groups.find(g => g.id === groupName)?.name}`,
      isValid: isMember,
      timestamp: new Date().toISOString(),
      proofHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      verificationKey: `vk_${Math.random().toString(36).substring(2, 15)}`,
      memberId: memberId,
      group: groupName,
    };

    onProofGenerated(proof);
    setIsGenerating(false);
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

