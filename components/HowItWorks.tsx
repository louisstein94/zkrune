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
      title: "Pick What You Want to Prove",
      description: "Think of templates like different types of IDs. Need to prove you're old enough? Use Age Verification. Prove you have enough money? Use Balance Proof. Just pick what fits.",
      analogy: "Like choosing which ID to show",
      IconComponent: ChooseIcon,
    },
    {
      number: "02",
      title: "Fill a Simple Form",
      description: "Enter your private information - like your birth year or balance. Don't worry, this never leaves your browser. It's like writing on paper that only you can see.",
      analogy: "As easy as filling out a Google form",
      IconComponent: GenerateIcon,
    },
    {
      number: "03",
      title: "Click Generate",
      description: "Our app does the complex math (zk-SNARKs) behind the scenes. Takes about 5 seconds. You get a proof that says 'Yes, I proved this' without revealing what 'this' actually is.",
      analogy: "Like a receipt that proves you paid, without showing your bank account",
      IconComponent: DeployIcon,
    },
    {
      number: "04",
      title: "Share Your Proof",
      description: "Now you have a proof you can share with anyone. They can verify it's real using math. They'll know you proved what you claimed, but they'll never see your private data.",
      analogy: "Like a diploma that proves you graduated, without showing your grades",
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
          <p className="text-xl text-zk-gray max-w-3xl mx-auto">
            Imagine proving you're 18+ without showing your ID. Or proving you have enough money without showing your bank account. That's Zero-Knowledge. Here's how zkRune makes it simple:
          </p>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="relative group h-full"
          >
            <div className="relative h-full bg-zk-dark/30 border border-zk-gray/20 rounded-2xl p-8 hover:border-zk-primary/50 transition-all duration-300 hover:scale-105 flex flex-col">
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
              <p className="text-zk-gray leading-relaxed mb-4 flex-1">
                {step.description}
              </p>

              {/* Analogy */}
              <div className="p-3 bg-zk-primary/5 border border-zk-primary/10 rounded-lg mt-auto">
                <p className="text-xs text-zk-primary italic">
                  {step.analogy}
                </p>
              </div>

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

