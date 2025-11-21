"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  page: string;
  spotlightSelector: string | null;
  action?: string;
  actionHref?: string;
}

/**
 * Tutorial Overlay Component
 * Shows first-time users a step-by-step guide with spotlight effect
 * Educational and non-intrusive
 * Persists across page navigation using localStorage
 */
export default function TutorialOverlay() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to zkRune",
      description: "Your journey to privacy-preserving proofs starts here. Let's show you around in 5 simple steps.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      ),
      page: "home",
      spotlightSelector: null
    },
    {
      title: "Visit Templates Page",
      description: "Let's go to the Templates page where you can see all available privacy proofs.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      action: "Go to Templates",
      actionHref: "/templates",
      page: "home",
      spotlightSelector: null
    },
    {
      title: "Select Age Verification",
      description: "Age Verification is the easiest template. Click on it to open the proof generator.",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: "Open Age Verification",
      actionHref: "/templates/age-verification",
      page: "templates",
      spotlightSelector: "#template-age-verification"
    },
    {
      title: "Fill the Form",
      description: "Enter your birth year (try 1995). Your data stays private in your browser - it never gets sent anywhere!",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      page: "template-detail",
      spotlightSelector: "#tutorial-form-container"
    },
    {
      title: "Generate Your Proof",
      description: "Click 'Generate ZK Proof' button and watch the magic happen. Takes about 5 seconds. That's it!",
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      action: "I'm Ready!",
      page: "template-detail",
      spotlightSelector: "#tutorial-generate-button"
    }
  ];

  // Initialize tutorial state from localStorage
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('zkrune_tutorial_completed');
    const tutorialActive = localStorage.getItem('zkrune_tutorial_active');
    const savedStep = localStorage.getItem('zkrune_tutorial_step');
    
    if (!hasSeenTutorial && tutorialActive === 'true') {
      setShowTutorial(true);
      setCurrentStep(parseInt(savedStep || '0', 10));
    } else if (!hasSeenTutorial && !tutorialActive) {
      // First time - start tutorial after delay
      const timer = setTimeout(() => {
        setShowTutorial(true);
        localStorage.setItem('zkrune_tutorial_active', 'true');
        localStorage.setItem('zkrune_tutorial_step', '0');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Update step based on current page
  useEffect(() => {
    if (!showTutorial) return;

    const tutorialActive = localStorage.getItem('zkrune_tutorial_active');
    if (tutorialActive !== 'true') return;

    const updateStep = () => {
      // Determine which step to show based on current page
      if (pathname === '/') {
        // Home page: show step 0 or 1
        const savedStep = parseInt(localStorage.getItem('zkrune_tutorial_step') || '0', 10);
        if (savedStep <= 1) {
          setCurrentStep(savedStep);
        }
      } else if (pathname === '/templates') {
        // Templates page: show step 2
        setCurrentStep(2);
        localStorage.setItem('zkrune_tutorial_step', '2');
      } else if (pathname.startsWith('/templates/age-verification')) {
        // Age verification page: show step 3 or 4
        const savedStep = parseInt(localStorage.getItem('zkrune_tutorial_step') || '3', 10);
        if (savedStep >= 3) {
          setCurrentStep(savedStep);
        } else {
          setCurrentStep(3);
          localStorage.setItem('zkrune_tutorial_step', '3');
        }
      }
    };

    updateStep();

    // Listen for storage changes (when form is filled)
    window.addEventListener('storage', updateStep);
    return () => window.removeEventListener('storage', updateStep);
  }, [pathname, showTutorial]);

  // Update spotlight effect
  useEffect(() => {
    if (!showTutorial) {
      setSpotlightRect(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const step = tutorialSteps[currentStep];
    if (!step.spotlightSelector) {
      setSpotlightRect(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Function to update spotlight position
    const updateSpotlight = () => {
      if (!step.spotlightSelector) return;
      const element = document.querySelector(step.spotlightSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect(rect);
      }
    };

    // Initial update
    updateSpotlight();

    // Poll for changes (in case element moves or resizes)
    intervalRef.current = setInterval(updateSpotlight, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [showTutorial, currentStep]);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < tutorialSteps.length) {
      setCurrentStep(nextStep);
      localStorage.setItem('zkrune_tutorial_step', nextStep.toString());
    } else {
      completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      localStorage.setItem('zkrune_tutorial_step', prevStep.toString());
    }
  };

  const handleSkip = () => {
    localStorage.setItem('zkrune_tutorial_completed', 'true');
    localStorage.removeItem('zkrune_tutorial_active');
    localStorage.removeItem('zkrune_tutorial_step');
    setShowTutorial(false);
  };

  const completeTutorial = () => {
    localStorage.setItem('zkrune_tutorial_completed', 'true');
    localStorage.removeItem('zkrune_tutorial_active');
    localStorage.removeItem('zkrune_tutorial_step');
    setShowTutorial(false);
  };

  const handleActionClick = () => {
    // Save current step before navigation
    const nextStep = currentStep + 1;
    localStorage.setItem('zkrune_tutorial_step', nextStep.toString());
  };

  if (!showTutorial) return null;

  const step = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  // Calculate dialog position based on spotlight
  const getDialogPosition = () => {
    if (!spotlightRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dialogWidth = 512; // max-w-lg
    const dialogHeight = 400; // approximate

    // Try to position dialog to the right of spotlight
    if (spotlightRect.right + dialogWidth + 32 < viewportWidth) {
      return {
        top: Math.max(16, Math.min(viewportHeight - dialogHeight - 16, spotlightRect.top)),
        left: spotlightRect.right + 24,
      };
    }
    
    // Try to position dialog to the left of spotlight
    if (spotlightRect.left - dialogWidth - 32 > 0) {
      return {
        top: Math.max(16, Math.min(viewportHeight - dialogHeight - 16, spotlightRect.top)),
        right: viewportWidth - spotlightRect.left + 24,
      };
    }

    // Position dialog below spotlight
    if (spotlightRect.bottom + dialogHeight + 32 < viewportHeight) {
      return {
        top: spotlightRect.bottom + 24,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }

    // Position dialog above spotlight
    return {
      bottom: viewportHeight - spotlightRect.top + 24,
      left: '50%',
      transform: 'translateX(-50%)',
    };
  };

  const dialogPosition = getDialogPosition();

  return (
    <div className="tutorial-overlay-container">
      {/* Spotlight Overlay - Dark background with cutout */}
      {spotlightRect && (
        <div 
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            background: `
              radial-gradient(
                ellipse ${spotlightRect.width + 40}px ${spotlightRect.height + 40}px at ${spotlightRect.left + spotlightRect.width / 2}px ${spotlightRect.top + spotlightRect.height / 2}px,
                transparent 0%,
                transparent 50%,
                rgba(0, 0, 0, 0.85) 100%
              )
            `,
          }}
        />
      )}

      {/* Default dark overlay when no spotlight */}
      {!spotlightRect && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm pointer-events-none" />
      )}

      {/* Tutorial Dialog */}
      <div 
        className="fixed z-50 pointer-events-auto max-w-lg w-full bg-gradient-to-br from-zk-darker to-zk-dark border-2 border-zk-primary/30 rounded-2xl p-8 shadow-2xl"
        style={dialogPosition}
      >
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
              onClick={handleActionClick}
              className="flex-1 px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all hover:scale-105 text-center"
            >
              {step.action}
            </Link>
          ) : (
            <button
              onClick={handleNext}
              className={`${isFirstStep ? 'w-full' : 'flex-1'} px-6 py-3 bg-zk-primary text-zk-darker rounded-lg font-medium hover:bg-zk-primary/90 transition-all hover:scale-105`}
            >
              {isLastStep ? "I'm Ready!" : 'Next'}
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

