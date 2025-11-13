"use client";

import { useState } from "react";

interface ZcashMockProps {
  proofHash: string;
}

export default function ZcashMock({ proofHash }: ZcashMockProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const deployToTestnet = async () => {
    setIsDeploying(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    setTxHash(mockTxHash);
    setIsDeploying(false);
  };

  if (txHash) {
    return (
      <div className="p-6 bg-zk-dark/50 border border-zk-primary/30 rounded-xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">⛓️</div>
          <div className="flex-1">
            <h4 className="text-lg font-medium text-white mb-2">
              Deployed to Zcash Testnet
            </h4>
            <p className="text-sm text-zk-gray mb-4">
              Your proof has been successfully deployed to the Zcash testnet blockchain.
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-3 bg-zk-darker rounded-lg">
            <span className="text-zk-gray">Transaction Hash:</span>
            <span className="text-white font-mono text-xs">
              {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-zk-darker rounded-lg">
            <span className="text-zk-gray">Network:</span>
            <span className="text-zk-primary font-medium">Testnet</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-zk-darker rounded-lg">
            <span className="text-zk-gray">Status:</span>
            <span className="text-zk-primary flex items-center gap-2">
              <span className="w-2 h-2 bg-zk-primary rounded-full animate-pulse" />
              Confirmed
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-zk-darker rounded-lg">
            <span className="text-zk-gray">Block Explorer:</span>
            <a
              href={`https://testnet.zcha.in/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zk-primary hover:underline text-xs"
            >
              View on Explorer →
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(txHash)}
            className="flex-1 py-2 border border-zk-gray/30 text-white text-sm rounded-lg hover:border-zk-primary hover:text-zk-primary transition-colors"
          >
            Copy TX Hash
          </button>
          <button
            onClick={() => setTxHash(null)}
            className="flex-1 py-2 bg-zk-primary/10 border border-zk-primary/30 text-zk-primary text-sm rounded-lg hover:bg-zk-primary/20 transition-colors"
          >
            Deploy Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="text-4xl">⛓️</div>
        <div>
          <h4 className="text-lg font-medium text-white mb-2">
            Deploy to Zcash Testnet
          </h4>
          <p className="text-sm text-zk-gray">
            Deploy your zero-knowledge proof to the Zcash testnet blockchain for permanent verification.
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-zk-gray">
          <span>✓</span>
          <span>Shielded transaction (private)</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zk-gray">
          <span>✓</span>
          <span>Proof hash: {proofHash.substring(0, 20)}...</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zk-gray">
          <span>✓</span>
          <span>No gas fees (testnet)</span>
        </div>
      </div>

      {/* Deploy Button */}
      <button
        onClick={deployToTestnet}
        disabled={isDeploying}
        className="w-full py-3 bg-zk-primary text-zk-darker font-medium rounded-lg hover:bg-zk-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isDeploying ? (
          <>
            <div className="w-5 h-5 border-2 border-zk-darker/30 border-t-zk-darker rounded-full animate-spin" />
            Deploying to Testnet...
          </>
        ) : (
          <>⛓️ Deploy to Zcash Testnet</>
        )}
      </button>

      <p className="mt-3 text-xs text-center text-zk-gray">
        This is a simulated deployment to Zcash testnet
      </p>
    </div>
  );
}

