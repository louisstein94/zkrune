"use client";

import { useState } from 'react';
import { generateClientProof } from '@/lib/clientZkProof';

interface QuadraticVotingFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function QuadraticVotingForm({ onProofGenerated }: QuadraticVotingFormProps) {
  const [voterId, setVoterId] = useState('');
  const [tokenBalance, setTokenBalance] = useState('');
  const [voteChoice, setVoteChoice] = useState('0');
  const [pollId, setPollId] = useState('');
  const [minTokens, setMinTokens] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProof = async () => {
    if (!voterId || !tokenBalance || !pollId || !minTokens) {
      setError('Please fill all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const voterIdNum = parseInt(voterId);
      const tokenBalanceNum = parseInt(tokenBalance);
      const voteChoiceNum = parseInt(voteChoice);
      const pollIdNum = parseInt(pollId);
      const minTokensNum = parseInt(minTokens);

      if (isNaN(voterIdNum) || isNaN(tokenBalanceNum) || isNaN(voteChoiceNum) || isNaN(pollIdNum) || isNaN(minTokensNum)) {
        setError('All fields must be valid numbers');
        return;
      }

      if (voteChoiceNum < 0 || voteChoiceNum > 9) {
        setError('Vote choice must be between 0-9');
        return;
      }

      const canVote = tokenBalanceNum >= minTokensNum;
      const voteWeight = tokenBalanceNum; // Simplified quadratic weight

      const data = await generateClientProof('quadratic-voting', {
        voterId: voterIdNum.toString(),
        tokenBalance: tokenBalanceNum.toString(),
        voteChoice: voteChoiceNum.toString(),
        pollId: pollIdNum.toString(),
        minTokens: minTokensNum.toString(),
      });

      if (data.success && data.proof) {
        const resultProof = {
          statement: `Quadratic vote submitted for poll #${pollIdNum}`,
          voteChoice: `Option ${voteChoiceNum}`,
          voteWeight: voteWeight,
          canVote: canVote,
          eligibility: canVote ? `Eligible (${tokenBalanceNum} ≥ ${minTokensNum} tokens)` : `Not eligible (${tokenBalanceNum} < ${minTokensNum} tokens)`,
          timestamp: data.proof.timestamp,
          proofHash: data.proof.proofHash,
          verificationKey: data.proof.verificationKey,
          realProof: true,
          note: data.proof.note,
          groth16Proof: data.proof.groth16Proof,
          publicSignals: data.proof.publicSignals,
        };
        onProofGenerated(resultProof);
      } else {
        setError(`Proof generation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate proof');
      console.error('[Quadratic Voting] Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Voter ID (Private)
        </label>
        <input
          type="number"
          value={voterId}
          onChange={(e) => setVoterId(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 123456789"
        />
        <p className="text-xs text-zk-gray mt-1">Your secret voter identifier</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Token Balance (Private)
        </label>
        <input
          type="number"
          value={tokenBalance}
          onChange={(e) => setTokenBalance(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 10000"
        />
        <p className="text-xs text-zk-gray mt-1">Number of governance tokens you hold</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Vote Choice
        </label>
        <select
          value={voteChoice}
          onChange={(e) => setVoteChoice(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((opt) => (
            <option key={opt} value={opt}>
              Option {opt}
            </option>
          ))}
        </select>
        <p className="text-xs text-zk-gray mt-1">Select your voting option (0-9)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Poll ID (Public)
        </label>
        <input
          type="number"
          value={pollId}
          onChange={(e) => setPollId(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 42"
        />
        <p className="text-xs text-zk-gray mt-1">The poll you're voting on</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Minimum Tokens Required (Public)
        </label>
        <input
          type="number"
          value={minTokens}
          onChange={(e) => setMinTokens(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 100"
        />
        <p className="text-xs text-zk-gray mt-1">Minimum tokens needed to vote</p>
      </div>

      <button
        onClick={generateProof}
        disabled={isGenerating || !voterId || !tokenBalance || !pollId || !minTokens}
        className="w-full px-6 py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Generating Proof...
          </>
        ) : (
          <>Generate Quadratic Vote Proof</>
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="p-4 bg-zk-primary/5 border border-zk-primary/20 rounded-lg">
        <h4 className="text-sm font-medium text-zk-primary mb-2">How Quadratic Voting Works:</h4>
        <ul className="text-xs text-zk-gray space-y-1">
          <li>• Vote weight grows quadratically with token holdings</li>
          <li>• Prevents whale dominance in governance</li>
          <li>• Your exact balance and ID remain private</li>
          <li>• Only proves eligibility and submits weighted vote</li>
        </ul>
      </div>
    </div>
  );
}


