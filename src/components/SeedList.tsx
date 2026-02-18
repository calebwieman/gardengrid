'use client';

import { useMemo } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { getPlantById, Plant } from '@/lib/plants';

interface SeedItem {
  plant: Plant;
  count: number;
  type: 'seed' | 'seedling' | 'both';
}

export default function SeedList() {
  const { placedPlants, zone } = useGardenStore();
  
  const seedList = useMemo(() => {
    const plantCounts: Record<string, number> = {};
    
    // Count each plant type in the garden
    placedPlants.forEach(p => {
      plantCounts[p.plantId] = (plantCounts[p.plantId] || 0) + 1;
    });
    
    // Convert to seed items
    const items: SeedItem[] = Object.entries(plantCounts).map(([plantId, count]) => {
      const plant = getPlantById(plantId);
      if (!plant) return null;
      
      // Determine if starting indoors or direct sow
      let type: 'seed' | 'seedling' | 'both' = 'seed';
      if (plant.startIndoorsWeeks > 0) {
        if (plant.transplantWeeks === 0) {
          type = 'seed'; // Start indoors, transplant outside
        } else {
          type = 'seed'; // Start indoors, transplant later
        }
      }
      
      return { plant, count, type };
    }).filter(Boolean) as SeedItem[];
    
    // Sort by category then name
    return items.sort((a, b) => {
      if (a.plant.category !== b.plant.category) {
        const order = { vegetable: 0, herb: 1, fruit: 2 };
        return order[a.plant.category] - order[b.plant.category];
      }
      return a.plant.name.localeCompare(b.plant.name);
    });
  }, [placedPlants]);
  
  // Calculate estimated costs (rough estimates in USD)
  const estimatedCost = useMemo(() => {
    return seedList.reduce((total, item) => {
      // Rough cost per seed packet: $3-5, per seedling: $2-4
      const seedCost = item.count * 3.5;
      return total + seedCost;
    }, 0);
  }, [seedList]);
  
  if (placedPlants.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
        <span>🛒</span> Seed Shopping List
      </h3>
      
      <p className="text-xs text-gray-500 mb-3">
        Based on your {zone ? `Zone ${zone}` : 'garden'} planting
      </p>
      
      {/* Group by category */}
      {(['vegetable', 'herb', 'fruit'] as const).map(category => {
        const categoryItems = seedList.filter(item => item.plant.category === category);
        if (categoryItems.length === 0) return null;
        
        return (
          <div key={category} className="mb-3 last:mb-0">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-1">
              {category === 'vegetable' ? '🥬' : category === 'herb' ? '🌿' : '🍓'} 
              {category}s
            </h4>
            <div className="space-y-1.5">
              {categoryItems.map(item => (
                <div 
                  key={item.plant.id}
                  className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.plant.emoji}</span>
                    <span className="text-gray-700 dark:text-gray-200">{item.plant.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">×{item.count}</span>
                    <span className="text-green-600 font-medium">${(item.count * 3.5).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {/* Total */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300 font-medium">Estimated Total</span>
          <span className="text-xl font-bold text-green-600">${estimatedCost.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          * Prices are estimates; check local nurseries
        </p>
      </div>
      
      {/* Print/Export button */}
      <button
        onClick={() => {
          const printWindow = window.open('', '_blank');
          if (!printWindow) return;
          
          const listHtml = seedList.map(item => 
            `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
              <span>${item.plant.emoji} ${item.plant.name}</span>
              <span>×${item.count}</span>
            </div>`
          ).join('');
          
          printWindow.document.write(`
            <html>
              <head>
                <title>Seed Shopping List - ${new Date().toLocaleDateString()}</title>
                <style>
                  body { font-family: system-ui, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
                  h1 { font-size: 20px; margin-bottom: 10px; }
                  .total { font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 10px; border-top: 2px solid #333; }
                  .note { color: #666; font-size: 12px; margin-top: 10px; }
                </style>
              </head>
              <body>
                <h1>🌱 Seed Shopping List</h1>
                <p>GardenGrid - ${new Date().toLocaleDateString()}</p>
                ${listHtml}
                <div className="total">Estimated: $${estimatedCost.toFixed(2)}</div>
                <p class="note">* Prices are estimates. Check local nurseries for actual costs.</p>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }}
        className="w-full mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        🖨️ Print / Save List
      </button>
    </div>
  );
}
