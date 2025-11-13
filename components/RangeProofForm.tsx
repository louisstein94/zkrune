"use client";

import { useState } from "react";

interface RangeProofFormProps {
  onProofGenerated: (proof: any) => void;
}

export default function RangeProofForm({ onProofGenerated }: RangeProofFormProps) {
  const [value, setValue] = useState("");
  const [minRange, setMinRange] = useState("");
  const [maxRange, setMaxRange] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProof = async () => {
    if (!value || !minRange || !maxRange) {
      alert("Please fill all fields");
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const valueNum = parseFloat(value);
    const minNum = parseFloat(minRange);
    const maxNum = parseFloat(maxRange);
    const isInRange = valueNum >= minNum && valueNum <= maxNum;

    const proof = {
      statement: isInRange
        ? `Value is between ${minNum} and ${maxNum}`
        : `Value is outside range ${minNum}-${maxNum}`,
      isValid: isInRange,
      timestamp: new Date().toISOString(),
      proofHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      verificationKey: `vk_${Math.random().toString(36).substring(2, 15)}`,
      actualValue: valueNum,
      range: { min: minNum, max: maxNum },
    };

    onProofGenerated(proof);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zk-gray mb-2">
          Your Value (Private)
        </label>
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter value"
          className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
        />
        <p className="text-xs text-zk-gray mt-2">
          Exact value will NOT be revealed
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zk-gray mb-2">
            Minimum
          </label>
          <input
            type="number"
            step="0.01"
            value={minRange}
            onChange={(e) => setMinRange(e.target.value)}
            placeholder="Min"
            className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zk-gray mb-2">
            Maximum
          </label>
          <input
            type="number"
            step="0.01"
            value={maxRange}
            onChange={(e) => setMaxRange(e.target.value)}
            placeholder="Max"
            className="w-full px-4 py-3 bg-zk-darker border border-zk-gray/30 rounded-lg text-white focus:border-zk-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <button
        onClick={generateProof}
        disabled={isGenerating || !value || !minRange || !maxRange}
        className="w-full py-4 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Generating Proof...
          </>
        ) : (
          <>⚡ Generate ZK Proof</>
        )}
      </button>
    </div>
  );
}

