"use client";

import { useState } from 'react';
import { generateClientProof } from '@/lib/clientZkProof';

interface NFTOwnershipFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function NFTOwnershipForm({ onProofGenerated }: NFTOwnershipFormProps) {
  const [nftTokenId, setNftTokenId] = useState('');
  const [ownerSecret, setOwnerSecret] = useState('');
  const [collectionRoot, setCollectionRoot] = useState('');
  const [minTokenId, setMinTokenId] = useState('');
  const [maxTokenId, setMaxTokenId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProof = async () => {
    if (!nftTokenId || !ownerSecret || !collectionRoot || !minTokenId || !maxTokenId) {
      setError('Please fill all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const nftTokenIdNum = parseInt(nftTokenId);
      const ownerSecretNum = parseInt(ownerSecret);
      const collectionRootNum = collectionRoot;
      const minTokenIdNum = parseInt(minTokenId);
      const maxTokenIdNum = parseInt(maxTokenId);

      if (isNaN(nftTokenIdNum) || isNaN(ownerSecretNum) || isNaN(minTokenIdNum) || isNaN(maxTokenIdNum)) {
        setError('Token IDs and secret must be valid numbers');
        return;
      }

      const inRange = nftTokenIdNum >= minTokenIdNum && nftTokenIdNum <= maxTokenIdNum;

      const data = await generateClientProof('nft-ownership', {
        nftTokenId: nftTokenIdNum.toString(),
        ownerSecret: ownerSecretNum.toString(),
        collectionRoot: collectionRootNum,
        minTokenId: minTokenIdNum.toString(),
        maxTokenId: maxTokenIdNum.toString(),
      });

      if (data.success && data.proof) {
        const resultProof = {
          statement: `Ownership proven for NFT collection`,
          collectionRange: `Token IDs ${minTokenIdNum} - ${maxTokenIdNum}`,
          inRange: inRange,
          ownership: inRange ? 'Valid ownership proof generated' : 'Token ID out of collection range',
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
      console.error('[NFT Ownership] Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          NFT Token ID (Private)
        </label>
        <input
          type="number"
          value={nftTokenId}
          onChange={(e) => setNftTokenId(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 5678"
        />
        <p className="text-xs text-zk-gray mt-1">The specific NFT you own (kept secret)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Owner Secret (Private)
        </label>
        <input
          type="number"
          value={ownerSecret}
          onChange={(e) => setOwnerSecret(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
          placeholder="e.g., 987654321"
        />
        <p className="text-xs text-zk-gray mt-1">Your secret ownership key</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Collection Root (Public)
        </label>
        <input
          type="text"
          value={collectionRoot}
          onChange={(e) => setCollectionRoot(e.target.value)}
          className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none font-mono text-sm"
          placeholder="e.g., 12345...67890"
        />
        <p className="text-xs text-zk-gray mt-1">Collection hash or Merkle root</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zk-gray mb-2">
            Min Token ID (Public)
          </label>
          <input
            type="number"
            value={minTokenId}
            onChange={(e) => setMinTokenId(e.target.value)}
            className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
            placeholder="e.g., 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zk-gray mb-2">
            Max Token ID (Public)
          </label>
          <input
            type="number"
            value={maxTokenId}
            onChange={(e) => setMaxTokenId(e.target.value)}
            className="w-full px-4 py-3 bg-zk-dark/50 border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none"
            placeholder="e.g., 10000"
          />
        </div>
      </div>
      <p className="text-xs text-zk-gray -mt-4">Collection range (e.g., 1-10000)</p>

      <button
        onClick={generateProof}
        disabled={isGenerating || !nftTokenId || !ownerSecret || !collectionRoot || !minTokenId || !maxTokenId}
        className="w-full px-6 py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Generating Proof...
          </>
        ) : (
          <>Generate NFT Ownership Proof</>
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="p-4 bg-zk-primary/5 border border-zk-primary/20 rounded-lg">
        <h4 className="text-sm font-medium text-zk-primary mb-2">How NFT Ownership Proof Works:</h4>
        <ul className="text-xs text-zk-gray space-y-1">
          <li>• Prove you own an NFT from a collection</li>
          <li>• Without revealing which specific NFT you own</li>
          <li>• Useful for exclusive communities and airdrops</li>
          <li>• Maintains privacy while proving membership</li>
        </ul>
      </div>
    </div>
  );
}

