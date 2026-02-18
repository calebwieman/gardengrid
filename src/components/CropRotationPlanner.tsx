'use client';

import { useState } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { getPlantFamily, plantFamilyNames, plantFamilyEmoji, PlantFamily } from '@/lib/plants';

export default function CropRotationPlanner() {
  const { 
    placedPlants, 
    rotationHistory, 
    saveToRotationHistory, 
    getRotationWarnings,
    getRotationSuggestions,
    clearRotationHistory 
  } = useGardenStore();
  
  const [activeTab, setActiveTab] = useState<'warnings' | 'suggestions' | 'history'>('warnings');
  
  const currentYear = new Date().getFullYear();
  const warnings = getRotationWarnings();
  const suggestions = getRotationSuggestions();
  const years = Object.keys(rotationHistory).map(Number).sort((a, b) => b - a);
  
  const handleSaveYear = () => {
    saveToRotationHistory(currentYear);
    alert(`Saved ${currentYear} planting to rotation history!`);
  };
  
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all rotation history? This cannot be undone.')) {
      clearRotationHistory();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header - Always Expanded */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h3 className="text-white font-semibold">Crop Rotation Planner</h3>
              <p className="text-amber-100 text-sm">Plan next year's garden with smart rotations</p>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-3 flex gap-4 text-sm">
          {warnings.length > 0 ? (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full">
              ⚠️ {warnings.length} rotation warning{warnings.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full">
              ✅ No issues
            </span>
          )}
          {years.length > 0 && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full">
              📅 {years.length} year{years.length !== 1 ? 's' : ''} tracked
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('warnings')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'warnings' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚠️ Warnings ({warnings.length})
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'suggestions' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💡 Suggestions
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'history' 
                  ? 'text-green-600 border-b-2 border-green-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📜 History
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="min-h-[200px]">
            {/* Warnings Tab */}
            {activeTab === 'warnings' && (
              <div>
                {warnings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">✅</span>
                    <p>No rotation issues detected!</p>
                    <p className="text-sm mt-1">Your crops are well rotated.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {warnings.map((warning, idx) => (
                      <div 
                        key={idx}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3"
                      >
                        <span className="text-xl">⚠️</span>
                        <div>
                          <p className="text-red-800 font-medium">
                            Position ({warning.x}, {warning.y})
                          </p>
                          <p className="text-red-600 text-sm">{warning.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>💡 Tip:</strong> Don't plant the same plant family in the same spot 
                    for at least 3 years to prevent soil depletion and reduce pest buildup.
                  </p>
                </div>
              </div>
            )}
            
            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div>
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">🌱</span>
                    <p>No plants in garden yet</p>
                    <p className="text-sm mt-1">Add plants to see rotation suggestions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suggestions.map((suggestion) => (
                      <div 
                        key={suggestion.family}
                        className="bg-green-50 border border-green-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{suggestion.emoji}</span>
                          <span className="font-medium text-green-800">{suggestion.name}</span>
                        </div>
                        <p className="text-green-700 text-sm mb-2">
                          Good crops to plant next year:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.goodFollowers.map((follower) => (
                            <span 
                              key={follower}
                              className="bg-white border border-green-300 rounded-full px-2 py-1 text-xs"
                            >
                              {plantFamilyEmoji[follower as PlantFamily]} {plantFamilyNames[follower as PlantFamily]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-purple-800 text-sm">
                    <strong>🌿 Legumes</strong> (beans, peas) are excellent to plant after any crop 
                    as they add nitrogen back to the soil!
                  </p>
                </div>
              </div>
            )}
            
            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                {years.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">📜</span>
                    <p>No rotation history yet</p>
                    <p className="text-sm mt-1">Save your current garden to start tracking</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {years.map((year) => {
                      const yearData = rotationHistory[year.toString()] || [];
                      const uniqueFamilies = new Set(
                        yearData.map((entry: string) => entry.split(':')[1])
                      );
                      
                      return (
                        <div 
                          key={year}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-800">📅 {year}</span>
                            <span className="text-sm text-gray-500">
                              {yearData.length} cell{yearData.length !== 1 ? 's' : ''} tracked
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(uniqueFamilies).map((family) => (
                              <span 
                                key={family}
                                className="bg-white border border-gray-300 rounded-full px-2 py-1 text-xs"
                              >
                                {plantFamilyEmoji[family as PlantFamily] || '🌱'} {plantFamilyNames[family as PlantFamily] || family}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
            <button
              onClick={handleSaveYear}
              disabled={placedPlants.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              💾 Save {currentYear} to History
            </button>
            
            {years.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🗑️ Clear History
              </button>
            )}
          </div>
        </div>
    </div>
  );
}
