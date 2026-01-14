"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { generateClientProof } from "@/lib/clientZkProof";

export default function APIDocsPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

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

  const testClientSide = async () => {
    setIsLoading(true);
    setTestResult("Generating client-side proof (in your browser!)...");

    try {
      const result = await generateClientProof("age-verification", {
        birthYear: "1995",
        currentYear: "2024",
        minimumAge: "18"
      });

      setTestResult(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setTestResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testClientVerify = async () => {
    setIsVerifying(true);
    setVerifyResult("Verifying client-side...");

    try {
      // Generate and verify proof using clientZkProof
      const result = await generateClientProof("age-verification", {
        birthYear: "1995",
        currentYear: "2024",
        minimumAge: "18"
      });

      if (!result.success || !result.proof) {
        throw new Error("Failed to generate proof");
      }

      // The proof is already verified in generateClientProof
      setVerifyResult(JSON.stringify({
        success: true,
        isValid: result.proof.isValid,
        message: result.proof.isValid ? "Proof verified!" : "Proof invalid",
        timing: `${result.timing}ms`,
        note: "Generated and verified in browser - never sent to server!",
        proofHash: result.proof.proofHash
      }, null, 2));
    } catch (error: any) {
      setVerifyResult(`Error: ${error.message}`);
    } finally {
      setIsVerifying(false);
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
            <p className="text-xl text-zk-gray mb-6">
              Integrate zkRune into your applications with REST API and Client-Side SDK
            </p>
            
            {/* Recommendation Banner */}
            <div className="p-6 bg-gradient-to-r from-zk-primary/20 to-zk-secondary/20 border border-zk-primary/30 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg mb-2">Recommended: Client-Side SDK</h3>
                  <p className="text-zk-gray text-sm mb-3">
                    Faster, more secure, and no server costs! Generate and verify proofs directly in the browser.
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1 text-zk-primary">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      10x faster
                    </span>
                    <span className="flex items-center gap-1 text-zk-primary">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Full privacy
                    </span>
                    <span className="flex items-center gap-1 text-zk-primary">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      No server load
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start - Client-Side SDK */}
          <div className="mb-12 p-8 bg-zk-dark/30 border border-zk-primary/20 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <h2 className="font-hatton text-2xl text-white mb-1">Quick Start - Client-Side SDK</h2>
                  <p className="text-zk-gray text-sm">Recommended method - Runs in browser</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-zk-primary/20 text-zk-primary text-xs rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Fastest
              </span>
            </div>
            
            <div className="space-y-4">
              {/* Installation */}
              <div>
                <p className="text-zk-gray text-sm mb-2">1. Install the SDK:</p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <pre className="text-sm text-zk-gray font-mono">
npm install @zkrune/sdk
                  </pre>
                </div>
              </div>

              {/* Generate Proof */}
              <div>
                <p className="text-zk-gray text-sm mb-2">2. Generate proof (in browser):</p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <pre className="text-sm text-zk-gray font-mono overflow-x-auto">
{`import { generateProof } from '@zkrune/sdk';

const result = await generateProof({
  templateId: 'age-verification',
  inputs: {
    age: '25',
    minAge: '18'
  }
});

if (result.success) {
  console.log('Proof:', result.proof);
}`}
                  </pre>
                </div>
              </div>

              {/* Verify Proof */}
              <div>
                <p className="text-zk-gray text-sm mb-2">3. Verify proof (in browser):</p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <pre className="text-sm text-zk-gray font-mono overflow-x-auto">
{`import { verifyProof } from '@zkrune/sdk';

const isValid = await verifyProof({
  proof: result.proof.groth16Proof,
  publicSignals: result.proof.publicSignals,
  verificationKey: result.proof.verificationKey
});

console.log('Valid:', isValid); // true/false`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* REST API Alternative - DEPRECATED */}
          <div className="mb-12 p-8 bg-zk-dark/30 border border-red-500/20 rounded-2xl opacity-60">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-hatton text-2xl text-white mb-2">
                  <span className="line-through text-zk-gray">Alternative: REST API</span>
                  <span className="ml-3 px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full uppercase font-bold">
                    DEPRECATED
                  </span>
                </h2>
                <p className="text-zk-gray text-sm flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Removed for better privacy - Use client-side generation above
                </p>
              </div>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Removed
              </span>
            </div>
            <div className="bg-zk-darker rounded-lg p-6">
              <pre className="text-sm text-zk-gray font-mono overflow-x-auto">
{`const response = await fetch('https://zkrune.com/api/generate-proof', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateId: 'age-verification',
    inputs: {
      age: '25',
      minAge: '18'
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
            {/* Generate Proof - DEPRECATED */}
            <div className="bg-zk-dark/30 border border-red-500/20 rounded-2xl p-8 opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm font-mono line-through">
                  POST
                </span>
                <code className="text-zk-gray font-mono text-sm line-through">/api/generate-proof</code>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded uppercase font-bold">
                  DEPRECATED
                </span>
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                <p className="text-sm text-red-300">
                  Note: This endpoint has been removed. Use client-side generation for better privacy and security.
                </p>
              </div>

              <p className="text-zk-gray mb-6">
                <span className="line-through">Generate a zero-knowledge proof for a template</span>
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
          <div className="bg-zk-dark/30 border border-zk-primary/20 rounded-2xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h2 className="font-hatton text-2xl text-white">Interactive Playground</h2>
                <p className="text-zk-gray text-sm">Test examples directly in your browser!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Client-Side Test */}
              <div className="border border-zk-primary/30 rounded-xl p-6 bg-zk-darker/50">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <h3 className="text-white font-medium">Client-Side Proof</h3>
                    <p className="text-xs text-zk-gray">Generate in browser</p>
                  </div>
                </div>
                <button
                  onClick={testClientSide}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Test Client-Side
                    </>
                  )}
                </button>
              </div>

              {/* Server-Side Test */}
              <div className="border border-zk-gray/30 rounded-xl p-6 bg-zk-darker/50">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-zk-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  <div>
                    <h3 className="text-white font-medium">Server-Side Proof</h3>
                    <p className="text-xs text-zk-gray">Via REST API</p>
                  </div>
                </div>
                <button
                  onClick={testAPI}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-zk-gray/30 text-white rounded-lg font-medium hover:bg-zk-gray/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                      Test API
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className="bg-zk-darker rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-xs text-zk-gray">Result:</p>
                </div>
                <pre className="text-xs text-white font-mono overflow-x-auto max-h-96 overflow-y-auto">
                  {testResult}
                </pre>
              </div>
            )}

            {/* Client-Side Verification Test */}
            <div className="border-t border-zk-gray/20 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-zk-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-white font-medium">Client-Side Verification</h3>
                  <p className="text-xs text-zk-gray">Verify proof in browser (never sent to server!)</p>
                </div>
              </div>
              
              <button
                onClick={testClientVerify}
                disabled={isVerifying}
                className="px-6 py-3 bg-zk-secondary/30 text-white rounded-lg font-medium hover:bg-zk-secondary/40 transition-all disabled:opacity-50 mb-4 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Generate & Verify Proof
                  </>
                )}
              </button>

              {verifyResult && (
                <div className="bg-zk-darker rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-zk-gray">Verification Result:</p>
                  </div>
                  <pre className="text-xs text-white font-mono overflow-x-auto">
                    {verifyResult}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Performance Comparison */}
          <div className="mb-12 bg-gradient-to-br from-zk-primary/10 to-zk-secondary/10 border border-zk-primary/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-8 h-8 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="font-hatton text-2xl text-white">Performance Comparison</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Client-Side */}
              <div className="bg-zk-darker/80 rounded-xl p-6 border border-zk-primary/30">
                <div className="mb-3">
                  <svg className="w-10 h-10 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Client-Side SDK</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zk-gray">Proof Generation:</span>
                    <span className="text-zk-primary font-medium">~200ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zk-gray">Verification:</span>
                    <span className="text-zk-primary font-medium">~50ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zk-gray">Privacy:</span>
                    <span className="text-zk-primary font-medium">Full</span>
                  </div>
                </div>
              </div>

              {/* Server-Side */}
              <div className="bg-zk-darker/80 rounded-xl p-6 border border-zk-gray/30">
                <div className="mb-3">
                  <svg className="w-10 h-10 text-zk-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">REST API</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zk-gray">Proof Generation:</span>
                    <span className="text-zk-gray font-medium">~1800ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zk-gray">Verification:</span>
                    <span className="text-zk-gray font-medium">~10s+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zk-gray">Privacy:</span>
                    <span className="text-zk-gray font-medium">Medium</span>
                  </div>
                </div>
              </div>

              {/* Blockchain */}
              <div className="bg-zk-darker/80 rounded-xl p-6 border border-zk-secondary/30">
                <div className="mb-3">
                  <svg className="w-10 h-10 text-zk-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Blockchain Verify</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zk-gray">Proof Generation:</span>
                    <span className="text-zk-secondary font-medium">Client</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zk-gray">Verification:</span>
                    <span className="text-zk-secondary font-medium">On-chain</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zk-gray">Privacy:</span>
                    <span className="text-zk-secondary font-medium">Maximum</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-zk-primary/10 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-zk-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-zk-gray">
                <span className="text-white font-medium">Conclusion:</span> Client-side SDK is 9x faster and more secure! 
                Use client-side in production apps, only use API for metadata and record keeping.
              </p>
            </div>
          </div>

          {/* Usage Recommendations */}
          <div className="mt-12 p-6 bg-gradient-to-r from-zk-primary/10 to-zk-secondary/10 border border-zk-primary/20 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-white font-medium text-lg">Usage Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client-Side Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-zk-primary font-medium">Client-Side SDK (Recommended)</h4>
                </div>
                <ul className="text-sm text-zk-gray space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    9x faster performance
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Full privacy (data never leaves browser)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No server costs
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited usage
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Runs in browser via WASM
                  </li>
                </ul>
              </div>

              {/* API Recommendations */}
              <div className="space-y-3">
                <h4 className="text-zk-gray font-medium">REST API (Optional)</h4>
                <ul className="text-sm text-zk-gray space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-gray flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Slower (~1.8s generate, 10s+ verify)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-gray flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    Runs on server
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-gray flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Use for metadata and record keeping
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-gray flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Data sent to server
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-zk-gray flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Rate limits may apply
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-zk-darker/50 rounded-lg border border-zk-primary/20 flex items-start gap-3">
              <svg className="w-5 h-5 text-zk-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-zk-gray">
                <span className="text-zk-primary font-medium">Production Recommendation:</span> 
                {' '}Use client-side for proof generation and verification. Only use API for recording proofs 
                to blockchain or storing metadata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

