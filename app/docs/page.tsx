"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";

type TabId = "start" | "sdk" | "widget" | "api" | "circuits" | "trust";

const TABS: { id: TabId; label: string }[] = [
  { id: "start", label: "Getting Started" },
  { id: "sdk", label: "SDK" },
  { id: "widget", label: "Widget" },
  { id: "api", label: "Verify API" },
  { id: "circuits", label: "Circuits" },
  { id: "trust", label: "Trust Model" },
];

const CIRCUITS_DATA = [
  { id: "age-verification", name: "Age Verification", category: "identity", trust: "self-asserted", description: "Prove minimum age without revealing birth year", fields: [{ name: "birthYear", type: "integer", label: "Birth Year" }, { name: "currentYear", type: "integer", label: "Current Year" }, { name: "minimumAge", type: "integer", label: "Minimum Age" }] },
  { id: "balance-proof", name: "Balance Proof", category: "financial", trust: "production", description: "Prove balance exceeds threshold (attested when wallet connected)", fields: [{ name: "balance", type: "integer", label: "Balance" }, { name: "minimumBalance", type: "integer", label: "Minimum Balance" }] },
  { id: "membership-proof", name: "Membership Proof", category: "identity", trust: "production", description: "Prove group membership via Merkle inclusion (depth=16, Poseidon)", fields: [{ name: "memberId", type: "hash", label: "Member ID" }, { name: "pathElements", type: "hash", label: "Path Elements [16]" }, { name: "pathIndices", type: "hash", label: "Path Indices [16]" }, { name: "root", type: "hash", label: "Merkle Root" }] },
  { id: "range-proof", name: "Range Proof", category: "financial", trust: "self-asserted", description: "Prove a value is within a range", fields: [{ name: "value", type: "integer", label: "Value" }, { name: "minRange", type: "integer", label: "Minimum" }, { name: "maxRange", type: "integer", label: "Maximum" }] },
  { id: "private-voting", name: "Private Voting", category: "governance", trust: "production", description: "Cast verifiable vote without revealing identity", fields: [{ name: "voterId", type: "hash", label: "Voter ID" }, { name: "voteChoice", type: "integer", label: "Vote Choice" }, { name: "pollId", type: "hash", label: "Poll ID" }] },
  { id: "hash-preimage", name: "Hash Preimage", category: "cryptographic", trust: "production", description: "Prove knowledge of a hash preimage", fields: [{ name: "preimage", type: "hash", label: "Preimage" }, { name: "salt", type: "hash", label: "Salt" }, { name: "expectedHash", type: "hash", label: "Expected Hash" }] },
  { id: "credential-proof", name: "Credential Proof", category: "identity", trust: "self-asserted", description: "Prove valid credential without exposing it", fields: [{ name: "credentialHash", type: "hash", label: "Credential Hash" }, { name: "credentialSecret", type: "hash", label: "Credential Secret" }, { name: "validUntil", type: "timestamp", label: "Valid Until" }, { name: "currentTime", type: "timestamp", label: "Current Time" }, { name: "expectedHash", type: "hash", label: "Expected Hash" }] },
  { id: "token-swap", name: "Token Swap", category: "financial", trust: "self-asserted", description: "Prove swap eligibility without revealing balance", fields: [{ name: "tokenABalance", type: "integer", label: "Token A Balance" }, { name: "swapSecret", type: "hash", label: "Swap Secret" }, { name: "requiredTokenA", type: "integer", label: "Required Token A" }, { name: "swapRate", type: "integer", label: "Swap Rate" }, { name: "minReceive", type: "integer", label: "Min Receive" }] },
  { id: "signature-verification", name: "Signature Verification", category: "cryptographic", trust: "production", description: "Verify EdDSA signature inside a ZK circuit", fields: [{ name: "R8x", type: "hash", label: "R8 X" }, { name: "R8y", type: "hash", label: "R8 Y" }, { name: "S", type: "hash", label: "S" }, { name: "Ax", type: "hash", label: "Public Key X" }, { name: "Ay", type: "hash", label: "Public Key Y" }, { name: "M", type: "hash", label: "Message" }] },
  { id: "patience-proof", name: "Patience Proof", category: "cryptographic", trust: "production", description: "Prove minimum wait period elapsed", fields: [{ name: "startTime", type: "timestamp", label: "Start Time" }, { name: "endTime", type: "timestamp", label: "End Time" }, { name: "secret", type: "hash", label: "Secret" }, { name: "minimumWaitTime", type: "integer", label: "Min Wait" }, { name: "commitmentHash", type: "hash", label: "Commitment Hash" }] },
  { id: "quadratic-voting", name: "Quadratic Voting", category: "governance", trust: "self-asserted", description: "Quadratic vote weighted by token balance", fields: [{ name: "voterId", type: "hash", label: "Voter ID" }, { name: "tokenBalance", type: "integer", label: "Token Balance" }, { name: "voteChoice", type: "integer", label: "Vote Choice" }, { name: "pollId", type: "hash", label: "Poll ID" }, { name: "minTokens", type: "integer", label: "Min Tokens" }] },
  { id: "nft-ownership", name: "NFT Ownership", category: "financial", trust: "self-asserted", description: "Prove NFT ownership without revealing which one", fields: [{ name: "nftTokenId", type: "integer", label: "NFT Token ID" }, { name: "ownerSecret", type: "hash", label: "Owner Secret" }, { name: "collectionRoot", type: "hash", label: "Collection Root" }, { name: "minTokenId", type: "integer", label: "Min Token ID" }, { name: "maxTokenId", type: "integer", label: "Max Token ID" }] },
  { id: "anonymous-reputation", name: "Anonymous Reputation", category: "identity", trust: "self-asserted", description: "Prove reputation score exceeds threshold anonymously", fields: [{ name: "userId", type: "hash", label: "User ID" }, { name: "reputationScore", type: "integer", label: "Reputation Score" }, { name: "userNonce", type: "hash", label: "User Nonce" }, { name: "thresholdScore", type: "integer", label: "Threshold" }, { name: "platformId", type: "hash", label: "Platform ID" }] },
  { id: "whale-holder", name: "Whale Holder", category: "financial", trust: "self-asserted", description: "Prove whale-level holdings without revealing amount", fields: [{ name: "balance", type: "integer", label: "Balance" }, { name: "minimumBalance", type: "integer", label: "Whale Threshold" }] },
];

