'use client';

import { useMemo } from 'react';
import { PlacedPlant } from '@/stores/gardenStore';
import { getPlantById } from '@/lib/plants';

const tips = [
  { keywords: ['tomato'], tip: '🍅 Tomatoes need consistent watering - aim for 1-2 inches per week!' },
  { keywords: ['basil'], tip: '🌿 Basil loves heat - wait until nights are above 50°F to transplant.' },
  { keywords: ['lettuce'], tip: '🥬 Lettuce prefers cool weather - plant in spring or fall for best results.' },
  { keywords: ['pepper'], tip: '🫑 Peppers need phosphorus - add compost for bigger harvests!' },
  { keywords: ['carrot'], tip: '🥕 Carrots need loose soil - remove rocks for straight roots.' },
  { keywords: ['onion'], tip: '🧅 Onions are heavy feeders - add nitrogen-rich fertilizer monthly.' },
  { keywords: ['corn'], tip: '🌽 Plant corn in blocks - rows pollinate better for full ears!' },
  { keywords: ['bean'], tip: '🫘 Beans fix nitrogen - great to plant after heavy feeders like corn.' },
  { keywords: ['cucumber'], tip: '🥒 Cucumbers are 95% water - keep soil consistently moist!' },
  { keywords: ['strawberry'], tip: '🍓 Strawberries need 6-8 hours of sun - more sun = sweeter berries!' },
];

export default function GardenTips({ placedPlants }: { placedPlants: PlacedPlant[] }) {
  const relevantTips = useMemo(() => {
    const plantIds = placedPlants.map(p => p.plantId);
    const found: string[] = [];
    
    tips.forEach(t => {
      if (t.keywords.some(k => plantIds.includes(k))) {
        found.push(t.tip);
      }
    });
    
    return found.slice(0, 3); // Max 3 tips
  }, [placedPlants]);
  
  if (relevantTips.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 p-4 mt-4">
      <h3 className="font-semibold text-amber-800 mb-2">💡 Growing Tips</h3>
      <ul className="space-y-2">
        {relevantTips.map((tip, i) => (
          <li key={i} className="text-sm text-amber-700">{tip}</li>
        ))}
      </ul>
    </div>
  );
}
