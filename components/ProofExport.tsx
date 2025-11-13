"use client";

import { useState } from "react";

interface ProofExportProps {
  proof: any;
  templateId: string;
}

export default function ProofExport({ proof, templateId }: ProofExportProps) {
  const [exportFormat, setExportFormat] = useState<"json" | "code" | "share">("json");
  const [copied, setCopied] = useState(false);

  const generateJSON = () => {
    return JSON.stringify(
      {
        proof: {
          hash: proof.proofHash,
          verificationKey: proof.verificationKey,
          statement: proof.statement,
          isValid: proof.isValid,
          timestamp: proof.timestamp,
        },
        metadata: {
          template: templateId,
          generatedBy: "zkRune",
          version: "0.1.0",
        },
      },
      null,
      2
    );
  };

  const generateCode = () => {
    return `// zkRune Generated Proof
// Template: ${templateId}

import { verifyProof } from 'zkrune-sdk';

const proof = {
  hash: "${proof.proofHash}",
  verificationKey: "${proof.verificationKey}",
  statement: "${proof.statement}",
  isValid: ${proof.isValid},
  timestamp: "${proof.timestamp}"
};

// Verify proof
const isValid = await verifyProof(proof);
console.log('Proof is valid:', isValid);

// Use in your application
if (isValid) {
  // User has proven: ${proof.statement}
  // Continue with authenticated flow
}
`;
  };

  const generateShareLink = () => {
    const encoded = btoa(JSON.stringify(proof));
    return `https://zkrune.com/verify/${encoded.substring(0, 20)}`;
  };

  const copyToClipboard = async () => {
    let content = "";
    if (exportFormat === "json") {
      content = generateJSON();
    } else if (exportFormat === "code") {
      content = generateCode();
    } else {
      content = generateShareLink();
    }

    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    let content = "";
    let filename = "";
    let type = "";

    if (exportFormat === "json") {
      content = generateJSON();
      filename = `zkrune-proof-${Date.now()}.json`;
      type = "application/json";
    } else if (exportFormat === "code") {
      content = generateCode();
      filename = `zkrune-proof-${Date.now()}.js`;
      type = "text/javascript";
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
      <h3 className="font-hatton text-xl text-white mb-4">Export Proof</h3>

      {/* Format Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setExportFormat("json")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            exportFormat === "json"
              ? "bg-zk-primary text-zk-darker"
              : "bg-zk-darker text-zk-gray hover:text-white"
          }`}
        >
          JSON
        </button>
        <button
          onClick={() => setExportFormat("code")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            exportFormat === "code"
              ? "bg-zk-primary text-zk-darker"
              : "bg-zk-darker text-zk-gray hover:text-white"
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setExportFormat("share")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            exportFormat === "share"
              ? "bg-zk-primary text-zk-darker"
              : "bg-zk-darker text-zk-gray hover:text-white"
          }`}
        >
          Share
        </button>
      </div>

      {/* Preview */}
      <div className="mb-4">
        <div className="bg-zk-darker border border-zk-gray/20 rounded-lg p-4 max-h-64 overflow-auto">
          <pre className="text-xs text-zk-gray font-mono whitespace-pre-wrap">
            {exportFormat === "json" && generateJSON()}
            {exportFormat === "code" && generateCode()}
            {exportFormat === "share" && generateShareLink()}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={copyToClipboard}
          className="flex-1 py-2 bg-zk-primary/10 border border-zk-primary/30 text-zk-primary rounded-lg text-sm font-medium hover:bg-zk-primary/20 transition-all"
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
        {exportFormat !== "share" && (
          <button
            onClick={downloadFile}
            className="flex-1 py-2 bg-zk-secondary/10 border border-zk-secondary/30 text-zk-secondary rounded-lg text-sm font-medium hover:bg-zk-secondary/20 transition-all"
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
}

