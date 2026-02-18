'use client';

import { useState, useEffect, useCallback } from 'react';

interface TutorialStep {
  target: string;
  title: string;
  content: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    target: 'tutorial-start',
    title: "Welcome to GardenGrid! 🌱",
    content: "Let's take a quick tour of your garden planner. Click 'Next' to continue, or 'Skip' to start now.",
  },
  {
    target: 'garden-grid',
    title: "Your Garden Grid",
    content: "Tap any cell to add plants. Each cell = 1 sq ft. Green dots = good companions, Red dots = bad combinations.",
  },
  {
    target: 'plant-picker',
    title: "Choose Your Plants",
    content: "Browse 60+ vegetables, herbs & fruits. Tap a cell to place plants.",
  },
  {
    target: 'harmony-score',
    title: "Harmony Score",
    content: "This shows how well your plants get along. Higher = better companions!",
  },
  {
    target: 'undo-redo',
    title: "Undo & Clear",
    content: "Made a mistake? Use Undo/Redo. The trash icon clears your garden.",
  },
  {
    target: 'nav-tabs',
    title: "All Features",
    content: "Explore more: Calendar, Stats, Journal, AI Assistant, Pests, and more!",
  },
  {
    target: 'dark-mode',
    title: "Dark Mode",
    content: "Toggle between light and dark themes.",
  },
  {
    target: 'tutorial-end',
    title: "You're Ready! 🎉",
    content: "That's it! Start planning your perfect garden. Need help? Tap the AI Assistant anytime!",
  },
];

interface TutorialProps {
  onComplete: () => void;
}

export default function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const step = tutorialSteps[currentStep];

  useEffect(() => {
    // Check if user has seen tutorial
    const seen = localStorage.getItem('gardengrid_tutorial_seen');
    if (!seen) {
      // Delay to ensure page is fully rendered
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('gardengrid_tutorial_seen', 'true');
      setIsVisible(false);
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem('gardengrid_tutorial_seen', 'true');
    setIsVisible(false);
    onComplete();
  }, [onComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNext, handleSkip]);

  if (!isVisible || !isReady) return null;

  const isCenterStep = step.target === 'tutorial-start' || step.target === 'tutorial-end';

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Modal Card */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative z-[10000]"
        style={{
          animation: 'tutorialPopIn 0.3s ease-out',
        }}
      >
        <style jsx>{`
          @keyframes tutorialPopIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {tutorialSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep 
                  ? 'bg-green-500 w-6' 
                  : i < currentStep 
                    ? 'bg-green-300 w-1.5' 
                    : 'bg-gray-200 dark:bg-gray-600 w-1.5'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="text-center mb-5">
          <div className="text-3xl mb-3">
            {currentStep === 0 ? '👋' : currentStep === tutorialSteps.length - 1 ? '🎉' : '🌿'}
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {step.content}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            className="flex-1 py-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium text-sm rounded-xl transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors text-sm"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Get Started!' : 'Next'}
          </button>
        </div>
        
        {/* Step counter */}
        <div className="text-center mt-3 text-xs text-gray-400">
          {currentStep + 1} of {tutorialSteps.length}
        </div>
      </div>
    </div>
  );
}
