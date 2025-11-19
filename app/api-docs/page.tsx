"use client";

import Navigation from "@/components/Navigation";
import { useState } from "react";

export default function APIDocsPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testAPI = async () => {
    setIsLoading(true);
    setTestResult("Testing API...");

    try {
      const response = await fetch("/api/generate-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: "age-verification",
          inputs: {
            birthYear: "1995",
            currentYear: "2024",
            minimumAge: "18"
          }
        })
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-24 px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-hatton text-5xl text-white mb-4">
              API Documentation
            </h1>
            <p className="text-xl text-zk-gray">
              REST API for integrating zkRune into your applications
            </p>
          </div>

          {/* Quick Start */}
          <div className="mb-12 p-8 bg-zk-dark/30 border border-zk-primary/20 rounded-2xl">
            <h2 className="font-hatton text-2xl text-white mb-4">Quick Start</h2>
            <div className="bg-zk-darker rounded-lg p-6">
              <pre className="text-sm text-zk-gray font-mono overflow-x-auto">
{`// JavaScript/TypeScript
const response = await fetch('https://zkrune.com/api/generate-proof', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'age-verification',
    inputs: {
      birthYear: '1995',
      currentYear: '2024',
      minimumAge: '18'
    }
  })
});

const data = await response.json();
console.log(data.proof);`}
              </pre>
            </div>
          </div>

          {/* Endpoints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Generate Proof */}
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-zk-primary/20 text-zk-primary rounded text-sm font-mono">
                  POST
                </span>
                <code className="text-white font-mono text-sm">/api/generate-proof</code>
              </div>

              <p className="text-zk-gray mb-6">
                Generate a zero-knowledge proof for a template
              </p>

              <h3 className="text-white font-medium mb-3">Request Body:</h3>
              <div className="bg-zk-darker rounded-lg p-4 mb-4">
                <pre className="text-xs text-zk-gray font-mono">{`{
  "templateId": "age-verification",
  "inputs": {
    "birthYear": "1995",
    "currentYear": "2024",
    "minimumAge": "18"
  }
}`}</pre>
              </div>

              <h3 className="text-white font-medium mb-3">Response:</h3>
              <div className="bg-zk-darker rounded-lg p-4">
                <pre className="text-xs text-zk-gray font-mono">{`{
  "success": true,
  "proof": {
    "groth16Proof": {...},
    "publicSignals": [...],
    "verificationKey": {...},
    "isValid": true,
    "note": "Generated in Xs"
  },
  "timing": 1234
}`}</pre>
              </div>
            </div>

            {/* Verify Proof */}
            <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-zk-secondary/20 text-zk-secondary rounded text-sm font-mono">
                  POST
                </span>
                <code className="text-white font-mono text-sm">/api/verify-proof</code>
              </div>

              <p className="text-zk-gray mb-6">
                Verify a zero-knowledge proof
              </p>

              <h3 className="text-white font-medium mb-3">Request Body:</h3>
              <div className="bg-zk-darker rounded-lg p-4 mb-4">
                <pre className="text-xs text-zk-gray font-mono">{`{
  "proof": {...},
  "publicSignals": [...],
  "vKey": {...}
}`}</pre>
              </div>

              <h3 className="text-white font-medium mb-3">Response:</h3>
              <div className="bg-zk-darker rounded-lg p-4">
                <pre className="text-xs text-zk-gray font-mono">{`{
  "success": true,
  "isValid": true,
  "message": "Proof verified!",
  "timing": 50
}`}</pre>
              </div>
            </div>
          </div>

          {/* Available Templates */}
          <div className="mb-12 bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8">
            <h2 className="font-hatton text-2xl text-white mb-6">Available Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'age-verification', name: 'Age Verification', inputs: 'birthYear, currentYear, minimumAge' },
                { id: 'balance-proof', name: 'Balance Proof', inputs: 'balance, minimumBalance' },
                { id: 'membership-proof', name: 'Membership Proof', inputs: 'memberId, groupHash' },
                { id: 'range-proof', name: 'Range Proof', inputs: 'value, minRange, maxRange' },
                { id: 'private-voting', name: 'Private Voting', inputs: 'voterId, voteChoice, pollId' },
              ].map((template) => (
                <div key={template.id} className="bg-zk-darker/50 rounded-lg p-4">
                  <code className="text-sm text-zk-primary font-mono">{template.id}</code>
                  <p className="text-sm text-white mt-2">{template.name}</p>
                  <p className="text-xs text-zk-gray mt-1">Inputs: {template.inputs}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Playground */}
          <div className="bg-zk-dark/30 border border-zk-primary/20 rounded-2xl p-8">
            <h2 className="font-hatton text-2xl text-white mb-4">API Playground</h2>
            <p className="text-zk-gray mb-6">Test the API directly in your browser</p>

            <button
              onClick={testAPI}
              disabled={isLoading}
              className="px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all disabled:opacity-50 mb-4"
            >
              {isLoading ? 'Testing...' : 'Test Generate Proof API'}
            </button>

            {testResult && (
              <div className="bg-zk-darker rounded-lg p-4">
                <p className="text-xs text-zk-gray mb-2">Response:</p>
                <pre className="text-xs text-white font-mono overflow-x-auto max-h-96 overflow-y-auto">
                  {testResult}
                </pre>
              </div>
            )}
          </div>

          {/* Rate Limits */}
          <div className="mt-12 p-6 bg-zk-secondary/10 border border-zk-secondary/20 rounded-xl">
            <h3 className="text-white font-medium mb-3">Rate Limits & Usage</h3>
            <ul className="text-sm text-zk-gray space-y-2">
              <li>• Free tier: Unlimited requests (for now)</li>
              <li>• Response time: 15-30 seconds (first proof), 2-5s (cached)</li>
              <li>• Max payload: 10KB</li>
              <li>• CORS: Enabled for all origins</li>
            </ul>
            <p className="text-xs text-zk-gray mt-4 opacity-60">
              Pro tip: Use the SDK (zkrune-sdk) for client-side generation - faster and more private!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

