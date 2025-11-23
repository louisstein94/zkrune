"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is a Zero-Knowledge Proof?",
      answer: "Think of it like proving you know a secret password without revealing the password itself. In simple terms: you can prove a fact is true (like being over 18) without revealing the underlying data (your exact birth date). It's like showing your ID to a bouncer who only needs to know you're 18+, not your actual birthday.",
      category: "basics"
    },
    {
      question: "What is zkRune?",
      answer: "zkRune is a visual Zero-Knowledge Proof builder that makes privacy technology accessible to everyone. No coding required, no cryptography expertise needed. Just pick a template, fill a simple form, and generate a cryptographically-sound proof in seconds. Think of it as a Canva for privacy proofs.",
      category: "basics"
    },
    {
      question: "Do I need to know cryptography or coding?",
      answer: "Not at all! zkRune is designed for everyone. If you can fill out a web form, you can generate a ZK proof. We handle all the complex cryptography (Groth16 zk-SNARKs, Circom circuits) behind the scenes. You just focus on what you want to prove.",
      category: "basics"
    },
    {
      question: "Are the proofs really zero-knowledge?",
      answer: "Yes! We use real Groth16 zk-SNARKs - the same cryptography securing billions in blockchain transactions. All 10 templates use compiled Circom circuits. These aren't simulations or demos. They're mathematically verifiable zero-knowledge proofs that anyone can verify.",
      category: "technical"
    },
    {
      question: "How long does it take to generate a proof?",
      answer: "Fast! Most proofs generate in under 5 seconds. Age Verification takes about 0.44 seconds. The first time you use a template, it downloads the circuit files (~5MB). After that, everything is cached and generation is instant, even offline.",
      category: "usage"
    },
    {
      question: "Does my data get sent to any servers?",
      answer: "Absolutely not! Everything runs 100% in your browser. Your private data (birth date, balance, vote, etc.) never leaves your device. No servers, no databases, no network calls. You can even generate proofs on airplane mode. This is privacy by architecture, not by promise.",
      category: "privacy"
    },
    {
      question: "How does it work offline?",
      answer: "zkRune is a Progressive Web App (PWA). After your first visit, all necessary files are cached locally on your device. This includes the UI and circuit files (WASM, proving keys). Once cached, you can install it on your phone and generate proofs with zero internet connection.",
      category: "usage"
    },
    {
      question: "Which template should I use?",
      answer: "Choose based on what you need to prove: Age Verification (prove you're 18+ for KYC), Balance Proof (prove you have enough funds), Membership Proof (prove you're in a group), Range Proof (prove a value is within range), Private Voting (cast votes anonymously). Can't find what you need? Request a custom template!",
      category: "usage"
    },
    {
      question: "Can I trust this? Is it secure?",
      answer: "zkRune is open source - you can audit every line of code on GitHub. We use industry-standard Circom circuits and the Groth16 proving system. Your data never touches a server. The cryptography is the same that secures major blockchain networks. Plus, mathematical proofs don't rely on trust - they're verifiable.",
      category: "privacy"
    },
    {
      question: "What happens after I generate a proof?",
      answer: "You get a cryptographic proof (JSON format) that you can share, verify, or use in your application. The proof contains NO private data - only the statement you proved (e.g., 'Age > 18'). Anyone can verify it's mathematically valid, but they can't extract your original data. That's the magic of zero-knowledge.",
      category: "usage"
    },
    {
      question: "Is zkRune free?",
      answer: "Yes! zkRune is completely free and open source. No accounts, no credit cards, no premium tiers. We're building privacy infrastructure for everyone. The code is on GitHub, the proofs work offline, and there's no catch. Just privacy technology made accessible.",
      category: "basics"
    },
    {
      question: "How do I install the mobile app?",
      answer: "Visit zkrune.com on your phone. On iOS (Safari): tap Share → Add to Home Screen. On Android (Chrome): tap the menu → Install app. No app store needed! After installation, visit Templates, generate one proof from each template you want to use offline, and you're set. Full guide at zkrune.com/install",
      category: "usage"
    },
    {
      question: "What's stored on my device?",
      answer: "Only the circuit files needed for proof generation (~5MB per template) and the app UI. No personal data, no tracking cookies, no analytics. When you generate a proof, it's yours to keep or delete. We never see it. Storage is managed by your browser's cache API.",
      category: "privacy"
    },
    {
      question: "Can someone reverse-engineer my data from the proof?",
      answer: "No. That's the whole point of zero-knowledge! Even with unlimited computing power, it's mathematically impossible to extract your private data from the proof. The proof only reveals the statement you chose to prove. Your original data remains permanently private.",
      category: "privacy"
    },
    {
      question: "What if I make a mistake in the form?",
      answer: "Just regenerate! There's no limit on proofs. If you entered wrong data, simply fill the form again with correct values and click generate. Each proof is independent. Delete the wrong one and keep the correct proof.",
      category: "usage"
    }
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

