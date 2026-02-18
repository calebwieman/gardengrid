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
          className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all duration-300 ${
            isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Header with icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-4xl">🌱</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome to GardenGrid!</h2>
            <p className="text-gray-600 mt-2">Your intelligent garden planning companion</p>
          </div>
          
          {/* Features */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
              <span className="text-2xl">🪴</span>
              <div>
                <h3 className="font-semibold text-gray-800">Drag & Drop Plants</h3>
                <p className="text-sm text-gray-600">Select a plant and tap any cell to place it in your garden</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
              <span className="text-2xl">💚</span>
              <div>
                <h3 className="font-semibold text-gray-800">Companion Planting</h3>
                <p className="text-sm text-gray-600">Green lines show good neighbors, red lines show conflicts</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
              <span className="text-2xl">📅</span>
              <div>
                <h3 className="font-semibold text-gray-800">Planting Calendar</h3>
                <p className="text-sm text-gray-600">See the best times to plant based on your USDA zone</p>
              </div>
            </div>
          </div>
          
          {/* Tips */}
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-amber-800 mb-2">💡 Quick Tips</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Each grid cell represents 1 square foot</li>
              <li>• Click a plant to select, click grid to place</li>
              <li>• Use the compatibility score to optimize your layout</li>
              <li>• Your garden saves automatically!</li>
            </ul>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={handleClose}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            Start Planning! 🚀
          </button>
        </div>
      </div>
    </>
  );
}