const CAT_ICONS: Record<string, React.ReactNode> = {
  identity: <svg className="w-4 h-4 text-zk-primary inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  financial: <svg className="w-4 h-4 text-zk-secondary inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  governance: <svg className="w-4 h-4 text-zk-accent inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  cryptographic: <svg className="w-4 h-4 text-yellow-400 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
};

const CATEGORIES: Record<string, { label: string }> = {
  identity: { label: "Identity" },
  financial: { label: "Financial" },
  governance: { label: "Governance" },
  cryptographic: { label: "Cryptographic" },
};

function Code({ children, block }: { children: string; block?: boolean }) {
  if (block) {
    return (
      <div className="bg-zk-darker rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm text-zk-gray font-mono whitespace-pre">{children}</pre>
      </div>
    );
  }
  return <code className="px-1.5 py-0.5 bg-zk-darker rounded text-zk-primary text-sm font-mono">{children}</code>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-hatton text-xl text-white mb-4 mt-8 first:mt-0">{children}</h3>;
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );
}

function ParamRow({ name, type, desc }: { name: string; type: string; desc: string }) {
  return (
    <tr className="border-b border-zk-gray/10">
      <td className="py-2 pr-4"><Code>{name}</Code></td>
      <td className="py-2 pr-4 text-zk-gray text-sm">{type}</td>
      <td className="py-2 text-zk-gray text-sm">{desc}</td>
    </tr>
  );
}

// ─── Tab: Getting Started ────────────────────────────────────────────

