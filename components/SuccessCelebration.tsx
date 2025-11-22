"use client";

import { useEffect, useState } from 'react';

/**
 * Success Celebration Component
 * Shows confetti and celebration message after successful proof generation
 * Educational and encouraging
 */

interface SuccessCelebrationProps {
  show: boolean;
  templateName?: string;
  onClose: () => void;
}

export default function SuccessCelebration({ show, templateName, onClose }: SuccessCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#00FFA3', '#6B4CFF', '#FFD166'][Math.floor(Math.random() * 3)]
      }));
      setConfetti(particles);

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-none">
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full animate-confetti"
            style={{
              left: `${particle.x}%`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}s`,
              top: '-10%'
            }}
          />
        ))}
      </div>

      {/* Success Card */}
      <div className="relative max-w-md w-full bg-gradient-to-br from-zk-darker to-zk-dark border-2 border-zk-primary rounded-2xl p-8 shadow-2xl pointer-events-auto animate-scale-in">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-zk-primary/20 rounded-full border-4 border-zk-primary animate-pulse-glow">
            <svg className="w-16 h-16 text-zk-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-6">
          <h2 className="font-hatton text-3xl text-white mb-3">
            Proof Generated Successfully
          </h2>
          {templateName && (
            <p className="text-lg text-zk-gray mb-4">
              {templateName} proof ready
            </p>
          )}
          <p className="text-sm text-zk-gray leading-relaxed">
            Your Zero-Knowledge Proof has been generated successfully. Your private data remained private!
          </p>
        </div>

        {/* What Happened */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-zk-primary/10 border border-zk-primary/20 rounded-lg">
            <svg className="w-5 h-5 flex-shrink-0 text-zk-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div className="text-xs">
              <p className="text-white font-medium mb-1">Your Data Stayed Private</p>
              <p className="text-zk-gray">All computation happened in your browser. Nothing was sent to any server.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-zk-secondary/10 border border-zk-secondary/20 rounded-lg">
            <svg className="w-5 h-5 flex-shrink-0 text-zk-secondary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="text-xs">
              <p className="text-white font-medium mb-1">Cryptographically Verified</p>
              <p className="text-zk-gray">This is a real Groth16 ZK-SNARK proof, verifiable by anyone.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-zk-primary/30 text-zk-primary rounded-lg font-medium hover:bg-zk-primary/10 transition-all"
          >
            View Proof
          </button>
          <button
            onClick={() => window.location.href = '/templates'}
            className="flex-1 px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all hover:scale-105"
          >
            Try Another
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zk-gray hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}



