"use client";

import Link from 'next/link';

/**
 * First Proof Section
 * Guides users to generate their first proof in 60 seconds
 * Educational and conversion-focused
 */
export default function FirstProofSection() {
  const steps = [
    {
      number: "1",
      title: "Choose a Template",
      description: "Pick from 8 ready-made privacy proofs",
      example: "Age Verification, Balance Proof, etc.",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "from-zk-primary/20 to-zk-primary/5",
      borderColor: "border-zk-primary/30"
    },
    {
      number: "2",
      title: "Fill Simple Form",
      description: "Enter your private data (stays on your device)",
      example: "Birth year, balance amount, vote choice",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: "from-zk-secondary/20 to-zk-secondary/5",
      borderColor: "border-zk-secondary/30"
    },
    {
      number: "3",
      title: "Generate Proof",
      description: "Click one button, wait ~5 seconds",
      example: "Real cryptographic proof generated",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "from-green-500/20 to-green-500/5",
      borderColor: "border-green-500/30"
    }
  ];

  return (
    <section className="relative z-10 px-6 md:px-12 lg:px-16 py-20 md:py-32">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-primary/50 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-zk-primary animate-pulse"></div>
            <span className="text-xs font-medium text-zk-primary uppercase tracking-wider">
              Quick Start Guide
            </span>
          </div>
          
          <h2 className="font-hatton text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Your First Proof in{' '}
            <span className="text-zk-primary">60 Seconds</span>
          </h2>
          
          <p className="text-lg text-zk-gray max-w-2xl mx-auto">
            No tutorials to read. No docs to dig through. Just three simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
            >
              {/* Connector Line (Desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-[60%] w-full h-0.5 bg-gradient-to-r from-zk-primary/30 to-transparent z-0" />
              )}

              {/* Card */}
              <div className={`
                relative z-10 p-6 rounded-2xl border transition-all duration-300
                bg-gradient-to-br ${step.color} ${step.borderColor}
                hover:scale-105 hover:shadow-2xl
              `}>
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-zk-darker border-2 border-zk-primary flex items-center justify-center">
                  <span className="font-hatton text-xl text-zk-primary">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="text-zk-primary mb-4 mt-4">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="font-hatton text-xl text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zk-gray mb-3">
                  {step.description}
                </p>
                <p className="text-xs text-zk-gray/70 italic">
                  {step.example}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-zk-primary/10 to-zk-secondary/10 border border-zk-primary/30 rounded-2xl">
            <div>
              <p className="text-sm text-zk-gray mb-2">
                Ready to try?
              </p>
              <p className="text-2xl font-hatton text-white mb-1">
                No installation required
              </p>
              <p className="text-sm text-zk-gray">
                Works directly in your browser. Completely private.
              </p>
            </div>

            <Link
              href="/templates"
              className="group px-8 py-4 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105 shadow-lg shadow-zk-primary/20 flex items-center gap-2"
            >
              Generate Your First Proof
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <p className="text-xs text-zk-gray">
              Takes less than a minute. No account needed.
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-zk-gray">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-zk-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Your data never leaves your browser</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-zk-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Real cryptographic proofs</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-zk-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Open source & auditable</span>
          </div>
        </div>
      </div>
    </section>
  );
}

