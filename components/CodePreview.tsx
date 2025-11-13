"use client";

import { useState } from "react";

interface CodePreviewProps {
  templateId: string;
}

export default function CodePreview({ templateId }: CodePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const circuits: { [key: string]: string } = {
    "age-verification": `pragma circom 2.0.0;

include "comparators.circom";

template AgeVerification() {
    // Private inputs (hidden from verifier)
    signal input birthYear;
    signal input birthMonth;
    signal input birthDay;
    
    // Public inputs
    signal input currentYear;
    signal input currentMonth;
    signal input currentDay;
    signal input minimumAge;
    
    // Output
    signal output isValid;
    
    // Calculate age
    signal yearDiff;
    yearDiff <== currentYear - birthYear;
    
    // Check if age >= minimumAge
    component gte = GreaterEqThan(8);
    gte.in[0] <== yearDiff;
    gte.in[1] <== minimumAge;
    
    isValid <== gte.out;
}

component main = AgeVerification();`,
    "balance-proof": `pragma circom 2.0.0;

include "comparators.circom";

template BalanceProof() {
    // Private input (hidden)
    signal input balance;
    
    // Public input
    signal input minimumBalance;
    
    // Output
    signal output hasMinimum;
    
    // Check if balance >= minimumBalance
    component gte = GreaterEqThan(64);
    gte.in[0] <== balance;
    gte.in[1] <== minimumBalance;
    
    hasMinimum <== gte.out;
}

component main = BalanceProof();`,
    "membership-proof": `pragma circom 2.0.0;

include "merkletree.circom";
include "poseidon.circom";

template MembershipProof(levels) {
    // Private inputs
    signal input memberSecret;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    
    // Public input
    signal input merkleRoot;
    
    // Output
    signal output isMember;
    
    // Hash member secret
    component hasher = Poseidon(1);
    hasher.inputs[0] <== memberSecret;
    
    // Verify Merkle proof
    component merkleProof = MerkleTreeChecker(levels);
    merkleProof.leaf <== hasher.out;
    merkleProof.root <== merkleRoot;
    
    for (var i = 0; i < levels; i++) {
        merkleProof.pathElements[i] <== pathElements[i];
        merkleProof.pathIndices[i] <== pathIndices[i];
    }
    
    isMember <== 1;
}

component main = MembershipProof(20);`,
    "range-proof": `pragma circom 2.0.0;

include "comparators.circom";

template RangeProof() {
    // Private input
    signal input value;
    
    // Public inputs
    signal input minRange;
    signal input maxRange;
    
    // Output
    signal output inRange;
    
    // Check value >= minRange
    component gteMin = GreaterEqThan(64);
    gteMin.in[0] <== value;
    gteMin.in[1] <== minRange;
    
    // Check value <= maxRange
    component lteMax = LessEqThan(64);
    lteMax.in[0] <== value;
    lteMax.in[1] <== maxRange;
    
    // Both must be true
    inRange <== gteMin.out * lteMax.out;
}

component main = RangeProof();`,
    "private-voting": `pragma circom 2.0.0;

include "poseidon.circom";
include "merkletree.circom";

template PrivateVoting(levels) {
    // Private inputs
    signal input voterSecret;
    signal input vote; // 0, 1, 2 for Yes, No, Abstain
    signal input nullifier;
    
    // Public inputs
    signal input merkleRoot;
    signal input pollId;
    
    // Outputs
    signal output nullifierHash;
    signal output voteCommitment;
    
    // Hash voter secret to leaf
    component voterHash = Poseidon(1);
    voterHash.inputs[0] <== voterSecret;
    
    // Verify voter is in merkle tree
    component merkleProof = MerkleTreeChecker(levels);
    merkleProof.leaf <== voterHash.out;
    merkleProof.root <== merkleRoot;
    
    // Generate nullifier (prevents double voting)
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHasher.inputs[1] <== pollId;
    nullifierHash <== nullifierHasher.out;
    
    // Commit to vote
    component voteHasher = Poseidon(3);
    voteHasher.inputs[0] <== vote;
    voteHasher.inputs[1] <== voterSecret;
    voteHasher.inputs[2] <== pollId;
    voteCommitment <== voteHasher.out;
}

component main = PrivateVoting(20);`,
  };

  const circuit = circuits[templateId] || "// Circuit not found";

  if (!isOpen) {
    return (
      <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-hatton text-xl text-white mb-1">
              View Circuit Code
            </h3>
            <p className="text-sm text-zk-gray">
              See the actual ZK circuit implementation
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-zk-primary/10 border border-zk-primary/30 text-zk-primary rounded-lg text-sm font-medium hover:bg-zk-primary/20 transition-all"
          >
            View Code →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-hatton text-xl text-white">Circuit Code (Circom)</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-zk-gray hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="bg-zk-darker border border-zk-gray/20 rounded-lg p-4 max-h-96 overflow-auto">
        <pre className="text-xs text-zk-gray font-mono whitespace-pre">
          {circuit}
        </pre>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(circuit);
            alert("Circuit copied to clipboard!");
          }}
          className="flex-1 py-2 bg-zk-primary/10 border border-zk-primary/30 text-zk-primary rounded-lg text-sm font-medium hover:bg-zk-primary/20 transition-all"
        >
          Copy Circuit
        </button>
      </div>

      <p className="mt-3 text-xs text-zk-gray text-center">
        This is the actual Circom circuit that would be compiled for production use
      </p>
    </div>
  );
}

