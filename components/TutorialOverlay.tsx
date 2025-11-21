"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Tutorial Overlay Component
 * Shows first-time users a step-by-step guide
 * Educational and non-intrusive
 */
export default function TutorialOverlay() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to zkRune",
      description: "Your journey to privacy-preserving proofs starts here. Let's show you around.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      )
    },
    {
      title: "Choose a Template",
      description: "We have 5 ready-to-use privacy proofs. Start with Age Verification - it's the easiest!",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      action: "Go to Templates",
      actionHref: "/templates"
    },
    {
      title: "Fill the Form",
      description: "Enter your private data. Don't worry - it never leaves your browser!",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      title: "Generate Your Proof",
      description: "Click the button and watch the magic happen. Takes about 5 seconds.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "You're All Set",
      description: "That's it! You now know how to generate Zero-Knowledge Proofs. Try it yourself!",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: "Start Generating",
      actionHref: "/templates"
    }
  ];

  useEffect(() => {
    // Check if user has seen tutorial
    const hasSeenTutorial = localStorage.getItem('zkrune_tutorial_completed');
    
    if (!hasSeenTutorial) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('zkrune_tutorial_skipped', 'true');
    setShowTutorial(false);
  };

  const completeTutorial = () => {
    localStorage.setItem('zkrune_tutorial_completed', 'true');
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-lg w-full bg-gradient-to-br from-zk-darker to-zk-dark border-2 border-zk-primary/30 rounded-2xl p-8 shadow-2xl">
        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-zk-primary'
                  : index < currentStep
                  ? 'w-8 bg-zk-primary/50'
                  : 'w-8 bg-zk-gray/30'
              }`}
            />
          ))}
        </div>

        {/* Skip Button */}
        {!isLastStep && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-xs text-zk-gray hover:text-white transition-colors uppercase tracking-wider"
          >
            Skip Tutorial
          </button>
        )}

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-zk-primary/10 rounded-2xl border border-zk-primary/20 text-zk-primary">
            {step.icon}
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="font-hatton text-2xl md:text-3xl text-white mb-3">
            {step.title}
          </h2>
          <p className="text-zk-gray leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Step Counter */}
        <div className="text-center text-xs text-zk-gray mb-6">
          Step {currentStep + 1} of {tutorialSteps.length}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {!isFirstStep && (
            <button
              onClick={handlePrevious}
              className="flex-1 px-6 py-3 border border-zk-gray/30 text-zk-gray rounded-lg font-medium hover:border-zk-primary hover:text-zk-primary transition-all"
            >
              Previous
            </button>
          )}
          
          {step.action && step.actionHref ? (
            <Link
              href={step.actionHref}
              onClick={completeTutorial}
              className="flex-1 px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all hover:scale-105 text-center"
            >
              {step.action}
            </Link>
          ) : (
            <button
              onClick={handleNext}
              className={`${isFirstStep ? 'w-full' : 'flex-1'} px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all hover:scale-105`}
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          )}
        </div>

        {/* Additional Info */}
        {isLastStep && (
          <div className="mt-6 p-4 bg-zk-primary/10 border border-zk-primary/20 rounded-lg">
            <p className="text-xs text-center text-zk-gray">
              You can always access help from the navigation menu
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

