'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TutorialStep {
  target?: string;
  title: string;
  content: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to GardenGrid! 🌱",
    content: "Let's show you around your new garden planner. This quick tour will help you get the most out of your garden.",
    position: 'center',
  },
  {
    target: 'garden-grid',
    title: "Your Garden Grid",
    content: "This is your garden plot. Tap or click any empty cell to add plants. Each cell represents 1 square foot of garden space.",
    position: 'center',
  },
  {
    target: 'plant-picker',
    title: "Plant Picker",
    content: "Choose from 60+ plants! Vegetables, herbs, and fruits. Each plant shows companion planting info - green dots mean good neighbors, red means bad combinations.",
    position: 'left',
  },
  {
    target: 'stage-toggle',
    title: "Track Plant Growth",
    content: "Click a planted cell to cycle through growth stages: Seedling 🌱 → Growing 🌿 → Ready to Harvest ✨",
    position: 'bottom',
  },
  {
    target: 'nav-tabs',
    title: "Explore All Features",
    content: "Use tabs to access: Garden (your grid), Calendar (planting schedule), Stats (analytics), Journal (notes), Assistant (AI help), and more!",
    position: 'top',
  },
  {
    target: 'dark-mode',
    title: "Dark Mode",
    content: "Toggle between light and dark themes. Your preference is saved automatically.",
    position: 'bottom',
  },
  {
    target: 'save-export',
    title: "Save & Export",
    content: "Your garden auto-saves. Use the export button to save a PNG image of your garden plan.",
    position: 'bottom',
  },
  {
    title: "You're Ready! 🎉",
    content: "That's it! Start planning your perfect garden. Need help? Tap the AI Assistant anytime for personalized gardening advice.",
    position: 'center',
  },
];

interface TutorialProps {
  onComplete: () => void;
}

export default function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const step = tutorialSteps[currentStep];

  useEffect(() => {
    // Check if user has seen tutorial
    const seen = localStorage.getItem('gardengrid_tutorial_seen');
    if (!seen) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('gardengrid_tutorial_seen', 'true');
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('gardengrid_tutorial_seen', 'true');
    setIsVisible(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Tutorial Card */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-4">
          {tutorialSteps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep ? 'bg-green-500' : i < currentStep ? 'bg-green-300' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">
            {currentStep === 0 ? '👋' : 
             currentStep === tutorialSteps.length - 1 ? '🎉' : '📖'}
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {step.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {step.content}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Get Started!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
