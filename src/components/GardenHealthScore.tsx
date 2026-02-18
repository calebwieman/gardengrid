'use client';

import { useMemo } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { getPlantById, Plant } from '@/lib/plants';

interface HealthScore {
  overall: number;
  companion: number;
  diversity: number;
  spacing: number;
  seasonal: number;
  suggestions: string[];
}

export default function GardenHealthScore() {
  const { placedPlants, gridSize, zone } = useGardenStore();

  const healthScore = useMemo((): HealthScore => {
    if (placedPlants.length === 0) {
      return {
        overall: 0,
        companion: 0,
        diversity: 0,
        spacing: 0,
        seasonal: 0,
        suggestions: ['Start by adding plants to your garden!']
      };
    }

    const suggestions: string[] = [];
    
    // 1. Companion Planting Score
    let companionScore = 100;
    let goodCompanions = 0;
    let badCompanions = 0;
    
    placedPlants.forEach(plant => {
      const plantData = getPlantById(plant.plantId);
      if (!plantData) return;
      
      // Check neighbors
      const neighbors = placedPlants.filter(p => {
        if (p.id === plant.id) return false;
        const dx = Math.abs(p.x - plant.x);
        const dy = Math.abs(p.y - plant.y);
        return dx <= 1 && dy <= 1;
      });
      
      neighbors.forEach(neighbor => {
        const neighborData = getPlantById(neighbor.plantId);
        if (!neighborData) return;
        
        // Good companion
        if (plantData.companions.includes(neighborData.id) || 
            neighborData.companions.includes(plantData.id)) {
          goodCompanions++;
        }
        // Bad companion
        if (plantData.antagonists.includes(neighborData.id) ||
            neighborData.antagonists.includes(plantData.id)) {
          badCompanions++;
          companionScore -= 15;
        }
      });
    });
    
    companionScore = Math.max(0, companionScore + (goodCompanions * 5));
    if (badCompanions > 0) {
      suggestions.push(`⚠️ Move ${badCompanions} plant(s) away from incompatible neighbors`);
    }
    if (goodCompanions > 0) {
      suggestions.push(`✅ ${goodCompanions} good companion pairing(s) detected!`);
    }

    // 2. Diversity Score
    const plantFamilies = new Map<string, number>();
    const uniquePlants = new Set<string>();
    
    // Map categories to broader families for diversity scoring
    const getPlantFamily = (plant: Plant): string => {
      // Group by basic plant families
      const familyMap: Record<string, string[]> = {
        'Nightshade': ['tomato', 'pepper', 'eggplant', 'potato'],
        'Allium': ['onion', 'garlic', 'leek', 'chives'],
        'Brassica': ['broccoli', 'cabbage', 'kale', 'cauliflower', 'brussels sprouts', 'bok choy'],
        'Cucurbit': ['cucumber', 'squash', 'zucchini', 'pumpkin', 'melon'],
        'Legume': ['bean', 'pea', 'lentil'],
        'Umbellifer': ['carrot', 'celery', 'parsley', 'dill', 'fennel'],
        'Aster': ['lettuce', 'sunflower', 'artichoke'],
        'Lamiaceae': ['basil', 'mint', 'rosemary', 'thyme', 'oregano'],
      };
      
      for (const [family, plants] of Object.entries(familyMap)) {
        if (plants.includes(plant.id)) return family;
      }
      return plant.category === 'herb' ? 'Herb' : plant.category === 'fruit' ? 'Fruit' : 'Vegetable';
    };
    
    placedPlants.forEach(p => {
      const plantData = getPlantById(p.plantId);
      if (plantData) {
        uniquePlants.add(plantData.id);
        const family = getPlantFamily(plantData);
        plantFamilies.set(family, (plantFamilies.get(family) || 0) + 1);
      }
    });
    
    const diversityRatio = uniquePlants.size / placedPlants.length;
    const familyCount = plantFamilies.size;
    let diversityScore = Math.min(100, (diversityRatio * 50) + (familyCount * 15));
    
    if (diversityRatio < 0.3) {
      suggestions.push('🌱 Add more variety - try different plant families');
    }
    if (familyCount >= 5) {
      suggestions.push(`✅ Great diversity with ${familyCount} plant families!`);
    }

    // 3. Spacing Score
    let spacingScore = 100;
    const gridCells = gridSize * gridSize;
    const plantCount = placedPlants.length;
    const density = plantCount / gridCells;
    
    if (density > 0.8) {
      spacingScore = 40;
      suggestions.push('📏 Garden is very full - consider spacing plants more');
    } else if (density > 0.6) {
      spacingScore = 70;
      suggestions.push('📏 Good plant density');
    } else if (density > 0.3) {
      spacingScore = 90;
      suggestions.push('✅ Well-spaced garden!');
    } else {
      spacingScore = 60;
      suggestions.push('🌿 Your garden has room for more plants!');
    }

    // 4. Seasonal Appropriateness
    const now = new Date();
    const month = now.getMonth();
    const isSpring = month >= 2 && month <= 4;
    const isSummer = month >= 5 && month <= 7;
    const isFall = month >= 8 && month <= 10;
    const isWinter = month <= 1 || month >= 11;
    
    let seasonalScore = 50;
    let inSeasonCount = 0;
    let outOfSeasonCount = 0;
    
    // Determine if plant is warm or cool season based on typical growing conditions
    const isWarmSeasonPlant = (plantId: string): boolean => {
      const warmSeason = ['tomato', 'pepper', 'eggplant', 'squash', 'zucchini', 'cucumber', 'melon', 'pumpkin', 'bean', 'corn', 'basil'];
      const coolSeason = ['lettuce', 'spinach', 'kale', 'broccoli', 'cabbage', 'carrot', 'onion', 'garlic', 'pea', 'radish', 'beet'];
      if (warmSeason.includes(plantId)) return true;
      if (coolSeason.includes(plantId)) return false;
      // Default based on sun needs
      return true;
    };
    
    placedPlants.forEach(p => {
      const plantData = getPlantById(p.plantId);
      if (!plantData) return;
      
      const warmSeason = isWarmSeasonPlant(plantData.id);
      const currentIsWarm = isSpring || isSummer; // Warm months
      
      if (warmSeason === currentIsWarm || isFall) {
        inSeasonCount++;
        seasonalScore += 10;
      } else {
        outOfSeasonCount++;
        seasonalScore -= 10;
      }
    });
    
    seasonalScore = Math.min(100, Math.max(0, seasonalScore));
    
    if (outOfSeasonCount > inSeasonCount) {
      suggestions.push(`📅 Consider adding ${isSpring || isSummer ? 'warm-season' : 'cool-season'} plants`);
    }
    if (inSeasonCount > 0) {
      suggestions.push(`✅ ${inSeasonCount} plant(s) are well-timed for this season!`);
    }

    // Calculate overall
    const overall = Math.round(
      (companionScore * 0.3) + 
      (diversityScore * 0.25) + 
      (spacingScore * 0.25) + 
      (seasonalScore * 0.2)
    );

    // Limit suggestions
    const finalSuggestions = suggestions.slice(0, 4);
    if (overall >= 80) {
      finalSuggestions.unshift('🌟 Your garden is thriving!');
    } else if (overall >= 60) {
      finalSuggestions.unshift('💚 Garden is doing well!');
    }

    return {
      overall,
      companion: Math.round(companionScore),
      diversity: Math.round(diversityScore),
      spacing: Math.round(spacingScore),
      seasonal: Math.round(seasonalScore),
      suggestions: finalSuggestions
    };
  }, [placedPlants, gridSize, zone]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const scores = [
    { key: 'companion', label: 'Companion', icon: '🤝', value: healthScore.companion },
    { key: 'diversity', label: 'Diversity', icon: '🌈', value: healthScore.diversity },
    { key: 'spacing', label: 'Spacing', icon: '📏', value: healthScore.spacing },
    { key: 'seasonal', label: 'Seasonal', icon: '📅', value: healthScore.seasonal },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <span>🏥</span> Garden Health Score
      </h2>
      
      {/* Overall Score Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(healthScore.overall / 100) * 352} 352`}
              className={healthScore.overall >= 80 ? 'text-green-500' : healthScore.overall >= 60 ? 'text-yellow-500' : 'text-red-500'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(healthScore.overall)}`}>
              {healthScore.overall}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getScoreLabel(healthScore.overall)}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {scores.map(({ key, label, icon, value }) => (
          <div 
            key={key}
            className={`p-3 rounded-xl ${getScoreBg(value)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg">{icon}</span>
              <span className={`text-xl font-bold ${getScoreColor(value)}`}>
                {value}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 text-sm">
          💡 Suggestions
        </h3>
        <ul className="space-y-2">
          {healthScore.suggestions.map((suggestion, i) => (
            <li 
              key={i} 
              className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2"
            >
              <span className="text-base">{suggestion.split(' ')[0]}</span>
              <span>{suggestion.split(' ').slice(1).join(' ')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
