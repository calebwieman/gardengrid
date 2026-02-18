'use client';

import { useState } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { getPlantById } from '@/lib/plants';

interface GardenTheme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  plants: { plantId: string; x: number; y: number }[];
  gridSize: number;
}

const gardenThemes: GardenTheme[] = [
  {
    id: 'pizza',
    name: 'Pizza Garden',
    description: 'Everything you need for homemade pizza - fresh tomatoes, aromatic herbs, and peppers',
    emoji: '🍕',
    color: '#ef4444',
    gridSize: 4,
    plants: [
      { plantId: 'tomato', x: 1, y: 1 },
      { plantId: 'tomato', x: 2, y: 1 },
      { plantId: 'basil', x: 0, y: 1 },
      { plantId: 'basil', x: 3, y: 1 },
      { plantId: 'oregano', x: 0, y: 2 },
      { plantId: 'oregano', x: 3, y: 2 },
      { plantId: 'pepper', x: 1, y: 2 },
      { plantId: 'pepper', x: 2, y: 2 },
    ],
  },
  {
    id: 'salsa',
    name: 'Salsa Garden',
    description: 'Fresh ingredients for homemade salsa - tomatoes, peppers, cilantro, and more',
    emoji: '🌶️',
    color: '#f97316',
    gridSize: 4,
    plants: [
      { plantId: 'tomato', x: 1, y: 1 },
      { plantId: 'tomato', x: 2, y: 1 },
      { plantId: 'pepper', x: 0, y: 1 },
      { plantId: 'pepper', x: 3, y: 1 },
      { plantId: 'cilantro', x: 1, y: 2 },
      { plantId: 'cilantro', x: 2, y: 2 },
      { plantId: 'onion', x: 0, y: 2 },
      { plantId: 'onion', x: 3, y: 2 },
    ],
  },
  {
    id: 'salad',
    name: 'Salad Garden',
    description: 'Fresh greens and veggies for daily salads all season long',
    emoji: '🥗',
    color: '#22c55e',
    gridSize: 4,
    plants: [
      { plantId: 'lettuce', x: 0, y: 0 },
      { plantId: 'lettuce', x: 1, y: 0 },
      { plantId: 'lettuce', x: 2, y: 0 },
      { plantId: 'cucumber', x: 3, y: 0 },
      { plantId: 'tomato', x: 3, y: 1 },
      { plantId: 'radish', x: 0, y: 1 },
      { plantId: 'radish', x: 1, y: 1 },
      { plantId: 'spinach', x: 2, y: 1 },
      { plantId: 'carrot', x: 0, y: 2 },
      { plantId: 'carrot', x: 1, y: 2 },
    ],
  },
  {
    id: 'herb',
    name: 'Herb Spiral',
    description: 'Aromatic herbs for cooking - basil, rosemary, thyme, and more',
    emoji: '🌿',
    color: '#10b981',
    gridSize: 4,
    plants: [
      { plantId: 'basil', x: 0, y: 0 },
      { plantId: 'basil', x: 1, y: 0 },
      { plantId: 'rosemary', x: 2, y: 0 },
      { plantId: 'rosemary', x: 3, y: 0 },
      { plantId: 'thyme', x: 0, y: 1 },
      { plantId: 'thyme', x: 1, y: 1 },
      { plantId: 'parsley', x: 2, y: 1 },
      { plantId: 'parsley', x: 3, y: 1 },
      { plantId: 'mint', x: 0, y: 2 },
      { plantId: 'oregano', x: 1, y: 2 },
      { plantId: 'dill', x: 2, y: 2 },
      { plantId: 'chives', x: 3, y: 2 },
    ],
  },
  {
    id: 'three-sisters',
    name: 'Three Sisters',
    description: 'The traditional Native American companion planting: corn, beans, and squash',
    emoji: '🌽',
    color: '#eab308',
    gridSize: 4,
    plants: [
      { plantId: 'corn', x: 1, y: 1 },
      { plantId: 'corn', x: 2, y: 1 },
      { plantId: 'corn', x: 1, y: 2 },
      { plantId: 'corn', x: 2, y: 2 },
      { plantId: 'pole-beans', x: 1, y: 0 },
      { plantId: 'pole-beans', x: 2, y: 0 },
      { plantId: 'pole-beans', x: 0, y: 1 },
      { plantId: 'pole-beans', x: 3, y: 1 },
      { plantId: 'pole-beans', x: 0, y: 2 },
      { plantId: 'pole-beans', x: 3, y: 2 },
      { plantId: 'squash', x: 0, y: 3 },
      { plantId: 'squash', x: 1, y: 3 },
      { plantId: 'squash', x: 2, y: 3 },
      { plantId: 'squash', x: 3, y: 3 },
    ],
  },
  {
    id: 'butterfly',
    name: 'Butterfly Garden',
    description: 'Beautiful flowers that attract butterflies and pollinators',
    emoji: '🦋',
    color: '#8b5cf6',
    gridSize: 4,
    plants: [
      { plantId: 'zinnia', x: 0, y: 0 },
      { plantId: 'zinnia', x: 2, y: 0 },
      { plantId: 'marigold', x: 1, y: 0 },
      { plantId: 'marigold', x: 3, y: 0 },
      { plantId: 'sunflower', x: 0, y: 1 },
      { plantId: 'sunflower', x: 3, y: 1 },
      { plantId: 'lavender', x: 1, y: 1 },
      { plantId: 'lavender', x: 2, y: 1 },
      { plantId: 'cosmos', x: 0, y: 2 },
      { plantId: 'cosmos', x: 1, y: 2 },
      { plantId: 'cosmos', x: 2, y: 2 },
      { plantId: 'cosmos', x: 3, y: 2 },
    ],
  },
  {
    id: 'soup',
    name: 'Soup Garden',
    description: 'Vegetables perfect for homemade soups and stews',
    emoji: '🥣',
    color: '#f59e0b',
    gridSize: 4,
    plants: [
      { plantId: 'carrot', x: 0, y: 0 },
      { plantId: 'carrot', x: 1, y: 0 },
      { plantId: 'onion', x: 2, y: 0 },
      { plantId: 'onion', x: 3, y: 0 },
      { plantId: 'celery', x: 0, y: 1 },
      { plantId: 'celery', x: 1, y: 1 },
      { plantId: 'potato', x: 2, y: 1 },
      { plantId: 'potato', x: 3, y: 1 },
      { plantId: 'tomato', x: 1, y: 2 },
      { plantId: 'leek', x: 2, y: 2 },
      { plantId: 'parsley', x: 0, y: 2 },
      { plantId: 'garlic', x: 3, y: 2 },
    ],
  },
  {
    id: 'pickling',
    name: 'Pickling Garden',
    description: 'Everything you need for homemade pickles - cucumbers, dill, and more',
    emoji: '🥒',
    color: '#14b8a6',
    gridSize: 4,
    plants: [
      { plantId: 'cucumber', x: 0, y: 0 },
      { plantId: 'cucumber', x: 1, y: 0 },
      { plantId: 'cucumber', x: 2, y: 0 },
      { plantId: 'dill', x: 3, y: 0 },
      { plantId: 'dill', x: 0, y: 1 },
      { plantId: 'onion', x: 1, y: 1 },
      { plantId: 'onion', x: 2, y: 1 },
      { plantId: 'garlic', x: 3, y: 1 },
      { plantId: 'garlic', x: 0, y: 2 },
      { plantId: 'mustard-greens', x: 1, y: 2 },
      { plantId: 'beet', x: 2, y: 2 },
      { plantId: 'beet', x: 3, y: 2 },
    ],
  },
  {
    id: 'asian',
    name: 'Asian Garden',
    description: 'Ingredients for Asian cuisine - bok choy, ginger, lemongrass, and more',
    emoji: '🥡',
    color: '#ec4899',
    gridSize: 4,
    plants: [
      { plantId: 'bok-choy', x: 0, y: 0 },
      { plantId: 'bok-choy', x: 1, y: 0 },
      { plantId: 'pepper', x: 2, y: 0 },
      { plantId: 'pepper', x: 3, y: 0 },
      { plantId: 'basil', x: 0, y: 1 },
      { plantId: 'basil', x: 1, y: 1 },
      { plantId: 'cilantro', x: 2, y: 1 },
      { plantId: 'cilantro', x: 3, y: 1 },
      { plantId: 'carrot', x: 0, y: 2 },
      { plantId: 'carrot', x: 1, y: 2 },
      { plantId: 'onion', x: 2, y: 2 },
      { plantId: 'onion', x: 3, y: 2 },
    ],
  },
  {
    id: 'square-foot',
    name: 'Square Foot Garden',
    description: 'Optimized square foot gardening layout with intensive planting',
    emoji: '📐',
    color: '#06b6d4',
    gridSize: 4,
    plants: [
      { plantId: 'tomato', x: 0, y: 0 },
      { plantId: 'tomato', x: 1, y: 0 },
      { plantId: 'carrot', x: 2, y: 0 },
      { plantId: 'carrot', x: 2, y: 1 },
      { plantId: 'onion', x: 3, y: 0 },
      { plantId: 'onion', x: 3, y: 1 },
      { plantId: 'lettuce', x: 0, y: 1 },
      { plantId: 'lettuce', x: 0, y: 2 },
      { plantId: 'radish', x: 1, y: 1 },
      { plantId: 'radish', x: 1, y: 2 },
      { plantId: 'spinach', x: 2, y: 2 },
      { plantId: 'spinach', x: 2, y: 3 },
      { plantId: 'beet', x: 3, y: 2 },
      { plantId: 'beet', x: 3, y: 3 },
      { plantId: 'basil', x: 0, y: 3 },
      { plantId: 'basil', x: 1, y: 3 },
    ],
  },
];

