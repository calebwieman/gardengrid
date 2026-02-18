// Watering needs for different plants (inches per week)
export interface WateringNeeds {
  minInches: number;
  maxInches: number;
  frequency: 'daily' | '2-3x/week' | '1-2x/week' | 'weekly';
  notes: string;
}

export const wateringNeeds: Record<string, WateringNeeds> = {
  // Vegetables
  tomato: { minInches: 1, maxInches: 2, frequency: 'daily', notes: 'Consistent moisture prevents blossom end rot' },
  pepper: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Keep soil consistently moist' },
  cucumber: { minInches: 1, maxInches: 2, frequency: 'daily', notes: 'High water needs, especially when fruiting' },
  zucchini: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Water at base to prevent powdery mildew' },
  lettuce: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Keep consistently moist for tender leaves' },
  spinach: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Bolts in heat - keep shaded in summer' },
  kale: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Drought tolerant once established' },
  broccoli: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Consistent moisture for head development' },
  cabbage: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Water regularly for tight heads' },
  carrot: { minInches: 1, maxInches: 1, frequency: '2-3x/week', notes: 'Shallow, frequent watering for roots' },
  beet: { minInches: 1, maxInches: 1, frequency: '2-3x/week', notes: 'Even moisture for tender roots' },
  onion: { minInches: 0.5, maxInches: 1, frequency: '1-2x/week', notes: 'Reduce watering as bulbs mature' },
  garlic: { minInches: 0.5, maxInches: 1, frequency: '1-2x/week', notes: 'Stop watering a month before harvest' },
  potato: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Consistent water for good tuber development' },
  corn: { minInches: 1, maxInches: 2, frequency: '2-3x/week', notes: 'Water deeply during tasseling' },
  beans: { minInches: 1, maxInches: 1, frequency: '2-3x/week', notes: 'Avoid overhead watering' },
  peas: { minInches: 1, maxInches: 1, frequency: '2-3x/week', notes: 'Keep moist, not waterlogged' },
  eggplant: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Deep watering preferred' },
  squash: { minInches: 1, maxInches: 2, frequency: '2-3x/week', notes: 'Large leaves transpire quickly' },
  pumpkin: { minInches: 1, maxInches: 2, frequency: '2-3x/week', notes: 'Deep weekly watering preferred' },
  // Herbs
  basil: { minInches: 1, maxInches: 1.5, frequency: 'daily', notes: 'Loves water, keep soil moist' },
  mint: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Can handle some neglect' },
  parsley: { minInches: 1, maxInches: 1, frequency: '2-3x/week', notes: 'Keep consistently moist' },
  cilantro: { minInches: 1, maxInches: 1, frequency: '2-3x/week', notes: 'Bolts quickly - provide shade' },
  dill: { minInches: 0.5, maxInches: 1, frequency: '1-2x/week', notes: 'Drought tolerant herb' },
  rosemary: { minInches: 0.5, maxInches: 1, frequency: 'weekly', notes: 'Prefers dry conditions' },
  thyme: { minInches: 0.5, maxInches: 1, frequency: 'weekly', notes: 'Very drought tolerant' },
  oregano: { minInches: 0.5, maxInches: 1, frequency: 'weekly', notes: 'Prefers dry conditions' },
  sage: { minInches: 0.5, maxInches: 1, frequency: 'weekly', notes: 'Drought tolerant once established' },
  chives: { minInches: 1, maxInches: 1, frequency: '1-2x/week', notes: 'Moderate water needs' },
  // Fruits
  strawberry: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Consistent moisture for berries' },
  watermelon: { minInches: 1, maxInches: 2, frequency: '2-3x/week', notes: 'Deep watering for large fruits' },
  cantaloupe: { minInches: 1, maxInches: 2, frequency: '2-3x/week', notes: 'Reduce water near harvest' },
  blueberry: { minInches: 1, maxInches: 2, frequency: '2-3x/week', notes: 'Acid-loving, consistent moisture' },
  raspberry: { minInches: 1, maxInches: 1.5, frequency: '2-3x/week', notes: 'Keep soil moist not soggy' },
  // Flowers
  sunflower: { minInches: 1, maxInches: 1, frequency: '1-2x/week', notes: 'Drought tolerant once established' },
  marigold: { minInches: 1, maxInches: 1, frequency: '1-2x/week', notes: 'Drought tolerant' },
  zinnia: { minInches: 1, maxInches: 1, frequency: '1-2x/week', notes: 'Allow soil to dry between watering' },
};

export function getWateringNeeds(plantId: string): WateringNeeds | null {
  return wateringNeeds[plantId] || null;
}

export function calculateGardenWatering(plantIds: string[]): { avgInches: number; frequency: string; tips: string[] } {
  const needs = plantIds.map(id => getWateringNeeds(id)).filter(Boolean) as WateringNeeds[];
  
  if (needs.length === 0) {
    return {
      avgInches: 1,
      frequency: '1-2x/week',
      tips: ['Check soil moisture before watering', 'Water in the morning to reduce evaporation'],
    };
  }
  
  const avgMin = needs.reduce((sum, n) => sum + n.minInches, 0) / needs.length;
  const avgMax = needs.reduce((sum, n) => sum + n.maxInches, 0) / needs.length;
  
  // Find most common frequency
  const freqCounts: Record<string, number> = {};
  needs.forEach(n => {
    freqCounts[n.frequency] = (freqCounts[n.frequency] || 0) + 1;
  });
  const frequency = Object.entries(freqCounts).sort((a, b) => b[1] - a[1])[0][0];
  
  const tips = [
    `Water most plants ${frequency}`,
    'Check soil moisture 1-2 inches deep before watering',
    'Water at base of plants to prevent leaf diseases',
    'Morning watering is best - reduces evaporation and fungal growth',
  ];
  
  return {
    avgInches: (avgMin + avgMax) / 2,
    frequency,
    tips,
  };
}
