"use client";

import { useState } from 'react';
import { generateClientProof } from '@/lib/clientZkProof';

interface AnonymousReputationFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function AnonymousReputationForm({ onProofGenerated }: AnonymousReputationFormProps) {
  const [userId, setUserId] = useState('');
  const [reputationScore, setReputationScore] = useState('');
  const [userNonce, setUserNonce] = useState('');
  const [thresholdScore, setThresholdScore] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getScoreCategory = (score: number): string => {
    if (score < 200) return 'Bronze (0-199)';
    if (score < 400) return 'Silver (200-399)';
    if (score < 600) return 'Gold (400-599)';
    if (score < 800) return 'Platinum (600-799)';
    return 'Diamond (800-1000)';
  };

  const generateProof = async () => {
    if (!userId || !reputationScore || !userNonce || !thresholdScore || !platformId) {
      setError('Please fill all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const userIdNum = parseInt(userId);
      const reputationScoreNum = parseInt(reputationScore);
      const userNonceNum = parseInt(userNonce);
      const thresholdScoreNum = parseInt(thresholdScore);
      const platformIdNum = parseInt(platformId);

      if (isNaN(userIdNum) || isNaN(reputationScoreNum) || isNaN(userNonceNum) || isNaN(thresholdScoreNum) || isNaN(platformIdNum)) {
        setError('All fields must be valid numbers');
        return;
      }

      if (reputationScoreNum < 0 || reputationScoreNum > 1000) {
        setError('Reputation score must be between 0-1000');
        return;
      }

      const meetsThreshold = reputationScoreNum >= thresholdScoreNum;
      const scoreCategory = getScoreCategory(reputationScoreNum);

      const data = await generateClientProof('anonymous-reputation', {
        userId: userIdNum.toString(),
        reputationScore: reputationScoreNum.toString(),
        userNonce: userNonceNum.toString(),
        thresholdScore: thresholdScoreNum.toString(),
        platformId: platformIdNum.toString(),
      });

      if (data.success && data.proof) {
        const resultProof = {
          statement: `Reputation verified for platform #${platformIdNum}`,
          threshold: `Required: ${thresholdScoreNum}`,
          meetsThreshold: meetsThreshold,
          category: scoreCategory,
          eligibility: meetsThreshold 
            ? `✓ Meets threshold (score ≥ ${thresholdScoreNum})` 
            : `✗ Below threshold (score < ${thresholdScoreNum})`,
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
      console.error('[Anonymous Reputation] Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          User ID (Private)
        </label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 111222333"
        />
        <p className="text-xs text-zk-gray mt-1">Your secret user identifier</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Reputation Score (Private)
        </label>
        <input
          type="number"
          value={reputationScore}
          onChange={(e) => setReputationScore(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 850"
          min="0"
          max="1000"
        />
        <p className="text-xs text-zk-gray mt-1">
          Your actual score (0-1000) - {reputationScore ? getScoreCategory(parseInt(reputationScore) || 0) : 'Enter score'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          User Nonce (Private)
        </label>
        <input
          type="number"
          value={userNonce}
          onChange={(e) => setUserNonce(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 999888777"
        />
        <p className="text-xs text-zk-gray mt-1">Random nonce for additional privacy</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Threshold Score (Public)
        </label>
        <input
          type="number"
          value={thresholdScore}
          onChange={(e) => setThresholdScore(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 700"
          min="0"
          max="1000"
        />
        <p className="text-xs text-zk-gray mt-1">Minimum score required</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Platform ID (Public)
        </label>
        <input
          type="number"
          value={platformId}
          onChange={(e) => setPlatformId(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 1"
        />
        <p className="text-xs text-zk-gray mt-1">Platform or system identifier</p>
      </div>

      <button
        onClick={generateProof}
        disabled={isGenerating || !userId || !reputationScore || !userNonce || !thresholdScore || !platformId}
        className="w-full px-6 py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Generating Proof...
          </>
        ) : (
          <>Generate Reputation Proof</>
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="p-4 bg-zk-primary/5 border border-zk-primary/20 rounded-lg">
        <h4 className="text-sm font-medium text-zk-primary mb-2">How Anonymous Reputation Works:</h4>
        <ul className="text-xs text-zk-gray space-y-1">
          <li>• Prove your reputation exceeds a threshold</li>
          <li>• Without revealing your exact score or identity</li>
          <li>• Get score category (Bronze/Silver/Gold/Platinum/Diamond)</li>
          <li>• Useful for access control and credit systems</li>
        </ul>
      </div>
    </div>
  );
}

