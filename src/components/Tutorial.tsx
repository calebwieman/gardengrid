'use client';

import { useState, useEffect, useRef } from 'react';

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
    content: "Browse 60+ vegetables, herbs & fruits. Drag to grid or tap cell on mobile.",
  },
  {
    target: 'stage-toggle',
    title: "Track Growth Stages",
    content: "Click a plant to cycle: Seedling 🌱 → Growing 🌿 → Ready ✨. Track when to harvest!",
  },
  {
    target: 'harmony-score',
    title: "Harmony Score",
    content: "This shows how well your plants get along. 100% = perfect companions! Green = good, Red = conflicts.",
  },
  {
    target: 'undo-redo',
    title: "Undo & Clear",
    content: "Made a mistake? Use Undo/Redo. The trash icon clears your whole garden.",
  },
  {
    target: 'nav-tabs',
    title: "All Features",
    content: "Explore more: Calendar (planting schedule), Stats (analytics), Journal (notes), AI Assistant (help), & more!",
  },
  {
    target: 'dark-mode',
    title: "Dark Mode",
    content: "Toggle between light and dark themes. Your preference is saved automatically.",
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
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const step = tutorialSteps[currentStep];
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = localStorage.getItem('gardengrid_tutorial_seen');
    if (!seen) {
      setIsVisible(true);
      // Delay to ensure page is fully rendered
      setTimeout(() => updatePosition(), 100);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [currentStep, isVisible]);

  const updatePosition = () => {
    if (step.target === 'tutorial-start' || step.target === 'tutorial-end') {
      // Center for intro/end slides
      setHighlightStyle({ display: 'none' });
      setTooltipPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      return;
    }

    const element = document.querySelector(`#${step.target}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      setHighlightStyle({
        position: 'absolute',
        left: rect.left + scrollX - 4,
        top: rect.top + scrollY - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        borderRadius: '8px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        zIndex: 9998,
        transition: 'all 0.3s ease',
      });

      // Position tooltip near the element
      const tooltipWidth = 320;
      let x = rect.left + scrollX + rect.width / 2 - tooltipWidth / 2;
      let y = rect.bottom + scrollY + 16;

      // Keep within viewport
      if (x < 16) x = 16;
      if (x + tooltipWidth > window.innerWidth - 16) x = window.innerWidth - tooltipWidth - 16;
      if (y + 200 > window.innerHeight + scrollY) {
        y = rect.top + scrollY - 16 - 200;
      }

      setTooltipPosition({ x: x + tooltipWidth / 2, y });
    }
  };

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

  if (!isVisible) return null;

  return (
    <>
      {/* Highlight overlay */}
      <div style={highlightStyle} />
      
      {/* Tooltip */}
      <div 
        ref={tooltipRef}
        className="fixed z-50 transition-all duration-300"
        style={{
          left: step.target === 'tutorial-start' || step.target === 'tutorial-end' 
            ? '50%' 
            : tooltipPosition.x,
          top: step.target === 'tutorial-start' || step.target === 'tutorial-end'
            ? '50%'
            : tooltipPosition.y,
          transform: step.target === 'tutorial-start' || step.target === 'tutorial-end'
            ? 'translate(-50%, -50%)'
            : 'translateX(-50%)',
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-80 p-5">
          {/* Progress */}
          <div className="flex justify-center gap-1.5 mb-4">
            {tutorialSteps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? 'bg-green-500 w-4' : i < currentStep ? 'bg-green-300' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          {/* Content */}
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">
              {currentStep === 0 ? '👋' : currentStep === tutorialSteps.length - 1 ? '🎉' : '✨'}
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {step.content}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="flex-1 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium text-sm"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Start Gardening!' : 'Next'}
            </button>
          </div>
        </div>
        
        {/* Arrow pointing to element */}
        {step.target !== 'tutorial-start' && step.target !== 'tutorial-end' && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
        )}
      </div>
    </>
  );
}
