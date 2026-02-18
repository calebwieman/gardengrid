'use client';

import { useState, useMemo } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { plants, getPlantById, Plant } from '@/lib/plants';

// Plants that benefit from succession planting
const successionPlantingInfo: Record<string, { interval: number; description: string; seasons: string[] }> = {
  lettuce: { interval: 14, description: 'Plant every 2 weeks for continuous harvest', seasons: ['spring', 'fall'] },
  radish: { interval: 10, description: 'Plant every 10 days for constant supply', seasons: ['spring', 'fall'] },
  bean: { interval: 14, description: 'Plant every 2 weeks for extended harvest', seasons: ['summer'] },
  pea: { interval: 14, description: 'Plant every 2 weeks for continuous harvest', seasons: ['spring', 'fall'] },
  carrot: { interval: 21, description: 'Plant every 3 weeks for steady supply', seasons: ['spring', 'fall'] },
  beet: { interval: 21, description: 'Plant every 3 weeks for continuous harvest', seasons: ['spring', 'fall'] },
  spinach: { interval: 14, description: 'Plant every 2 weeks for extended harvest', seasons: ['spring', 'fall'] },
  cucumber: { interval: 21, description: 'Plant every 3 weeks for prolonged harvest', seasons: ['summer'] },
  zucchini: { interval: 30, description: 'Plant every 4 weeks for consistent harvest', seasons: ['summer'] },
  basil: { interval: 21, description: 'Plant every 3 weeks for fresh supply', seasons: ['summer'] },
  cilantro: { interval: 14, description: 'Plant every 2 weeks as it bolts quickly', seasons: ['spring', 'fall'] },
  scallion: { interval: 21, description: 'Plant every 3 weeks for continuous harvest', seasons: ['spring', 'summer', 'fall'] },
};

interface SuccessionPlant {
  plantId: string;
  plant: Plant;
  interval: number;
  description: string;
  seasons: string[];
  lastPlanted?: string;
  nextPlanting?: string;
  plantingDates: string[];
}

export default function SuccessionPlantingScheduler() {
  const { placedPlants, zone, gridSize } = useGardenStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<string>('spring');
  
  // Get unique plants placed in garden with succession info
  const successionPlants = useMemo(() => {
    const placedPlantIds = [...new Set(placedPlants.map(p => p.plantId))];
    const result: SuccessionPlant[] = [];
    
    for (const plantId of placedPlantIds) {
      const info = successionPlantingInfo[plantId];
      const plant = getPlantById(plantId);
      if (info && plant) {
        // Generate planting dates based on zone
        const plantingDates = generatePlantingDates(zone, info.seasons);
        
        result.push({
          plantId,
          plant,
          interval: info.interval,
          description: info.description,
          seasons: info.seasons,
          plantingDates,
        });
      }
    }
    
    return result;
  }, [placedPlants, zone]);
  
  // Calculate frost dates based on zone
  const frostDates = useMemo(() => {
    // Approximate last frost in spring and first frost in fall by USDA zone
    const springFrost: Record<number, number> = {
      3: -60, 4: -45, 5: -30, 6: -15, 7: 0, 8: 14, 9: 30, 10: 45
    };
    const fallFrost: Record<number, number> = {
      3: 180, 4: 195, 5: 210, 6: 225, 7: 240, 8: 255, 9: 270, 10: 285
    };
    
    const year = new Date().getFullYear();
    const lastFrost = new Date(year, 2, 1); // March 1 base
    lastFrost.setDate(springFrost[zone] || 0);
    
    const firstFrost = new Date(year, 6, 1); // July 1 base
    firstFrost.setDate(fallFrost[zone] || 210);
    
    return { lastFrost, firstFrost };
  }, [zone]);
  
  // Filter by season
  const filteredPlants = useMemo(() => {
    if (selectedSeason === 'all') return successionPlants;
    return successionPlants.filter(p => p.seasons.includes(selectedSeason));
  }, [successionPlants, selectedSeason]);
  
  if (successionPlants.length === 0) {
    return null; // Don't show if no succession-suitable plants
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔄</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Succession Planting</h3>
            <p className="text-xs text-gray-500">{successionPlants.length} plants benefit</p>
          </div>
        </div>
        <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      
      {/* Content */}
      {isOpen && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2">
          {/* Season filter */}
          <div className="flex gap-2 mb-4">
            {['all', 'spring', 'summer', 'fall'].map(season => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedSeason === season
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {season.charAt(0).toUpperCase() + season.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Info box */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Succession planting</strong> means planting the same crop at intervals to ensure continuous harvest throughout the season.
            </p>
          </div>
          
          {/* Plant list */}
          <div className="space-y-3">
            {filteredPlants.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No plants configured for {selectedSeason} succession planting.
              </p>
            ) : (
              filteredPlants.map(({ plantId, plant, interval, description, plantingDates }) => (
                <div
                  key={plantId}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{plant.emoji}</span>
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-200">{plant.name}</h4>
                        <p className="text-xs text-gray-500">Every {interval} days</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full">
                      {plantingDates.length} plantings
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{description}</p>
                  
                  {/* Planting timeline */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Recommended planting dates:</p>
                    <div className="flex flex-wrap gap-1">
                      {plantingDates.slice(0, 6).map((date, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-xs rounded"
                        >
                          {formatDate(date)}
                        </span>
                      ))}
                      {plantingDates.length > 6 && (
                        <span className="px-2 py-1 text-xs text-gray-400">
                          +{plantingDates.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Tips */}
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">🌱 Pro Tips</h4>
            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Start your first planting on the last frost date</li>
              <li>• Stop succession planting 60-90 days before first fall frost</li>
              <li>• Use different varieties for staggered maturity</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Generate planting dates based on zone and seasons
function generatePlantingDates(zone: number, seasons: string[]): string[] {
  const dates: string[] = [];
  const year = new Date().getFullYear();
  
  // Last frost date (approximate)
  const frostDates: Record<number, number> = {
    3: -60, 4: -45, 5: -30, 6: -15, 7: 0, 8: 14, 9: 30, 10: 45
  };
  const lastFrost = frostDates[zone] || 0;
  
  // First frost date (approximate)  
  const firstFrostDates: Record<number, number> = {
    3: 180, 4: 195, 5: 210, 6: 225, 7: 240, 8: 255, 9: 270, 10: 285
  };
  const firstFrost = firstFrostDates[zone] || 210;
  
  const seasonsConfig: Record<string, { start: number; end: number }> = {
    spring: { start: lastFrost, end: lastFrost + 60 },
    summer: { start: lastFrost + 30, end: firstFrost - 60 },
    fall: { start: firstFrost - 90, end: firstFrost - 30 },
  };
  
  for (const season of seasons) {
    const config = seasonsConfig[season];
    if (!config) continue;
    
    // Generate dates every 14-21 days within the season window
    for (let day = config.start; day <= config.end; day += 14) {
      const date = new Date(year, 2, 1); // March 1
      date.setDate(1 + day);
      if (date > new Date()) {
        dates.push(date.toISOString());
      }
    }
  }
  
  return [...new Set(dates)].sort();
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
