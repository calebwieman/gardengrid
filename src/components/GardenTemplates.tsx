'use client';

import { useGardenStore, PlacedPlant } from '@/stores/gardenStore';
import { getPlantById } from '@/lib/plants';

export interface GardenTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  gridSize: number;
  plants: { plantId: string; x: number; y: number }[];
}

export const gardenTemplates: GardenTemplate[] = [
  {
    id: 'salsa',
    name: 'Salsa Garden',
    emoji: '🌶️',
    description: 'Fresh ingredients for homemade salsa',
    gridSize: 4,
    plants: [
      { plantId: 'tomato', x: 0, y: 0 },
      { plantId: 'tomato', x: 1, y: 0 },
      { plantId: 'pepper', x: 2, y: 0 },
      { plantId: 'pepper', x: 3, y: 0 },
      { plantId: 'cilantro', x: 0, y: 1 },
      { plantId: 'cilantro', x: 1, y: 1 },
      { plantId: 'onion', x: 2, y: 1 },
      { plantId: 'onion', x: 3, y: 1 },
    ],
  },
  {
    id: 'salad',
    name: 'Salad Garden',
    emoji: '🥗',
    description: 'Fresh greens and toppings',
    gridSize: 4,
    plants: [
      { plantId: 'lettuce', x: 0, y: 0 },
      { plantId: 'lettuce', x: 1, y: 0 },
      { plantId: 'spinach', x: 2, y: 0 },
      { plantId: 'spinach', x: 3, y: 0 },
      { plantId: 'tomato', x: 0, y: 1 },
      { plantId: 'cucumber', x: 1, y: 1 },
      { plantId: 'radish', x: 2, y: 1 },
      { plantId: 'carrot', x: 3, y: 1 },
    ],
  },
  {
    id: 'three-sisters',
    name: 'Three Sisters',
    emoji: '🌽',
    description: 'Traditional Native American companion planting',
    gridSize: 4,
    plants: [
      { plantId: 'corn', x: 1, y: 0 },
      { plantId: 'corn', x: 2, y: 0 },
      { plantId: 'corn', x: 1, y: 1 },
      { plantId: 'corn', x: 2, y: 1 },
      { plantId: 'bean', x: 0, y: 0 },
      { plantId: 'bean', x: 3, y: 0 },
      { plantId: 'squash', x: 0, y: 2 },
      { plantId: 'squash', x: 1, y: 3 },
      { plantId: 'squash', x: 2, y: 3 },
      { plantId: 'squash', x: 3, y: 2 },
    ],
  },
  {
    id: 'pizza',
    name: 'Pizza Garden',
    emoji: '🍕',
    description: 'Everything for homemade pizza',
    gridSize: 4,
    plants: [
      { plantId: 'tomato', x: 0, y: 0 },
      { plantId: 'tomato', x: 1, y: 0 },
      { plantId: 'basil', x: 2, y: 0 },
      { plantId: 'basil', x: 3, y: 0 },
      { plantId: 'oregano', x: 0, y: 1 },
      { plantId: 'oregano', x: 1, y: 1 },
      { plantId: 'pepper', x: 2, y: 1 },
      { plantId: 'pepper', x: 3, y: 1 },
    ],
  },
  {
    id: 'herb-spiral',
    name: 'Herb Spiral',
    emoji: '🌿',
    description: 'Mediterranean herbs in a spiral',
    gridSize: 4,
    plants: [
      { plantId: 'rosemary', x: 0, y: 0 },
      { plantId: 'thyme', x: 1, y: 0 },
      { plantId: 'sage', x: 2, y: 0 },
      { plantId: 'oregano', x: 3, y: 0 },
      { plantId: 'basil', x: 0, y: 1 },
      { plantId: 'parsley', x: 1, y: 1 },
      { plantId: 'cilantro', x: 2, y: 1 },
      { plantId: 'dill', x: 3, y: 1 },
      { plantId: 'chives', x: 0, y: 2 },
      { plantId: 'lavender', x: 3, y: 2 },
    ],
  },
  {
    id: 'strawberry-patch',
    name: 'Strawberry Patch',
    emoji: '🍓',
    description: 'A sweet strawberry patch',
    gridSize: 4,
    plants: [
      { plantId: 'strawberry', x: 0, y: 0 },
      { plantId: 'strawberry', x: 1, y: 0 },
      { plantId: 'strawberry', x: 2, y: 0 },
      { plantId: 'strawberry', x: 3, y: 0 },
      { plantId: 'strawberry', x: 0, y: 1 },
      { plantId: 'strawberry', x: 1, y: 1 },
      { plantId: 'strawberry', x: 2, y: 1 },
      { plantId: 'strawberry', x: 3, y: 1 },
      { plantId: 'lettuce', x: 0, y: 2 },
      { plantId: 'spinach', x: 1, y: 2 },
      { plantId: 'thyme', x: 2, y: 2 },
      { plantId: 'onion', x: 3, y: 2 },
    ],
  },
];

export default function GardenTemplates() {
  const { setGardenName, setGridSize, setPlacedPlants, placedPlants } = useGardenStore();

  const applyTemplate = (template: GardenTemplate) => {
    if (placedPlants.length > 0) {
      if (!confirm('This will replace your current garden. Continue?')) {
        return;
      }
    }
    
    setGardenName(template.name);
    setGridSize(template.gridSize);
    
    const newPlacedPlants: PlacedPlant[] = template.plants
      .filter(p => getPlantById(p.plantId))
      .map((p, index) => ({
        id: `${p.plantId}-${p.x}-${p.y}-${index}`,
        plantId: p.plantId,
        x: p.x,
        y: p.y,
      }));
    
    setPlacedPlants(newPlacedPlants);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="font-semibold text-gray-700 mb-3">🌱 Garden Templates</h2>
      <p className="text-xs text-gray-500 mb-3">Quick-start layouts for common gardens</p>
      
      <div className="grid grid-cols-2 gap-2">
        {gardenTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => applyTemplate(template)}
            className="p-2 text-left bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{template.emoji}</span>
              <span className="font-medium text-sm text-gray-700 group-hover:text-green-700">
                {template.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
