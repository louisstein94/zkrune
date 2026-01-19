"use client";

import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="relative min-h-screen bg-zk-darker overflow-hidden">
      <Navigation />
      
      {/* Noise Texture */}
      <div className="noise-texture absolute inset-0 pointer-events-none" />

      {/* Background */}
      <div className="absolute top-0 right-0 w-[60%] h-full overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-zk-secondary/10 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-32 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-zk-gray hover:text-zk-primary transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="font-hatton text-4xl md:text-5xl text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-zk-gray">
            Last updated: January 19, 2026
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-zk-gray leading-relaxed">
              By accessing or using zkRune ("the Service"), you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">2. Description of Service</h2>
            <p className="text-zk-gray leading-relaxed">
              zkRune is a privacy tooling platform for Solana that enables users to generate zero-knowledge proofs 
              directly in their browser. The Service includes:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li>Client-side ZK proof generation using Groth16 zk-SNARKs</li>
              <li>Pre-built circuit templates for various use cases</li>
              <li>Visual circuit builder for custom ZK applications</li>
              <li>SDK and API for developers</li>
              <li>zkRUNE token utilities including governance, staking, and marketplace</li>
            </ul>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">3. Client-Side Processing</h2>
            <p className="text-zk-gray leading-relaxed">
              All zero-knowledge proof generation occurs entirely within your browser. Your private data, 
              secrets, and inputs never leave your device. We do not collect, store, or have access to 
              any data you use to generate proofs.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">4. Blockchain Interactions</h2>
            <p className="text-zk-gray leading-relaxed">
              When interacting with the Solana blockchain through our Service:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li>You are solely responsible for your wallet security and private keys</li>
              <li>All blockchain transactions are irreversible</li>
              <li>Gas fees and transaction costs are your responsibility</li>
              <li>We do not custody any tokens or digital assets</li>
            </ul>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">5. zkRUNE Token</h2>
            <p className="text-zk-gray leading-relaxed">
              The zkRUNE token provides utility within the zkRune ecosystem including governance voting, 
              premium feature access, marketplace transactions, and staking rewards. The token does not 
              represent equity, ownership, or any claim to profits. Token value may fluctuate and you 
              should not purchase tokens as an investment.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">6. Prohibited Uses</h2>
            <p className="text-zk-gray leading-relaxed">
              You agree not to use the Service for:
            </p>
            <ul className="list-disc list-inside text-zk-gray space-y-2 mt-4">
              <li>Any unlawful purpose or to violate any laws</li>
              <li>Money laundering or terrorist financing</li>
              <li>Circumventing sanctions or export controls</li>
              <li>Interfering with or disrupting the Service</li>
              <li>Attempting to access other users' data or accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">7. Intellectual Property</h2>
            <p className="text-zk-gray leading-relaxed">
              The Service and its original content, features, and functionality are owned by zkRune 
              and are protected by international copyright, trademark, and other intellectual property laws. 
              Our circuit templates and SDK are provided under open-source licenses as specified in 
              their respective repositories.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-zk-gray leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, 
              SECURE, OR ERROR-FREE. USE OF THE SERVICE IS AT YOUR OWN RISK.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-zk-gray leading-relaxed">
              IN NO EVENT SHALL ZKRUNE, ITS DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT 
              LIMITATION LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR 
              ACCESS TO OR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">10. Changes to Terms</h2>
            <p className="text-zk-gray leading-relaxed">
              We reserve the right to modify these terms at any time. We will provide notice of 
              significant changes by updating the "Last updated" date. Your continued use of the 
              Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="font-hatton text-2xl text-white mb-4">11. Contact</h2>
            <p className="text-zk-gray leading-relaxed">
              For questions about these Terms of Service, please contact us through our 
              <a href="https://x.com/rune_zk" target="_blank" rel="noopener noreferrer" className="text-zk-primary hover:underline ml-1">
                Twitter/X account
              </a> or 
              <a href="https://github.com/louisstein94/zkrune" target="_blank" rel="noopener noreferrer" className="text-zk-primary hover:underline ml-1">
                GitHub repository
              </a>.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/privacy" className="text-zk-gray hover:text-zk-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="text-zk-gray hover:text-zk-primary transition-colors">
              Home
            </Link>
            <Link href="/docs" className="text-zk-gray hover:text-zk-primary transition-colors">
              Documentation
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
