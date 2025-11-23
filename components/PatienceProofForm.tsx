'use client';

import { useState } from 'react';
import { generateClientProof } from '@/lib/clientZkProof';
import ProofExport from './ProofExport';

export default function PatienceProofForm() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [secret, setSecret] = useState('');
  const [minimumWaitTime, setMinimumWaitTime] = useState('3600'); // 1 hour default
  const [commitmentHash, setCommitmentHash] = useState('');
  
  const [proof, setProof] = useState<any>(null);
  const [publicSignals, setPublicSignals] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCommitment = () => {
    if (!startTime || !secret) {
      setError('Please enter start time and secret first');
      return;
    }
    
    try {
      // Generate a simple hash for commitment
      // In production, this would use Poseidon hash
      const hashInput = `${startTime}-${secret}`;
      const hash = Array.from(hashInput)
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        .toString();
      
      setCommitmentHash(hash);
      setError('');
    } catch (err: any) {
      setError(`Failed to generate commitment: ${err.message}`);
    }
  };

  const generateProof = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!startTime || !endTime || !secret || !minimumWaitTime || !commitmentHash) {
        throw new Error('All fields are required');
      }

      const input = {
        startTime,
        endTime,
        secret,
        minimumWaitTime,
        commitmentHash,
      };

      const result = await generateClientProof('patience-proof', input);
      
      if (result.success && result.proof) {
        setProof(result.proof);
        setPublicSignals(result.proof.publicSignals);
      } else {
        throw new Error(result.error || 'Failed to generate proof');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate proof');
      console.error('[Patience Proof] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fillExample = () => {
    const now = Math.floor(Date.now() / 1000);
    const oneHourAgo = now - 3600;
    
    setStartTime(oneHourAgo.toString());
    setEndTime(now.toString());
    setSecret('123456789');
    setMinimumWaitTime('3600');
    
    // Auto-generate commitment
    setTimeout(generateCommitment, 100);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Create a commitment when you start waiting (hash of start time + secret)</li>
          <li>Wait the required time period</li>
          <li>Prove you waited without revealing exact start/end times</li>
          <li>Useful for time-locked commitments, contests, and patience rewards</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Start Time (Unix Timestamp)
          </label>
          <input
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., 1700000000"
          />
          <p className="text-xs text-gray-500 mt-1">
            When you started waiting (seconds since 1970)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Secret
          </label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., 123456789"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your secret for commitment (keep this private!)
          </p>
        </div>

        <button
          onClick={generateCommitment}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Generate Commitment Hash
        </button>

        {commitmentHash && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Commitment Hash (Public)
            </label>
            <input
              type="text"
              value={commitmentHash}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
            />
            <p className="text-xs text-green-600 mt-1">
              ✓ Share this hash publicly before waiting
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            End Time (Unix Timestamp)
          </label>
          <input
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., 1700003600"
          />
          <p className="text-xs text-gray-500 mt-1">
            When you finished waiting
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Minimum Wait Time (Seconds)
          </label>
          <input
            type="text"
            value={minimumWaitTime}
            onChange={(e) => setMinimumWaitTime(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., 3600 (1 hour)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Required waiting period (3600 = 1 hour, 86400 = 1 day)
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fillExample}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fill Example
          </button>
          
          <button
            onClick={generateProof}
            disabled={isLoading || !startTime || !endTime || !secret || !minimumWaitTime || !commitmentHash}
            className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Generating...' : 'Generate Proof'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {proof && (
          <ProofExport
            proof={proof}
            templateId="patience-proof"
          />
        )}
      </div>
    </div>
  );
}

