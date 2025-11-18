"use client";

import { ChooseIcon, GenerateIcon, DeployIcon } from "./StepIcons";

function VerifyIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="text-zk-primary" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zk-primary" />
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="0.5" className="text-zk-secondary opacity-40" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-zk-primary opacity-20" />
    </svg>
  );
}

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose Template",
      description: "Browse our collection of 5 zero-knowledge proof templates. Select the one that fits your privacy needs.",
      IconComponent: ChooseIcon,
    },
    {
      number: "02",
      title: "Generate Proof",
      description: "Fill in the simple form with your data. Click generate and watch as your ZK proof is created in seconds.",
      IconComponent: GenerateIcon,
    },
    {
      number: "03",
      title: "Export & Share",
      description: "Download your proof as JSON or code. Share it, integrate into apps, or deploy to Zcash testnet.",
      IconComponent: DeployIcon,
    },
    {
      number: "04",
      title: "Verify Independently",
      description: "Anyone can verify your proof using our tool or CLI. Math guarantees it's real - no trust needed!",
      IconComponent: VerifyIcon,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 px-16">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-zk-gray/50 rounded-full mb-6">
          <div className="w-2 h-2 rounded-full bg-zk-secondary animate-pulse" />
          <span className="text-xs font-medium text-zk-gray uppercase tracking-wider">
            Simple Process
          </span>
        </div>

          <h2 className="font-hatton text-5xl text-white mb-4">
            How It <span className="text-zk-primary">Works</span>
          </h2>
          <p className="text-xl text-zk-gray max-w-2xl mx-auto">
            Four simple steps to create and verify zero-knowledge proofs. No cryptography knowledge required.
          </p>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="relative group"
          >
            <div className="relative bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8 hover:border-zk-primary/50 transition-all duration-300 hover:scale-105">
              {/* Number */}
              <div className="text-6xl font-hatton text-zk-primary/20 mb-4">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-zk-primary/10 rounded-2xl border border-zk-primary/20">
                  <step.IconComponent className="w-12 h-12" />
                </div>
              </div>

              {/* Title */}
              <h3 className="font-hatton text-2xl text-white mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-zk-gray leading-relaxed">
                {step.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-zk-primary/5 to-zk-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto mt-16 text-center">
        <a
          href="/templates"
          className="inline-block px-8 py-4 bg-zk-primary text-zk-darker font-medium rounded-full hover:bg-zk-primary/90 transition-all hover:scale-105 shadow-lg shadow-zk-primary/20"
        >
          Try Templates - Free
        </a>
      </div>
    </section>
  );
}