function TabStart() {
  return (
    <div>
      <SectionTitle>Choose Your Integration</SectionTitle>
      <p className="text-zk-gray mb-6">Three ways to add ZK verification. All proofs are generated client-side — secrets never leave the user&apos;s device.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* SDK */}
        <div className="bg-zk-dark/30 border border-zk-primary/30 rounded-xl p-6">
          <svg className="w-8 h-8 text-zk-primary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <h4 className="text-white font-medium mb-2">SDK (npm)</h4>
          <p className="text-zk-gray text-sm mb-4">Full control. Import into any JS/TS project.</p>
          <Code block>{`npm install zkrune-sdk snarkjs

import { generateProof, verifyProofRemote }
  from 'zkrune-sdk';

const result = await generateProof({
  templateId: 'age-verification',
  inputs: { birthYear: '1990',
    currentYear: '2026', minimumAge: '18' },
});

const { isValid } = await verifyProofRemote({
  circuitName: 'age-verification',
  proof: result.proof.groth16Proof,
  publicSignals: result.proof.publicSignals,
});`}</Code>
        </div>

        {/* Widget */}
        <div className="bg-zk-dark/30 border border-zk-secondary/30 rounded-xl p-6">
          <svg className="w-8 h-8 text-zk-secondary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          <h4 className="text-white font-medium mb-2">Widget (script tag)</h4>
          <p className="text-zk-gray text-sm mb-4">Drop-in. No bundler needed.</p>
          <Code block>{`<script src="https://cdn.jsdelivr.net/
  npm/zkrune-widget@latest/dist/
  zkrune-widget.global.js"></script>

<div id="zk"></div>
<script>
  ZkRuneWidget.init({
    container: '#zk',
    theme: 'dark',
    onResult: (r) => console.log(r.verified)
  });
</script>`}</Code>
        </div>

        {/* API */}
        <div className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl p-6">
          <svg className="w-8 h-8 text-zk-gray mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
          <h4 className="text-white font-medium mb-2">Verify API</h4>
          <p className="text-zk-gray text-sm mb-4">Server-side verification against trusted keys.</p>
          <Code block>{`POST https://zkrune.com/api/verify-proof

{
  "circuitName": "age-verification",
  "proof": { "pi_a": [...], ... },
  "publicSignals": ["1"]
}

// Response:
// { "isValid": true, "timing": 2 }`}</Code>
        </div>
      </div>

      <SectionTitle>Which One Should I Use?</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zk-gray/20">
              <th className="text-left py-3 text-zk-gray font-medium">Criteria</th>
              <th className="text-left py-3 text-zk-primary font-medium">SDK</th>
              <th className="text-left py-3 text-zk-secondary font-medium">Widget</th>
              <th className="text-left py-3 text-zk-gray font-medium">Verify API</th>
            </tr>
          </thead>
          <tbody className="text-zk-gray">
            <tr className="border-b border-zk-gray/10"><td className="py-2">Bundler required</td><td className="py-2 text-zk-primary">Yes</td><td className="py-2 text-zk-secondary">No</td><td className="py-2">No</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2">Proof generation</td><td className="py-2 text-zk-primary">Client</td><td className="py-2 text-zk-secondary">Client</td><td className="py-2">N/A (verify only)</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2">UI included</td><td className="py-2 text-zk-primary">No</td><td className="py-2 text-zk-secondary">Yes</td><td className="py-2">No</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2">Customization</td><td className="py-2 text-zk-primary">Full</td><td className="py-2 text-zk-secondary">Theme + config</td><td className="py-2">Full</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2">Best for</td><td className="py-2 text-zk-primary">dApps, custom UI</td><td className="py-2 text-zk-secondary">Blogs, landing pages</td><td className="py-2">Backend verification</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: SDK Reference ──────────────────────────────────────────────

function TabSDK() {
  return (
    <div>
      <SectionTitle>Installation</SectionTitle>
      <Code block>{`npm install zkrune-sdk snarkjs`}</Code>

      <SectionTitle>Quick Start</SectionTitle>
      <Code block>{`import { generateProof, verifyProofRemote, templates } from 'zkrune-sdk';

// 1. Generate proof (client-side, secrets stay in browser)
const result = await generateProof({
  templateId: templates.AGE_VERIFICATION,
  inputs: {
    birthYear: '1990',
    currentYear: '2026',
    minimumAge: '18',
  },
});

if (!result.success) throw new Error(result.error);

// 2. Verify against hosted verifier (trusted vKey on server)
const { isValid } = await verifyProofRemote({
  circuitName: templates.AGE_VERIFICATION,
  proof: result.proof!.groth16Proof,
  publicSignals: result.proof!.publicSignals,
});

// 3. Act on result
if (isValid) grantAccess();`}</Code>

      <SectionTitle>Core Functions</SectionTitle>

      <SubSection title="generateProof(options)">
        <p className="text-zk-gray text-sm mb-3">Generate a Groth16 proof client-side. Circuit WASM and zkey are fetched automatically.</p>
        <table className="w-full text-sm mb-3">
          <thead><tr className="border-b border-zk-gray/20"><th className="text-left py-2 text-zk-gray">Param</th><th className="text-left py-2 text-zk-gray">Type</th><th className="text-left py-2 text-zk-gray">Description</th></tr></thead>
          <tbody>
            <ParamRow name="templateId" type="TemplateId" desc="Circuit identifier (e.g. 'age-verification')" />
            <ParamRow name="inputs" type="Record<string, string>" desc="Circuit inputs as string key-value pairs" />
            <ParamRow name="circuitPath" type="string?" desc="Custom base URL for circuit artifacts" />
          </tbody>
        </table>
        <p className="text-zk-gray text-xs">Returns <Code>ZKProofResult</Code> with <Code>success</Code>, <Code>proof</Code>, <Code>error</Code>, <Code>timing</Code></p>
      </SubSection>

      <SubSection title="verifyProofRemote(options)">
        <p className="text-zk-gray text-sm mb-3">Verify a proof against the hosted verifier. The server loads its own trusted verification key.</p>
        <table className="w-full text-sm mb-3">
          <thead><tr className="border-b border-zk-gray/20"><th className="text-left py-2 text-zk-gray">Param</th><th className="text-left py-2 text-zk-gray">Type</th><th className="text-left py-2 text-zk-gray">Description</th></tr></thead>
          <tbody>
            <ParamRow name="circuitName" type="string" desc="Circuit identifier" />
            <ParamRow name="proof" type="Groth16Proof" desc="The generated proof object" />
            <ParamRow name="publicSignals" type="string[]" desc="Public signals from proof generation" />
            <ParamRow name="verifierUrl" type="string?" desc="Custom verifier URL (default: zkrune.com)" />
          </tbody>
        </table>
      </SubSection>

      <SubSection title="verifyProof(options) — Local">
        <p className="text-zk-gray text-sm mb-3">Verify a proof locally using snarkjs. Requires the verification key.</p>
        <table className="w-full text-sm mb-3">
          <thead><tr className="border-b border-zk-gray/20"><th className="text-left py-2 text-zk-gray">Param</th><th className="text-left py-2 text-zk-gray">Type</th><th className="text-left py-2 text-zk-gray">Description</th></tr></thead>
          <tbody>
            <ParamRow name="proof" type="Groth16Proof" desc="The generated proof object" />
            <ParamRow name="publicSignals" type="string[]" desc="Public signals" />
            <ParamRow name="verificationKey" type="VerificationKey" desc="Circuit verification key (JSON)" />
          </tbody>
        </table>
      </SubSection>

      <SectionTitle>ZkRune Class</SectionTitle>
      <Code block>{`import { ZkRune } from 'zkrune-sdk';

const zk = new ZkRune({
  circuitBaseUrl: '/circuits',  // custom artifact location
  verifierUrl: 'https://zkrune.com/api/verify-proof',
  logLevel: 'info',
});

const proof = await zk.prove('balance-proof', {
  balance: '50000',
  minimumBalance: '10000',
});

const local = await zk.verifyLocal(proof);
const remote = await zk.verifyRemote(proof);`}</Code>

      <SectionTitle>MembershipRegistry</SectionTitle>
      <p className="text-zk-gray text-sm mb-3">Build a group, publish the Merkle root, and let members prove inclusion with a ZK proof.</p>
      <Code block>{`import { MembershipRegistry, generateProof } from 'zkrune-sdk';

// 1. Integrator: build the group
const registry = MembershipRegistry.fromMembers(['alice', 'bob', 'charlie']);
const root = registry.getRoot(); // publish this root

// 2. Member: generate a Merkle inclusion proof
const inputs = registry.getCircuitInputs('alice');
// inputs = { memberId, pathElements, pathIndices, root }

// 3. Generate the ZK proof (client-side)
const result = await generateProof({
  templateId: 'membership-proof',
  inputs,
});

// The verifier checks: publicSignals[1] === published root
// The member's identity is never revealed.`}</Code>

      <SectionTitle>Utilities</SectionTitle>
      <Code block>{`import {
  CircuitLoader,     // fetch & cache WASM/zkey/vkey
  validateInputs,    // validate inputs against schema
  CIRCUIT_SCHEMAS,   // field metadata for all 14 circuits
  templates,         // template ID constants
} from 'zkrune-sdk';

// Validate before proving
const { valid, errors } = validateInputs('age-verification', {
  birthYear: '1990',
  currentYear: '2026',
  minimumAge: '18',
});`}</Code>

      <SectionTitle>Script Tag (No Bundler)</SectionTitle>
      <Code block>{`<script src="https://cdn.jsdelivr.net/npm/snarkjs@latest/build/snarkjs.min.js"></script>
<script type="module">
  import { generateProof, verifyProofRemote } from 'https://esm.sh/zkrune-sdk';

  const result = await generateProof({
    templateId: 'age-verification',
    inputs: { birthYear: '1990', currentYear: '2026', minimumAge: '18' },
  });

  if (result.success) {
    const { isValid } = await verifyProofRemote({
      circuitName: 'age-verification',
      proof: result.proof.groth16Proof,
      publicSignals: result.proof.publicSignals,
    });
    console.log('Verified:', isValid);
  }
</script>`}</Code>
    </div>
  );
}

// ─── Tab: Widget ─────────────────────────────────────────────────────

function TabWidget() {
  return (
    <div>
      <SectionTitle>Script Tag Integration</SectionTitle>
      <p className="text-zk-gray text-sm mb-4">Drop a single script tag to add a &quot;Verify with zkRune&quot; button with built-in modal UI. No bundler needed, no dependencies.</p>
      <Code block>{`<script src="https://cdn.jsdelivr.net/npm/zkrune-widget@latest/dist/zkrune-widget.global.js"></script>
<div id="zkrune-verify"></div>
<script>
  ZkRuneWidget.init({
    container: '#zkrune-verify',
    circuit: 'age-verification',     // optional — omit to show circuit picker
    theme: 'dark',                    // 'dark' | 'light'
    verifierUrl: 'https://zkrune.com/api/verify-proof',
    onResult: function(result) {
      console.log(result.verified);   // true or false
      console.log(result.proofHash);  // SHA-256 of proof
    },
    onError: function(err) {
      console.error(err.code, err.message);
    }
  });
</script>`}</Code>

      <SectionTitle>Config Options</SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zk-gray/20"><th className="text-left py-2 text-zk-gray">Option</th><th className="text-left py-2 text-zk-gray">Type</th><th className="text-left py-2 text-zk-gray">Default</th><th className="text-left py-2 text-zk-gray">Description</th></tr></thead>
          <tbody className="text-zk-gray">
            <tr className="border-b border-zk-gray/10"><td className="py-2"><Code>container</Code></td><td className="py-2">string | HTMLElement</td><td className="py-2">—</td><td className="py-2">CSS selector or DOM element (required)</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2"><Code>circuit</Code></td><td className="py-2">CircuitId</td><td className="py-2">—</td><td className="py-2">Pre-select a circuit; omit to show picker</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2"><Code>theme</Code></td><td className="py-2">&apos;dark&apos; | &apos;light&apos;</td><td className="py-2">&apos;dark&apos;</td><td className="py-2">Color theme</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2"><Code>circuitBaseUrl</Code></td><td className="py-2">string</td><td className="py-2">zkrune.com/circuits</td><td className="py-2">Where to fetch WASM + zkey</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2"><Code>verifierUrl</Code></td><td className="py-2">string</td><td className="py-2">zkrune.com/api/verify-proof</td><td className="py-2">Verification endpoint</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2"><Code>buttonLabel</Code></td><td className="py-2">string</td><td className="py-2">&apos;Verify with zkRune&apos;</td><td className="py-2">Button text</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2"><Code>onResult</Code></td><td className="py-2">function</td><td className="py-2">—</td><td className="py-2">Called with VerifyResult on success</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2"><Code>onError</Code></td><td className="py-2">function</td><td className="py-2">—</td><td className="py-2">Called with WidgetError on failure</td></tr>
          </tbody>
        </table>
      </div>

      <SectionTitle>ESM Import</SectionTitle>
      <Code block>{`import { init, verify } from 'zkrune-widget';

// Option A: Render button + modal
const widget = init({
  container: '#my-div',
  theme: 'light',
  onResult: (r) => console.log(r),
});
widget.destroy(); // cleanup

// Option B: Headless — no UI, programmatic
const result = await verify('age-verification', {
  birthYear: '1990',
  currentYear: '2026',
  minimumAge: '18',
});
console.log(result.verified);`}</Code>

      <SectionTitle>Result Object</SectionTitle>
      <Code block>{`{
  verified: boolean,
  circuitName: string,
  proof: { pi_a, pi_b, pi_c, protocol, curve },
  publicSignals: string[],
  proofHash: string,       // SHA-256 of proof
  timestamp: number        // Date.now()
}`}</Code>

      <SectionTitle>iframe Embed</SectionTitle>
      <p className="text-zk-gray text-sm mb-4">For sites that prefer full iframe isolation:</p>
      <Code block>{`<iframe
  src="https://zkrune.com/widget/embed?circuit=age-verification&theme=dark"
  width="400" height="500" frameborder="0"
></iframe>

<script>
  window.addEventListener('message', function(e) {
    if (e.data.type === 'zkrune-result') {
      console.log('Verified:', e.data.verified);
      console.log('Proof hash:', e.data.proofHash);
    }
    if (e.data.type === 'zkrune-error') {
      console.error(e.data.code, e.data.message);
    }
  });
</script>`}</Code>
      <p className="text-zk-gray text-xs mt-2">URL parameters: <Code>circuit</Code> (optional), <Code>theme</Code> (dark/light).</p>
    </div>
  );
}

// ─── Tab: Verify API ─────────────────────────────────────────────────

function TabAPI() {
  return (
    <div>
      <SectionTitle>POST /api/verify-proof</SectionTitle>
      <p className="text-zk-gray text-sm mb-4">Verify a Groth16 proof against a trusted verification key stored on the server. The client never sends the vKey — the server loads it from its own filesystem based on <Code>circuitName</Code>.</p>

      <SubSection title="Endpoint">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-zk-secondary/20 text-zk-secondary rounded text-sm font-mono">POST</span>
          <code className="text-white font-mono text-sm">https://zkrune.com/api/verify-proof</code>
        </div>
      </SubSection>

      <SubSection title="Request Body">
        <Code block>{`{
  "circuitName": "age-verification",
  "proof": {
    "pi_a": ["123...", "456...", "1"],
    "pi_b": [["789...", "012..."], ["345...", "678..."], ["1", "0"]],
    "pi_c": ["901...", "234...", "1"],
    "protocol": "groth16",
    "curve": "bn128"
  },
  "publicSignals": ["1"]
}`}</Code>
        <table className="w-full text-sm mt-3">
          <thead><tr className="border-b border-zk-gray/20"><th className="text-left py-2 text-zk-gray">Field</th><th className="text-left py-2 text-zk-gray">Type</th><th className="text-left py-2 text-zk-gray">Description</th></tr></thead>
          <tbody>
            <ParamRow name="circuitName" type="string" desc="One of the 14 supported circuit IDs" />
            <ParamRow name="proof" type="Groth16Proof" desc="The proof object from snarkjs.groth16.fullProve()" />
            <ParamRow name="publicSignals" type="string[]" desc="Public output signals" />
          </tbody>
        </table>
      </SubSection>

      <SubSection title="Response — Success">
        <Code block>{`{
  "success": true,
  "isValid": true,
  "circuitName": "age-verification",
  "message": "Proof cryptographically verified!",
  "timing": 2
}`}</Code>
      </SubSection>

      <SubSection title="Response — Errors">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zk-gray/20"><th className="text-left py-2 text-zk-gray">Status</th><th className="text-left py-2 text-zk-gray">Reason</th></tr></thead>
          <tbody className="text-zk-gray">
            <tr className="border-b border-zk-gray/10"><td className="py-2">400</td><td className="py-2">Missing proof, publicSignals, or circuitName</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2">400</td><td className="py-2">Unknown circuit: circuitName not in supported list</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2">503</td><td className="py-2">Circuit under maintenance</td></tr>
            <tr className="border-b border-zk-gray/10"><td className="py-2">500</td><td className="py-2">Internal server error</td></tr>
          </tbody>
        </table>
      </SubSection>

      <SectionTitle>Supported Circuits</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {CIRCUITS_DATA.map((c) => (
          <div key={c.id} className="bg-zk-darker rounded-lg px-3 py-2">
            <code className="text-xs text-zk-primary font-mono">{c.id}</code>
          </div>
        ))}
      </div>

      <SectionTitle>Self-Hosting</SectionTitle>
      <div className="text-zk-gray text-sm space-y-2">
        <p>To run the verifier on your own infrastructure:</p>
        <ol className="list-decimal list-inside space-y-1 text-zk-gray">
          <li>Clone the repo and deploy to Vercel / Node.js</li>
          <li>Circuit artifacts (WASM + vKey) are in <Code>public/circuits/</Code></li>
          <li>The endpoint at <Code>app/api/verify-proof/route.ts</Code> loads vKeys from the server</li>
          <li>Point <Code>verifierUrl</Code> in your SDK/widget config to your deployment</li>
        </ol>
      </div>
    </div>
  );
}

// ─── Tab: Circuits ───────────────────────────────────────────────────

function TabCircuits() {
  const grouped = CIRCUITS_DATA.reduce<Record<string, typeof CIRCUITS_DATA>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div>
      <SectionTitle>14 Circuits</SectionTitle>
      <p className="text-zk-gray text-sm mb-6">All circuits use Groth16 zk-SNARKs (BN128 curve). Artifacts (WASM + zkey + vkey) are served from <Code>zkrune.com/circuits/</Code>.</p>

      {Object.entries(grouped).map(([catKey, circuits]) => {
        const cat = CATEGORIES[catKey];
        return (
          <div key={catKey} className="mb-8">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              {CAT_ICONS[catKey]}
              <span>{cat?.label}</span>
              <span className="text-xs text-zk-gray font-normal">({circuits.length})</span>
            </h4>
            <div className="space-y-3">
              {circuits.map((c) => (
                <details key={c.id} className="group bg-zk-dark/30 border border-zk-gray/10 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-zk-dark/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <code className="text-sm text-zk-primary font-mono">{c.id}</code>
                      <span className="text-zk-gray text-sm">{c.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${c.trust === "production" ? "bg-zk-primary/15 text-zk-primary" : "bg-yellow-500/15 text-yellow-400"}`}>
                        {c.trust}
                      </span>
                      <svg className="w-4 h-4 text-zk-gray transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </summary>
                  <div className="px-4 pb-4 border-t border-zk-gray/10">
                    <table className="w-full text-sm mt-3">
                      <thead><tr className="border-b border-zk-gray/20"><th className="text-left py-2 text-zk-gray text-xs">Field</th><th className="text-left py-2 text-zk-gray text-xs">Type</th><th className="text-left py-2 text-zk-gray text-xs">Label</th></tr></thead>
                      <tbody>
                        {c.fields.map((f) => (
                          <tr key={f.name} className="border-b border-zk-gray/5">
                            <td className="py-1.5"><Code>{f.name}</Code></td>
                            <td className="py-1.5 text-zk-gray text-xs">{f.type}</td>
                            <td className="py-1.5 text-zk-gray text-xs">{f.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3">
                      <p className="text-xs text-zk-gray">Artifacts: <Code>{`${c.id}.wasm`}</Code> <Code>{`${c.id}.zkey`}</Code> <Code>{`${c.id}_vkey.json`}</Code></p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Trust Model ────────────────────────────────────────────────

function TabTrust() {
  return (
    <div>
      <SectionTitle>Trust Levels</SectionTitle>
      <p className="text-zk-gray text-sm mb-6">Every circuit is classified by the trust level of its inputs. Use this to understand what each proof actually guarantees.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zk-dark/30 border border-zk-primary/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zk-primary"></span>
            <h4 className="text-white font-medium">Production</h4>
          </div>
          <p className="text-zk-gray text-sm">Proof inputs are self-contained cryptographic primitives. Safe for access decisions.</p>
        </div>
        <div className="bg-zk-dark/30 border border-yellow-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <h4 className="text-white font-medium">Self-Asserted</h4>
          </div>
          <p className="text-zk-gray text-sm">User supplies the private input. Math is valid, but the claim is only as trustworthy as the user&apos;s honesty.</p>
        </div>
        <div className="bg-zk-dark/30 border border-red-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <h4 className="text-white font-medium">Experimental</h4>
          </div>
          <p className="text-zk-gray text-sm">Demo fallback or simplified logic. Do not use for production access decisions.</p>
        </div>
      </div>

      <SectionTitle>Circuit Classification</SectionTitle>

      <SubSection title="Production">
        <div className="space-y-2">
          {[
            { name: "Hash Preimage", guarantee: "User knows x such that hash(x) = y. Cryptographically sound." },
            { name: "Signature Verification", guarantee: "User holds a valid EdDSA signature for a message." },
            { name: "Patience Proof", guarantee: "User waited at least N seconds. Verifiable against block time." },
            { name: "Private Voting", guarantee: "Vote is valid and nullifier prevents double-voting." },
            { name: "Balance Proof", guarantee: "With wallet connected, balance is independently verified on-chain via Solana RPC. Attested by server. Self-asserted fallback without wallet." },
            { name: "Membership Proof", guarantee: "Merkle tree inclusion via Poseidon (depth=16). Production-safe when the Merkle root is published by a trusted issuer. Use MembershipRegistry from the SDK." },
          ].map((c) => (
            <div key={c.name} className="flex items-start gap-3 bg-zk-dark/30 rounded-lg p-3">
              <span className="w-2 h-2 rounded-full bg-zk-primary mt-1.5 flex-shrink-0"></span>
              <div>
                <span className="text-white text-sm font-medium">{c.name}</span>
                <p className="text-zk-gray text-xs">{c.guarantee}</p>
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Self-Asserted">
        <div className="space-y-2">
          {[
            { name: "Age Verification", boundary: "No external attestation. Equivalent to an &quot;I am 18+&quot; checkbox with cryptographic binding." },
            { name: "Range Proof", boundary: "Value is self-reported. Combine with attested data source." },
            { name: "Credential Proof", boundary: "Requires external issuer attestation for production trust." },
            { name: "Anonymous Reputation", boundary: "Requires on-chain or oracle-backed reputation feed." },
            { name: "NFT Ownership", boundary: "Combine with on-chain ownership check (Metaplex, etc.)." },
            { name: "Quadratic Voting", boundary: "Combine with on-chain token balance for real governance." },
            { name: "Token Swap", boundary: "Combine with on-chain balance verification." },
            { name: "Whale Holder", boundary: "Balance is self-reported. Combine with on-chain lookup." },
          ].map((c) => (
            <div key={c.name} className="flex items-start gap-3 bg-zk-dark/30 rounded-lg p-3">
              <span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></span>
              <div>
                <span className="text-white text-sm font-medium">{c.name}</span>
                <p className="text-zk-gray text-xs">{c.boundary}</p>
              </div>
            </div>
          ))}
        </div>
      </SubSection>

      <SectionTitle>Guidelines for Integrators</SectionTitle>
      <div className="space-y-3 text-sm text-zk-gray">
        <div className="flex items-start gap-3">
          <span className="text-zk-primary font-bold">1.</span>
          <p><strong className="text-white">Access gates:</strong> Use Production circuits, or Self-Asserted where the trust boundary is acceptable.</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-zk-primary font-bold">2.</span>
          <p><strong className="text-white">Compliance:</strong> Do not rely on Self-Asserted inputs without external attestation. The proof guarantees math, not truthfulness.</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-zk-primary font-bold">3.</span>
          <p><strong className="text-white">Prototyping:</strong> Experimental features are fine for demos. Do not use in production flows.</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-zk-primary font-bold">4.</span>
          <p><strong className="text-white">Disclose:</strong> When embedding zkRune, tell users what the proof proves and what it does not.</p>
        </div>
      </div>

      <SectionTitle>Upgrading Trust Level</SectionTitle>
      <p className="text-zk-gray text-sm mb-3">Self-Asserted circuits can be upgraded to Production by:</p>
      <ul className="text-zk-gray text-sm space-y-1 list-disc list-inside">
        <li><strong className="text-white">Balance Proof</strong> — upgraded to on-chain attested via Solana RPC when wallet is connected</li>
        <li><strong className="text-white">Membership Proof</strong> — upgraded to Merkle tree verification (Poseidon, depth=16). Integrators build groups with <code>MembershipRegistry</code> from the SDK</li>
        <li>Integrating an issuer/attestation layer (e.g. signed credential for Age Verification)</li>
      </ul>
      <p className="text-zk-gray text-xs mt-3">Further upgrades are planned for future releases. See the <a href="/roadmap" className="text-zk-primary hover:underline">roadmap</a>.</p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("start");

  const tabContent: Record<TabId, React.ReactNode> = {
    start: <TabStart />,
    sdk: <TabSDK />,
    widget: <TabWidget />,
    api: <TabAPI />,
    circuits: <TabCircuits />,
    trust: <TabTrust />,
  };

  return (
    <main className="min-h-screen bg-zk-darker">
      <Navigation />

      <div className="pt-24 px-4 md:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-hatton text-4xl md:text-5xl text-white mb-3">Developer Docs</h1>
            <p className="text-lg text-zk-gray">
              Add privacy-preserving ZK verification to any app. Client-side Groth16 proofs — secrets never leave the device.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-zk-gray/10">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-zk-dark/50 text-zk-primary border-b-2 border-zk-primary"
                    : "text-zk-gray hover:text-white hover:bg-zk-dark/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-zk-dark/20 border border-zk-gray/10 rounded-2xl p-6 md:p-8">
            {tabContent[activeTab]}
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-between text-xs text-zk-gray">
            <div className="flex items-center gap-4">
              <a href="https://github.com/louisstein94/zkrune" target="_blank" rel="noopener noreferrer" className="hover:text-zk-primary transition-colors">GitHub</a>
              <a href="https://www.npmjs.com/package/zkrune-sdk" target="_blank" rel="noopener noreferrer" className="hover:text-zk-primary transition-colors">npm: zkrune-sdk</a>
              <a href="https://www.npmjs.com/package/zkrune-widget" target="_blank" rel="noopener noreferrer" className="hover:text-zk-primary transition-colors">npm: zkrune-widget</a>
            </div>
            <span>Privacy Infrastructure on Solana</span>
          </div>
        </div>
      </div>
    </main>
  );
}
