'use client';

import { useState, useMemo } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { soilTypes, SoilType, soilInfos } from '@/lib/soil';
import { calculateGardenWatering } from '@/lib/watering';
import { getPestsForPlants, commonPests } from '@/lib/pests';
import { getPlantById } from '@/lib/plants';

export default function GardenCare() {
  const { placedPlants, soilType, setSoilType } = useGardenStore();
  const [expandedSection, setExpandedSection] = useState<'soil' | 'water' | 'pests'>('soil');
  
  // Get unique plant IDs from placed plants
  const uniquePlantIds = useMemo(() => {
    return [...new Set(placedPlants.map(p => p.plantId))];
  }, [placedPlants]);
  
  // Get watering recommendations
  const wateringInfo = useMemo(() => {
    return calculateGardenWatering(uniquePlantIds);
  }, [uniquePlantIds]);
  
  // Get relevant pests
  const relevantPests = useMemo(() => {
    return getPestsForPlants(uniquePlantIds);
  }, [uniquePlantIds]);
  
  const soilInfo = soilType ? soilTypes[soilType] : null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
        <span className="text-xl">🌍</span> Garden Care
      </h2>
      
      {/* Soil Type Selection */}
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'soil' ? 'water' : 'soil')}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/50 dark:hover:to-orange-900/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪴</span>
            <div className="text-left">
              <p className="font-medium text-gray-800 dark:text-gray-200">Soil Type</p>
              <p className="text-sm text-gray-500">
                {soilInfo ? soilInfo.name : 'Select your soil type'}
              </p>
            </div>
          </div>
          <span className="text-gray-400">{expandedSection === 'soil' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'soil' && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {/* Soil type selector */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(Object.keys(soilTypes) as SoilType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSoilType(type)}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    soilType === type
                      ? 'bg-green-500 text-white'
                      : 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {soilTypes[type].name}
                </button>
              ))}
            </div>
            
            {/* Soil info */}
            {soilInfo && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {soilInfo.description}
                </p>
                
                {/* Soil color indicator */}
                <div 
                  className="h-4 rounded-full"
                  style={{ backgroundColor: soilInfo.color }}
                  title="Typical soil color"
                />
                
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">💡 Growing Tips:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {soilInfo.tips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">🛠️ Improve Your Soil:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {soilInfo.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-blue-500">→</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Watering Schedule */}
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'water' ? 'soil' : 'water')}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/50 dark:hover:to-cyan-900/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <div className="text-left">
              <p className="font-medium text-gray-800 dark:text-gray-200">Watering Schedule</p>
              <p className="text-sm text-gray-500">
                {wateringInfo.frequency} • ~{wateringInfo.avgInches.toFixed(1)}" per week
              </p>
            </div>
          </div>
          <span className="text-gray-400">{expandedSection === 'water' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'water' && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {/* Water needs summary */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {wateringInfo.frequency}
                </p>
                <p className="text-sm text-gray-500">
                  ~{wateringInfo.avgInches.toFixed(1)} inches per week
                </p>
              </div>
              <div className="text-3xl">🌊</div>
            </div>
            
            {/* Individual plant water needs if there are plants */}
            {uniquePlantIds.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your plants' needs:</p>
                <div className="flex flex-wrap gap-1">
                  {uniquePlantIds.slice(0, 8).map((plantId) => {
                    const plant = getPlantById(plantId);
                    if (!plant) return null;
                    return (
                      <span 
                        key={plantId}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded text-xs"
                        title={plant.name}
                      >
                        {plant.emoji}
                      </span>
                    );
                  })}
                  {uniquePlantIds.length > 8 && (
                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs">
                      +{uniquePlantIds.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Tips */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">💡 Watering Tips:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                {wateringInfo.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-blue-500">💧</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Pest Reference */}
      <div>
        <button
          onClick={() => setExpandedSection(expandedSection === 'pests' ? 'soil' : 'pests')}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/50 dark:hover:to-orange-900/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐛</span>
            <div className="text-left">
              <p className="font-medium text-gray-800 dark:text-gray-200">Pest Reference</p>
              <p className="text-sm text-gray-500">
                {uniquePlantIds.length > 0 
                  ? `${relevantPests.length} potential pests` 
                  : 'Common garden pests'}
              </p>
            </div>
          </div>
          <span className="text-gray-400">{expandedSection === 'pests' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'pests' && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {relevantPests.length > 0 ? (
              <div className="space-y-3">
                {relevantPests.map((pest) => (
                  <div key={pest.id} className="p-2 bg-white dark:bg-gray-600 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{pest.emoji}</span>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{pest.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Affects: {pest.affectedPlants.slice(0, 4).join(', ')}
                    </p>
                    <details className="text-xs">
                      <summary className="cursor-pointer text-green-600 dark:text-green-400 hover:underline">
                        View organic remedies
                      </summary>
                      <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                        {pest.organicRemedies.slice(0, 3).map((remedy, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-green-500">✓</span>
                            {remedy}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-3xl mb-2">🌱</p>
                <p className="text-sm text-gray-500">
                  {uniquePlantIds.length === 0 
                    ? 'Add plants to see relevant pests' 
                    : 'No common pests for your plants!'}
                </p>
              </div>
            )}
            
            {/* Quick reference for all pests */}
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:underline">
                View all common pests
              </summary>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {commonPests.slice(0, 6).map((pest) => (
                  <div 
                    key={pest.id}
                    className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300"
                  >
                    <span>{pest.emoji}</span>
                    <span>{pest.name}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
