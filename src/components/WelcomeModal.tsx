'use client';

import { useState, useEffect } from 'react';
import { useGardenStore } from '@/stores/gardenStore';

export default function WelcomeModal() {
  const { hasVisited, setHasVisited } = useGardenStore();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (!hasVisited) {
      // Small delay for smooth animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [hasVisited]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setHasVisited(true), 300);
  };
  
  if (hasVisited) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${
          isVisible ? 'pointer-events-auto' : ''
        }`}
      >
        <div 
          className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 transform transition-all duration-300 ${
            isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Header with icon */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 40 40" fill="none">
                <rect x="2" y="2" width="16" height="16" rx="3" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2"/>
                <rect x="22" y="2" width="16" height="16" rx="3" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2"/>
                <rect x="2" y="22" width="16" height="16" rx="3" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2"/>
                <rect x="22" y="22" width="16" height="16" rx="3" fill="#16a34a" stroke="#16a34a" strokeWidth="2"/>
                <path d="M30 30L34 34M30 34L34 30" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome to GardenGrid!</h2>
            <p className="text-gray-600 mt-1 text-sm">Your intelligent garden planning companion</p>
          </div>
          
          {/* Features */}
          <div className="space-y-2 sm:space-y-3 mb-4">
            <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 rounded-xl">
              <span className="text-xl">🪴</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Drag & Drop Plants</h3>
                <p className="text-xs text-gray-600">Select a plant and tap any cell to place it</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-xl">
              <span className="text-xl">💚</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Companion Planting</h3>
                <p className="text-xs text-gray-600">Green = good neighbors, Red = conflicts</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-purple-50 rounded-xl">
              <span className="text-xl">📅</span>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Planting Calendar</h3>
                <p className="text-xs text-gray-600">Best times to plant based on USDA zone</p>
              </div>
            </div>
          </div>
          
          {/* Tips */}
          <div className="bg-amber-50 rounded-xl p-3 mb-4">
            <h4 className="font-semibold text-amber-800 mb-1 text-sm">💡 Quick Tips</h4>
            <ul className="text-xs text-amber-700 space-y-0.5">
              <li>• Each cell = 1 square foot</li>
              <li>• Click plant → click grid to place</li>
              <li>• Auto-saves automatically!</li>
            </ul>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={handleClose}
            className="w-full py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            Start Planning! 🚀
          </button>
        </div>
      </div>
    </>
  );
}
