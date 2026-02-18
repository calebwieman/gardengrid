'use client';

import { useMemo } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { plants, getPlantById, Plant } from '@/lib/plants';

interface SmartSuggestionsProps {
  cellX?: number;
  cellY?: number;
  placedPlants: { x: number; y: number; plantId: string }[];
}

export default function SmartSuggestions({ cellX, cellY, placedPlants }: SmartSuggestionsProps) {
  const { selectedPlantId, setSelectedPlant } = useGardenStore();

  const suggestions = useMemo(() => {
    // If no cell is specified or no plants in garden, return popular choices
    if (placedPlants.length === 0) {
      return plants.slice(0, 5).map(plant => ({
        plant,
        score: 100,
        reasons: ['Great starter plant!']
      }));
    }

    // If a specific cell is provided, analyze neighbors
    if (cellX !== undefined && cellY !== undefined) {
      // Find neighbors (adjacent cells)
      const neighbors = placedPlants.filter(p => {
        const dx = Math.abs(p.x - cellX);
        const dy = Math.abs(p.y - cellY);
        return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
      });

      // Score each plant
      const scored = plants.map(plant => {
        let score = 50; // Base score
        const reasons: string[] = [];

        let companionCount = 0;
        let antagonistCount = 0;

        neighbors.forEach(neighbor => {
          const neighborPlant = getPlantById(neighbor.plantId);
          if (!neighborPlant) return;

          // Check if this plant is a companion of the neighbor
          if (neighborPlant.companions.includes(plant.id)) {
            companionCount++;
            score += 20;
            reasons.push(`Good with ${neighborPlant.emoji}`);
          }

          // Check if this plant is an antagonist of the neighbor
          if (neighborPlant.antagonists.includes(plant.id)) {
            antagonistCount++;
            score -= 25;
            reasons.push(`Avoid near ${neighborPlant.emoji}`);
          }

          // Check reverse
          if (plant.companions.includes(neighborPlant.id)) {
            companionCount++;
            score += 20;
          }
          if (plant.antagonists.includes(neighborPlant.id)) {
            antagonistCount++;
            score -= 25;
          }
        });

        // Bonus for plants that add diversity
        if (companionCount > 0 && antagonistCount === 0) {
          reasons.unshift('⭐ Great companion!');
        }

        return { plant, score: Math.max(0, Math.min(100, score)), reasons: reasons.slice(0, 2) };
      });

      // Sort by score and return top 5
      return scored
        .filter(s => s.score > 30)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }

    // Default: return balanced suggestions
    return plants.slice(0, 5).map(plant => ({
      plant,
      score: 100,
      reasons: ['Popular choice']
    }));
  }, [cellX, cellY, placedPlants]);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mt-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
        <span>💡</span> Smart Suggestions
        {cellX !== undefined && cellY !== undefined && (
          <span className="text-xs font-normal text-gray-400">
            for cell ({cellX}, {cellY})
          </span>
        )}
      </h3>
      
      <div className="space-y-2">
        {suggestions.map(({ plant, score, reasons }) => (
          <button
            key={plant.id}
            onClick={() => setSelectedPlant(plant.id)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
              selectedPlantId === plant.id
                ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500'
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <span className="text-2xl">{plant.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-700 dark:text-gray-200 text-sm">
                {plant.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {reasons.join(' • ')}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div 
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  score >= 80 ? 'bg-green-100 text-green-700' :
                  score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}
              >
                {score}%
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        💡 Tip: Click a suggestion to select it, then click a cell to plant
      </p>
    </div>
  );
}
