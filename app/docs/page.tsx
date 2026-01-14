"use client";

import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function DocsPage() {
  const sections = [
    {
      title: "Getting Started",
      items: [
        { name: "Introduction", href: "#introduction" },
        { name: "Quick Start", href: "#quick-start" },
        { name: "How It Works", href: "#how-it-works" },
      ],
    },
    {
      title: "Templates",
      items: [
        { name: "Age Verification", href: "#age-verification" },
        { name: "Balance Proof", href: "#balance-proof" },
        { name: "Membership Proof", href: "#membership-proof" },
        { name: "Range Proof", href: "#range-proof" },
        { name: "Private Voting", href: "#private-voting" },
        { name: "Hash Preimage", href: "#hash-preimage" },
        { name: "Credential Proof", href: "#credential-proof" },
        { name: "Token Swap", href: "#token-swap" },
        { name: "Signature Verification", href: "#signature-verification" },
        { name: "Patience Proof", href: "#patience-proof" },
        { name: "Quadratic Voting", href: "#quadratic-voting" },
        { name: "NFT Ownership", href: "#nft-ownership" },
        { name: "Anonymous Reputation", href: "#anonymous-reputation" },
      ],
    },
    {
      title: "ZK Circuits",
      items: [
        { name: "Circuit Architecture", href: "#circuits" },
        { name: "Compiling Circuits", href: "#compiling" },
        { name: "Verification", href: "#verification" },
      ],
    },
    {
      title: "API Reference",
      items: [
        { name: "Generate Proof", href: "#api-generate" },
        { name: "Verify Proof", href: "#api-verify" },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-24 px-8 pb-12">
        <div className="max-w-7xl mx-auto flex gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              {sections.map((section) => (
                <div key={section.title}>
                  <h3 className="font-medium text-white mb-3">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm text-zk-gray hover:text-zk-primary transition-colors"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 max-w-4xl">
            {/* Header */}
            <div className="mb-12">
              <h1 className="font-hatton text-5xl text-white mb-4">
                Documentation
              </h1>
              <p className="text-xl text-zk-gray">
                Everything you need to know about zkRune and zero-knowledge proofs.
              </p>
            </div>

            {/* Introduction */}
            <section id="introduction" className="mb-16">
              <h2 className="font-hatton text-3xl text-white mb-4">Introduction</h2>
              <div className="prose prose-invert max-w-none">
            <p className="text-zk-gray leading-relaxed mb-4">
              zkRune is the first browser-based zero-knowledge proof builder. Generate and verify 
              real Groth16 zk-SNARKs entirely in your browser - no server calls, complete privacy.
            </p>
            <div className="p-4 bg-zk-primary/10 border border-zk-primary/20 rounded-lg mb-4">
              <p className="text-sm text-white font-medium mb-2">Key Features:</p>
              <ul className="text-sm text-zk-gray space-y-1 list-disc list-inside">
                <li>Client-side ZK proof generation (browser-based, 100% private)</li>
                <li>13 Real Groth16 zk-SNARK circuits (compiled Circom)</li>
                <li>Visual circuit builder (drag-drop, no code)</li>
                <li>Cryptographic verification in browser</li>
                <li>Zero server dependency - your data never leaves your device</li>
                <li>100% open source</li>
              </ul>
            </div>
              </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="mb-16">
              <h2 className="font-hatton text-3xl text-white mb-4">How It Works</h2>
              <p className="text-zk-gray mb-6">
                zkRune generates real zero-knowledge proofs entirely in your browser using snarkjs and compiled Circom circuits.
              </p>
              
              <div className="space-y-4">
                <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-3">1. Choose Template or Build Custom</h3>
                  <p className="text-sm text-zk-gray">
                    Select from 13 pre-built templates or use the Visual Circuit Builder to design your own ZK circuit.
                  </p>
                </div>

                <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-3">2. Browser Downloads Circuit Files</h3>
                  <p className="text-sm text-zk-gray">
                    Your browser automatically loads the compiled WASM circuit (~35KB) and proving key (~4-40KB). These files are cached for future use.
                  </p>
                </div>

                <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-3">3. Generate Proof (Client-Side)</h3>
                  <p className="text-sm text-zk-gray mb-2">
                    snarkjs runs in your browser to generate a real Groth16 zk-SNARK proof. Your input data never leaves your device.
                  </p>
                  <p className="text-xs text-zk-gray bg-zk-darker/50 p-2 rounded">
                    First time: 15-30 seconds • Cached: 2-5 seconds
                  </p>
                </div>

                <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-3">4. Verify Independently (Client-Side)</h3>
                  <p className="text-sm text-zk-gray">
                    Cryptographic verification also runs in browser. Anyone can verify your proof using our tool or external snarkjs verifiers.
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quick-start" className="mb-16">
              <h2 className="font-hatton text-3xl text-white mb-4">Quick Start</h2>
              <div className="space-y-4">
                <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-3">1. Choose a Template</h3>
                  <p className="text-sm text-zk-gray mb-3">
                    Visit <Link href="/templates" className="text-zk-primary hover:underline">/templates</Link> and 
                    select one of 13 zero-knowledge proof types.
                  </p>
                </div>

                <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-3">2. Generate Proof</h3>
                  <p className="text-sm text-zk-gray mb-3">
                    Fill in the simple form with your data. Click "Generate ZK Proof" and wait ~1 second.
                  </p>
                </div>

                <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-3">3. Export & Use</h3>
                  <p className="text-sm text-zk-gray">
                    Download your proof as JSON or code. Verify independently. Use in your apps.
                  </p>
                </div>
              </div>
            </section>

            {/* Templates */}
            <section id="templates" className="mb-16">
              <h2 className="font-hatton text-3xl text-white mb-6">Templates</h2>
              
              {/* Age Verification */}
              <div id="age-verification" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Age Verification</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove you're 18+ without revealing your exact age.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    age = currentYear - birthYear; isValid = (age ≥ 18)
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/age-verification" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* Balance Proof */}
              <div id="balance-proof" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Balance Proof</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove minimum balance without showing actual amount.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    hasMinimum = (balance ≥ minimumBalance)
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/balance-proof" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* Membership */}
              <div id="membership-proof" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Membership Proof</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove group membership without revealing identity.
                </p>
                <Link href="/templates/membership-proof" className="text-sm text-zk-primary hover:underline">
                  Try it →
                </Link>
              </div>

              {/* Range */}
              <div id="range-proof" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Range Proof</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove value is within range without exact number.
                </p>
                <Link href="/templates/range-proof" className="text-sm text-zk-primary hover:underline">
                  Try it →
                </Link>
              </div>

              {/* Voting */}
              <div id="private-voting" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Private Voting</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Vote anonymously with cryptographic proof.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    isValid = (voterId ∈ eligibleVoters) ∧ (choice ∈ validOptions)
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/private-voting" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* Hash Preimage */}
              <div id="hash-preimage" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Hash Preimage</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove you know the preimage of a hash without revealing it.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    hash(secret) === publicHash
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/hash-preimage" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* Credential Proof */}
              <div id="credential-proof" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Credential Proof</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove you have valid credentials without revealing details.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    verify(credential, issuerPublicKey) ∧ (expiryDate ≥ currentDate)
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/credential-proof" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* Token Swap */}
              <div id="token-swap" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Token Swap</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove fair token exchange without revealing amounts.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    (amountA × rateA) === (amountB × rateB)
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/token-swap" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* Signature Verification */}
              <div id="signature-verification" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Signature Verification</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove you have a valid signature without revealing the signer.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    verify(signature, message, publicKey) === true
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/signature-verification" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* Patience Proof */}
              <div id="patience-proof" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Patience Proof</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove computation completion without revealing intermediate steps.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    result = iterate(input, steps) ∧ (steps ≥ threshold)
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/patience-proof" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* Quadratic Voting */}
              <div id="quadratic-voting" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Quadratic Voting</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Vote with quadratic cost without revealing vote weight.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    cost = votes² ∧ (cost ≤ credits)
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/quadratic-voting" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* NFT Ownership */}
              <div id="nft-ownership" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">NFT Ownership</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove NFT ownership without revealing wallet address.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    hash(ownerAddress, tokenId) === merkleRoot
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/nft-ownership" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>

              {/* Anonymous Reputation */}
              <div id="anonymous-reputation" className="mb-8 p-6 bg-zk-dark/30 border border-zk-gray/20 rounded-xl">
                <h3 className="text-xl text-white font-medium mb-3">Anonymous Reputation</h3>
                <p className="text-sm text-zk-gray mb-4">
                  Prove reputation score without revealing identity.
                </p>
                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Circuit:</p>
                  <code className="text-xs text-zk-primary">
                    (reputationScore ≥ threshold) ∧ verify(credential)
                  </code>
                </div>
                <div className="mt-3">
                  <Link href="/templates/anonymous-reputation" className="text-sm text-zk-primary hover:underline">
                    Try it →
                  </Link>
                </div>
              </div>
            </section>

            {/* Compiling */}
            <section id="compiling" className="mb-16">
              <h2 className="font-hatton text-3xl text-white mb-4">Compiling Circuits</h2>
              <p className="text-zk-gray mb-6">
                Learn how to compile Circom circuits locally for advanced use.
              </p>
              <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
                <p className="text-sm text-zk-gray mb-4">
                  For detailed compilation instructions, see the README on GitHub.
                </p>
                <a
                  href="https://github.com/louisstein94/zkrune#real-zk-circuits-optional"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all"
                >
                  View Compile Guide on GitHub
                </a>
              </div>
            </section>

            {/* Circuits */}
            <section id="circuits" className="mb-16">
              <h2 className="font-hatton text-3xl text-white mb-4">ZK Circuit Architecture</h2>
              <p className="text-zk-gray mb-6">
                zkRune uses Circom language to define zero-knowledge circuits. All circuits are compiled 
                to WASM for browser execution and use Groth16 proving system.
              </p>
              
              <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6 mb-4">
                <h3 className="text-white font-medium mb-3">Circuit Files:</h3>
                <ul className="text-sm text-zk-gray space-y-2">
                  <li>• <code className="text-zk-primary">.wasm</code> - Circuit compiled for browser (~35KB each)</li>
                  <li>• <code className="text-zk-primary">.zkey</code> - Proving key (~4-40KB each)</li>
                  <li>• <code className="text-zk-primary">_vkey.json</code> - Verification key (~3KB each)</li>
                </ul>
              </div>

              <div className="bg-zk-secondary/10 border border-zk-secondary/20 rounded-xl p-6">
                <p className="text-sm text-white font-medium mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-zk-secondary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Performance:
                </p>
                <p className="text-xs text-zk-gray">
                  All circuits optimized for speed. Average proof generation: 0.44 seconds (CLI tested).
                </p>
              </div>
            </section>

            {/* API Reference - DEPRECATED */}
            <section id="api-generate" className="mb-16">
              <h2 className="font-hatton text-3xl text-white mb-4">API Reference</h2>
              
              <div className="bg-zk-dark/30 border border-red-500/20 rounded-xl p-6 mb-6 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-zk-gray font-medium line-through">POST /api/generate-proof</h3>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full uppercase font-bold">
                    DEPRECATED
                  </span>
                </div>
                
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <p className="text-sm text-red-300 mb-2">
                    <strong>Note: This API endpoint has been removed.</strong>
                  </p>
                  <p className="text-xs text-red-200">
                    Migration: Use client-side proof generation with <code className="bg-black/30 px-2 py-1 rounded">generateClientProof()</code> for better privacy.
                  </p>
                </div>
                
                <p className="text-sm text-zk-gray mb-4 line-through">Generate a zero-knowledge proof.</p>
                
                <div className="bg-zk-darker rounded-lg p-4 mb-4">
                  <p className="text-xs text-zk-gray mb-2">Request:</p>
                  <pre className="text-xs text-zk-primary font-mono overflow-x-auto">{`{
  "templateId": "age-verification",
  "inputs": {
    "birthYear": "1995",
    "currentYear": "2024",
    "minimumAge": "18"
  }
}`}</pre>
                </div>

                <div className="bg-zk-darker rounded-lg p-4">
                  <p className="text-xs text-zk-gray mb-2">Response:</p>
                  <pre className="text-xs text-zk-primary font-mono overflow-x-auto">{`{
  "success": true,
  "proof": {
    "groth16Proof": {...},
    "publicSignals": [...],
    "verificationKey": {...}
  },
  "metadata": {
    "realProof": true,
    "method": "snarkjs-cli"
  }
}`}</pre>
                </div>
              </div>
            </section>

            {/* GitHub & Contributing */}
            <section className="mb-16">
              <h2 className="font-hatton text-3xl text-white mb-4">Open Source</h2>
              <p className="text-zk-gray mb-6">
                zkRune is fully open source. You can view the code, contribute, or fork the project on GitHub.
              </p>
              
              <div className="flex gap-4">
                <a
                  href="https://github.com/louisstein94/zkrune"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all"
                >
                  View on GitHub →
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

