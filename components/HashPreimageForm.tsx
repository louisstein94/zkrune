'use client';

import { useState } from 'react';
import { generateClientProof } from '@/lib/clientZkProof';
import ProofExport from './ProofExport';

export default function HashPreimageForm() {
  const [preimage, setPreimage] = useState('');
  const [salt, setSalt] = useState('');
  const [expectedHash, setExpectedHash] = useState('');
  
  const [proof, setProof] = useState<any>(null);
  const [publicSignals, setPublicSignals] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateHash = () => {
    if (!preimage || !salt) {
      setError('Please enter preimage and salt first');
      return;
    }
    
    try {
      // Generate a simple hash for demonstration
      // In production, this would use Poseidon hash
      const hashInput = `${preimage}-${salt}`;
      const hash = Array.from(hashInput)
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
        .toString();
      
      setExpectedHash(hash);
      setError('');
    } catch (err: any) {
      setError(`Failed to generate hash: ${err.message}`);
    }
  };

  const generateProof = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!preimage || !salt || !expectedHash) {
        throw new Error('All fields are required');
      }

      const input = {
        preimage,
        salt,
        expectedHash,
      };

      const result = await generateClientProof('hash-preimage', input);
      
      if (result.success && result.proof) {
        setProof(result.proof);
        setPublicSignals(result.proof.publicSignals);
      } else {
        throw new Error(result.error || 'Failed to generate proof');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate proof');
      console.error('[Hash Preimage] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fillExample = () => {
    setPreimage('42');
    setSalt('987654321');
    
    // Auto-generate hash
    setTimeout(generateHash, 100);
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>You have a secret value (preimage)</li>
          <li>Generate hash(preimage + salt) and share publicly</li>
          <li>Later, prove you know the preimage without revealing it</li>
          <li>Core ZK primitive used in commitments, voting, and more</li>
        </ol>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Preimage (Your Secret)
          </label>
          <input
            type="text"
            value={preimage}
            onChange={(e) => setPreimage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., 42"
          />
          <p className="text-xs text-gray-500 mt-1">
            The secret value you want to commit to
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Salt
          </label>
          <input
            type="text"
            value={salt}
            onChange={(e) => setSalt(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., 987654321"
          />
          <p className="text-xs text-gray-500 mt-1">
            Random value to make hash unpredictable
          </p>
        </div>

        <button
          onClick={generateHash}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Generate Hash
        </button>

        {expectedHash && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Expected Hash (Public)
            </label>
            <input
              type="text"
              value={expectedHash}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
            />
            <p className="text-xs text-green-600 mt-1">
              ✓ Share this hash publicly
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={fillExample}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fill Example
          </button>
          
          <button
            onClick={generateProof}
            disabled={isLoading || !preimage || !salt || !expectedHash}
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
            templateId="hash-preimage"
          />
        )}
      </div>
    </div>
  );
}

