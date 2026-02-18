export type SoilType = 'clay' | 'sandy' | 'loamy' | 'silty' | 'peaty' | 'chalky';

export interface SoilInfo {
  type: SoilType;
  name: string;
  description: string;
  color: string;
  tips: string[];
  improvements: string[];
}

export const soilTypes: Record<SoilType, SoilInfo> = {
  clay: {
    type: 'clay',
    name: 'Clay Soil',
    description: 'Heavy, nutrient-rich soil that holds water well but drains slowly',
    color: '#b5651d',
    tips: [
      'Great for broccoli, Brussels sprouts, and cabbage',
      'Avoid root vegetables like carrots - they struggle to push through',
      'Work in organic matter to improve drainage',
      'Avoid walking on clay soil when wet - it compacts easily',
    ],
    improvements: [
      'Add compost or well-rotted manure',
      'Use raised beds for better drainage',
      'Add grit or sand to improve structure',
    ],
  },
  sandy: {
    type: 'sandy',
    name: 'Sandy Soil',
    description: 'Light, free-draining soil that warms up quickly in spring',
    color: '#d4a373',
    tips: [
      'Perfect for carrots, potatoes, and lettuce',
      'Water more frequently - sandy soil dries fast',
      'Mulch heavily to retain moisture',
      'Feed plants more often - nutrients wash away',
    ],
    improvements: [
      'Add organic matter to retain water',
      'Use mulch to prevent drying',
      'Consider drip irrigation',
    ],
  },
  loamy: {
    type: 'loamy',
    name: 'Loamy Soil',
    description: 'The gardener\'s gold! Balanced texture with good drainage and nutrients',
    color: '#7c5e3c',
    tips: [
      'Perfect for almost all vegetables and fruits',
      'The ideal garden soil - maintain with compost',
      'Great for tomatoes, peppers, and beans',
      'Easy to work with in any season',
    ],
    improvements: [
      'Add compost annually',
      'Rotate crops to maintain fertility',
      'Avoid compacting by using raised beds',
    ],
  },
  silty: {
    type: 'silty',
    name: 'Silty Soil',
    description: 'Smooth, slippery soil that holds moisture well',
    color: '#9c8b7a',
    tips: [
      'Great for moisture-loving plants like squash and cucumbers',
      'Can become compacted - avoid walking on it',
      'Good for willow, birch, and shrub planting',
      'Add organic matter to improve structure',
    ],
    improvements: [
      'Add compost to improve structure',
      'Use cover crops to prevent erosion',
      'Avoid working when wet',
    ],
  },
  peaty: {
    type: 'peaty',
    name: 'Peaty Soil',
    description: 'Dark, spongy soil that\'s naturally acidic',
    color: '#3d2914',
    tips: [
      'Great for acid-loving plants like blueberries',
      'Can be soggy - consider drainage improvements',
      'Contains few nutrients - regular feeding needed',
      'Ideal for ericaceous plants',
    ],
    improvements: [
      'Add lime to reduce acidity if needed',
      'Improve drainage with raised beds',
      'Mix with other soil types',
    ],
  },
  chalky: {
    type: 'chalky',
    name: 'Chalky Soil',
    description: 'Alkaline soil with calcium carbonate - free draining but can be shallow',
    color: '#e8dcc4',
    tips: [
      'Great for spinach, beets, and sweet corn',
      'Avoid acid-loving plants like blueberries',
      'May need regular iron and manganese supplements',
      'Dig deep - chalky soil can be shallow',
    ],
    improvements: [
      'Add organic matter to retain moisture',
      'Use iron sulfate for chlorosis',
      'Dig in mulch annually',
    ],
  },
};

export function getSoilRecommendations(soilType: SoilType): string[] {
  return soilTypes[soilType]?.tips || [];
}
