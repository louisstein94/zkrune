"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is zkRune?",
      answer: "zkRune is privacy verification infrastructure for Solana. It lets any app verify user claims — age, token balance, group membership — without collecting sensitive data. Proofs are generated client-side using Groth16 zk-SNARKs, and can be verified on-chain via our Solana mainnet verifier program or off-chain via our hosted API.",
      category: "basics"
    },
    {
      question: "What is a Zero-Knowledge Proof?",
      answer: "A zero-knowledge proof lets you prove a statement is true without revealing the underlying data. For example, you can prove you are over 18 without sharing your birthdate, or prove your wallet holds at least 1000 tokens without exposing the exact balance. The verifier learns only the yes/no answer — nothing else.",
      category: "basics"
    },
    {
      question: "Does my data get sent to any server?",
      answer: "No. All proofs are generated 100% in the user's browser. Private inputs (birthdate, balance, group secret) never leave the device. There are no server calls, no databases, no tracking. This is privacy by architecture — the server literally never sees your data.",
      category: "privacy"
    },
    {
      question: "How does on-chain verification work?",
      answer: "zkRune's Groth16 Verifier is deployed on Solana mainnet (program ID: 9apA5U8YywgTHXQqpbvUMHJej7yorHcN56cewKfkX7ad). After a proof is generated client-side, it can be submitted to the on-chain verifier for trustless verification. Smart contracts and dApps can check the result directly — no intermediary needed.",
      category: "technical"
    },
    {
      question: "How can I integrate zkRune into my app?",
      answer: "Install the SDK via npm (npm install zkrune-sdk), import the proof generation or remote verification function, and call it with your circuit name and inputs. For simpler integration, use the hosted verifier API at /api/verify-proof. Full integration guide and widget docs are available in the documentation.",
      category: "integration"
    },
    {
      question: "Which verification templates are available?",
      answer: "13 production-ready Groth16 circuits: Age Verification, Balance Proof, Membership Proof, Range Proof, Private Voting, NFT Ownership, Credential Proof, Token Swap Proof, Quadratic Voting, Signature Verification, Anonymous Reputation, and more. Each circuit has its own WASM and proving key generated through a multi-party trusted setup ceremony.",
      category: "technical"
    },
    {
      question: "What is the zkRUNE token?",
      answer: "zkRUNE is a Solana SPL token (51mxznNWNBHh6iZWwNHBokoaxHYS2Amds1hhLGXkpump) that powers the zkRune ecosystem. It enables governance voting on protocol decisions, staking with up to 36% APY, access to the template marketplace where circuit creators earn 95% of sales, and premium tiers for advanced features.",
      category: "token"
    },
    {
      question: "Is the cryptography real or simulated?",
      answer: "Real. Every template uses compiled Circom circuits with the Groth16 proving system — the same cryptography securing major blockchain protocols. The trusted setup ceremony was completed with multi-party participation. Proofs are mathematically verifiable and cannot be forged. All circuit source code is open on GitHub.",
      category: "technical"
    },
    {
      question: "Can someone reverse-engineer my data from a proof?",
      answer: "No. This is mathematically impossible, regardless of computing power. A Groth16 proof reveals only the public output (e.g., 'age >= 18: true') — never the private inputs. The proof is a compact cryptographic object that proves the computation was done correctly without leaking any information about the original data.",
      category: "privacy"
    },
    {
      question: "Does it work offline?",
      answer: "Yes. zkRune is a Progressive Web App. After first visit, circuit files (WASM, proving keys) are cached locally. You can install it on your phone and generate proofs without any internet connection. An Android APK is also available for direct installation.",
      category: "usage"
    },
  ];

  return (
    <section id="faq" className="relative py-24 px-16">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/30 rounded-full mb-6">
          <div className="w-2 h-2 rounded-full bg-zk-accent" />
            <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
              Common Questions
            </span>
          </div>

          <h2 className="font-hatton text-5xl text-white mb-4">
            Frequently Asked <span className="text-zk-primary">Questions</span>
          </h2>
          <p className="text-xl text-zk-gray">
            Everything you need to know about zkRune
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-zk-dark/30 border border-zk-gray/20 rounded-xl overflow-hidden hover:border-zk-primary/30 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-medium text-white text-lg pr-8">
                  {faq.question}
                </span>
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full bg-zk-primary/20 flex items-center justify-center transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-zk-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-zk-gray leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-6 md:p-8 bg-zk-dark/30 border border-zk-gray/20 rounded-2xl">
          <h3 className="font-hatton text-xl md:text-2xl text-white mb-3">
            Still have questions?
          </h3>
          <p className="text-sm md:text-base text-zk-gray mb-6">
            Check out the documentation or contribute on GitHub
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
            <a
              href="/docs"
              className="px-6 py-3 bg-zk-primary text-white rounded-lg font-medium hover:bg-zk-primary/90 transition-all text-center"
            >
              Read Documentation
            </a>
            <a
              href="https://github.com/louisstein94/zkrune"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-zk-secondary/20 border border-zk-secondary/30 text-zk-secondary rounded-lg font-medium hover:bg-zk-secondary/30 transition-all text-center"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

