"use client";

import { useState } from "react";

interface VotingProofFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function VotingProofForm({ onProofGenerated }: VotingProofFormProps) {
  const [voterId, setVoterId] = useState("");
  const [choice, setChoice] = useState("");
  const [pollTitle, setPollTitle] = useState("governance-proposal-1");
  const [isGenerating, setIsGenerating] = useState(false);

  const polls = [
    { id: "governance-proposal-1", title: "Governance Proposal #1" },
    { id: "treasury-allocation", title: "Treasury Allocation" },
    { id: "protocol-upgrade", title: "Protocol Upgrade v2.0" },
  ];

  const choices = ["Yes", "No", "Abstain"];

  const generateProof = async () => {
    if (!voterId || !choice) {
      alert("Please fill all fields");
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const isValidVoter = voterId.length >= 8;

    const proof = {
      statement: isValidVoter
        ? "Vote successfully cast and verified"
        : "Invalid voter credentials",
      isValid: isValidVoter,
      timestamp: new Date().toISOString(),
      proofHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      verificationKey: `vk_${Math.random().toString(36).substring(2, 15)}`,
      voterId: voterId,
      choice: choice,
      poll: pollTitle,
    };

    onProofGenerated(proof);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Voter ID
        </label>
        <input
          type="text"
          value={voterId}
          onChange={(e) => setVoterId(e.target.value)}
          placeholder="Example: VOTER12345678"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
        <div className="mt-2 space-y-1">
          <p className="text-xs text-zk-gray">
            💡 Minimum 8 characters required (e.g., VOTER12345678)
          </p>
          <p className="text-xs text-zk-gray opacity-60">
            Your identity will remain anonymous in the proof
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Select Poll
        </label>
        <select
          value={pollTitle}
          onChange={(e) => setPollTitle(e.target.value)}
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        >
          {polls.map((poll) => (
            <option key={poll.id} value={poll.id}>
              {poll.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Your Vote
        </label>
        <div className="grid grid-cols-3 gap-3">
          {choices.map((c) => (
            <button
              key={c}
              onClick={() => setChoice(c)}
              className={`py-3 rounded-lg font-medium transition-all ${
                choice === c
                  ? "bg-zk-primary text-zk-darker"
                  : "bg-zk-darker border border-zk-gray/30 text-zk-gray hover:border-zk-primary hover:text-zk-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-zk-gray mt-2">
          Your vote choice will be encrypted
        </p>
      </div>

      <button
        onClick={generateProof}
        disabled={isGenerating || !voterId || !choice}
        className="w-full py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Casting Vote...
          </>
        ) : (
          <>⚡ Cast Vote & Generate Proof</>
        )}
      </button>
    </div>
  );
}

