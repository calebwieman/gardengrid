'use client';

import { useMemo } from 'react';
import { PlacedPlant } from '@/stores/gardenStore';
import { getPlantById } from '@/lib/plants';

export default function GardenStats({ placedPlants }: { placedPlants: PlacedPlant[] }) {
  const stats = useMemo(() => {
    const plantCounts: Record<string, number> = {};
    const categories: Record<string, number> = { vegetable: 0, herb: 0, fruit: 0 };
    let totalSpacing = 0;
    let uniquePlants = new Set<string>();
    
    placedPlants.forEach(p => {
      const plant = getPlantById(p.plantId);
      if (plant) {
        plantCounts[plant.name] = (plantCounts[plant.name] || 0) + 1;
        categories[plant.category]++;
        totalSpacing += plant.spacing;
        uniquePlants.add(plant.id);
      }
    });
    
    return {
      plantCounts,
      categories,
      totalSpacing,
      uniqueCount: uniquePlants.size,
      totalPlants: placedPlants.length,
    };
  }, [placedPlants]);
  
  if (placedPlants.length === 0) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-4">
      <h3 className="font-semibold text-gray-700 mb-3">📊 Garden Stats</h3>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500 text-xs">Total Plants</p>
          <p className="text-xl font-bold text-green-600">{stats.totalPlants}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-gray-500 text-xs">Unique Types</p>
          <p className="text-xl font-bold text-blue-600">{stats.uniqueCount}</p>
        </div>
      </div>
      
      {stats.categories.vegetable > 0 && (
        <div className="mt-3 text-sm">
          <p className="text-gray-500 text-xs">🥬 Vegetables: {stats.categories.vegetable}</p>
        </div>
      )}
      {stats.categories.herb > 0 && (
        <div className="text-sm">
          <p className="text-gray-500 text-xs">🌿 Herbs: {stats.categories.herb}</p>
        </div>
      )}
      {stats.categories.fruit > 0 && (
        <div className="text-sm">
          <p className="text-gray-500 text-xs">🍓 Fruits: {stats.categories.fruit}</p>
        </div>
      )}
    </div>
  );
}