export default function GardenThemes() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<GardenTheme | null>(null);
  const { 
    setGardenName, 
    setGridSize, 
    setPlacedPlants, 
    clearGarden,
    gardenName 
  } = useGardenStore();

  const handleApplyTheme = (theme: GardenTheme) => {
    setSelectedTheme(theme);
  };

  const confirmApplyTheme = () => {
    if (!selectedTheme) return;
    
    // Clear current garden
    clearGarden();
    
    // Apply theme settings
    setGardenName(`${selectedTheme.name} Garden`);
    setGridSize(selectedTheme.gridSize);
    
    // Place plants with unique IDs
    const newPlants = selectedTheme.plants.map((p, index) => ({
      id: `theme-plant-${Date.now()}-${index}`,
      plantId: p.plantId,
      x: p.x,
      y: p.y,
      plantedAt: new Date().toISOString(),
      stage: 'seedling' as const,
    }));
    
    setPlacedPlants(newPlants);
    setIsOpen(false);
    setSelectedTheme(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
      >
        <span>🎨</span>
        <span>Garden Themes</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden relative">
            {/* Close button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedTheme(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
            >
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <span className="text-3xl">🎨</span>
                Garden Themes
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Choose a pre-designed garden layout to get started quickly!
              </p>
            </div>

            {/* Theme Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gardenThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleApplyTheme(theme)}
                    className={`p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                      selectedTheme?.id === theme.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{theme.emoji}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">{theme.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{theme.gridSize}×{theme.gridSize} grid</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{theme.description}</p>
                    
                    {/* Plant preview */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {theme.plants.slice(0, 6).map((p, i) => {
                        const plant = getPlantById(p.plantId);
                        return plant ? (
                          <span key={i} className="text-lg" title={plant.name}>{plant.emoji}</span>
                        ) : null;
                      })}
                      {theme.plants.length > 6 && (
                        <span className="text-xs text-gray-400 self-center">+{theme.plants.length - 6} more</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedTheme(null);
                }}
                className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApplyTheme}
                disabled={!selectedTheme}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedTheme
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
