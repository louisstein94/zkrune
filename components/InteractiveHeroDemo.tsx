"use client";

import { useState, useEffect } from 'react';

/**
 * Interactive Hero Demo
 * Shows animated ZK proof generation in hero section
 * Educational and eye-catching
 */
export default function InteractiveHeroDemo() {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      label: "Your Private Data",
      data: "Birth Year: 1995",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: "text-zk-gray"
    },
    {
      label: "ZK Magic Happens",
      data: "Generating proof...",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "text-zk-secondary"
    },
    {
      label: "Public Proof Generated",
      data: "Age > 18",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-zk-primary"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setStep((prev) => {
        if (prev === steps.length - 1) {
          setTimeout(() => setIsAnimating(false), 500);
          return 0;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const currentStep = steps[step];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-zk-dark/80 to-zk-darker/80 backdrop-blur-xl border border-zk-primary/30 rounded-2xl p-8 shadow-2xl">
        {/* Step Indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === step 
                  ? 'w-12 bg-zk-primary' 
                  : index < step 
                  ? 'w-8 bg-zk-primary/50' 
                  : 'w-8 bg-zk-gray/30'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className={`transition-all duration-500 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`transform transition-all duration-500 ${currentStep.color} ${
              step === 1 ? 'scale-110 animate-pulse' : 'scale-100'
            }`}>
              {currentStep.icon}
            </div>
          </div>

          {/* Label */}
          <p className="text-center text-sm font-medium text-zk-gray uppercase tracking-wider mb-3">
            {currentStep.label}
          </p>

          {/* Data Display */}
          <div className="relative">
            <div className={`
              text-center font-mono text-lg p-4 rounded-lg border transition-all duration-500
              ${step === 0 ? 'bg-red-500/10 border-red-500/30 text-red-400' : ''}
              ${step === 1 ? 'bg-zk-secondary/10 border-zk-secondary/30 text-zk-secondary animate-pulse' : ''}
              ${step === 2 ? 'bg-zk-primary/10 border-zk-primary/30 text-zk-primary' : ''}
            `}>
              {currentStep.data}
            </div>

            {/* Privacy Indicator for Step 0 */}
            {step === 0 && (
              <div className="absolute -right-2 -top-2 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-md text-xs text-red-400 animate-pulse">
                Private
              </div>
            )}

            {/* Public Indicator for Step 2 */}
            {step === 2 && (
              <div className="absolute -right-2 -top-2 px-2 py-1 bg-zk-primary/20 border border-zk-primary/30 rounded-md text-xs text-zk-primary">
                Public
              </div>
            )}
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-xs text-center text-zk-gray">
            {step === 0 && "Your sensitive data stays private"}
            {step === 1 && "Zero-Knowledge cryptography at work"}
            {step === 2 && "Proof generated. Birth year never revealed"}
          </p>
        </div>
      </div>

      {/* Floating Particles */}
      {step === 1 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-zk-primary/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Glow Effect */}
      {step === 2 && (
        <div className="absolute inset-0 -z-10 bg-zk-primary/20 blur-3xl rounded-full animate-pulse" />
      )}
    </div>
  );
}

