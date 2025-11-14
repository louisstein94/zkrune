"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is zkRune?",
      answer: "zkRune is a visual zero-knowledge proof builder for Zcash. It allows anyone to create privacy-preserving proofs without cryptography expertise. Choose a template, fill a form, and generate your ZK proof in seconds.",
    },
    {
      question: "Are the proofs really zero-knowledge?",
      answer: "The current version uses simulated ZK proofs for demonstration. We're actively implementing real Circom circuits for production. The UI/UX represents exactly how the final product will work with true zero-knowledge guarantees.",
    },
    {
      question: "Which template should I use?",
      answer: "Choose based on your use case: Age Verification for age-restricted content, Balance Proof for financial verification, Membership Proof for access control, Range Proof for value verification, and Private Voting for anonymous governance.",
    },
    {
      question: "Is zkRune free?",
      answer: "Yes! zkRune is completely free to use during beta. We're building in public and welcome community feedback. After mainnet launch, basic features will remain free with optional premium features.",
    },
    {
      question: "How secure is it?",
      answer: "zkRune uses industry-standard zk-SNARK technology (Circom + snarkjs) compatible with Zcash. Your sensitive data never leaves your device unencrypted. Only the proof is generated and can be shared.",
    },
    {
      question: "Can I deploy to mainnet?",
      answer: "Currently, zkRune works with Zcash testnet for safe testing. Mainnet deployment will be available after security audits and production circuit implementation are complete.",
    },
  ];

  return (
    <section id="faq" className="relative py-24 px-16">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-zk-accent animate-pulse" />
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
              className="px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all text-center"
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

