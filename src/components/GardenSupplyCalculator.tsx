'use client';

import { useState, useMemo } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { plants, getPlantById } from '@/lib/plants';

interface SupplyItem {
  id: string;
  name: string;
  emoji: string;
  category: 'seeds' | 'soil' | 'fertilizer' | 'mulch' | 'supplies';
  unit: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

interface CustomPrice {
  itemId: string;
  price: number;
}

const DEFAULT_PRICES: Record<string, number> = {
  seeds: 3.99,      // Per packet
  soil: 4.99,      // Per cubic foot
  fertilizer: 12.99, // Per 5lb bag
  mulch: 3.99,     // Per cubic foot
  supplies: 8.99,  // Misc supplies average
};

const AVERAGE_COVERAGE: Record<string, number> = {
  soil: 1,        // cubic feet per plant (generous estimate)
  fertilizer: 0.1, // lbs per plant
  mulch: 0.25,    // cubic feet per plant
};

export default function GardenSupplyCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const { placedPlants, gridSize } = useGardenStore();

  const supplyItems = useMemo(() => {
    const items: SupplyItem[] = [];
    const plantCounts: Record<string, number> = {};
    
    // Count plants
    placedPlants.forEach(p => {
      plantCounts[p.plantId] = (plantCounts[p.plantId] || 0) + 1;
    });

    // Calculate total garden area
    const totalSqFt = gridSize * gridSize;
    
    // Seed packets needed (1 packet per plant type, assumes ~25 seeds per packet)
    Object.entries(plantCounts).forEach(([plantId, count]) => {
      const plant = getPlantById(plantId);
      if (plant) {
        // Calculate packets needed (round up)
        const packets = Math.ceil(count / 25);
        items.push({
          id: `seeds-${plantId}`,
          name: `${plant.name} Seeds`,
          emoji: plant.emoji,
          category: 'seeds',
          unit: 'packet',
          quantity: packets,
          unitPrice: customPrices.seeds || DEFAULT_PRICES.seeds,
          notes: `~${Math.ceil(count / 25) * 25} seeds (${count} plants)`,
        });
      }
    });

    // Soil calculation (estimate 0.5 cubic ft per sq ft for 6" depth)
    const soilCubicFt = totalSqFt * 0.5;
    if (soilCubicFt > 0) {
      items.push({
        id: 'soil',
        name: 'Garden Soil',
        emoji: '🪴',
        category: 'soil',
        unit: 'cubic ft',
        quantity: Math.round(soilCubicFt * 10) / 10,
        unitPrice: customPrices.soil || DEFAULT_PRICES.soil,
        notes: `For 6" depth across ${gridSize}x${gridSize} garden`,
      });
    }

    // Fertilizer (estimate 0.1 lb per sq ft)
    const fertilizerLbs = totalSqFt * 0.1;
    if (fertilizerLbs > 0) {
      items.push({
        id: 'fertilizer',
        name: 'All-Purpose Fertilizer',
        emoji: '🧪',
        category: 'fertilizer',
        unit: 'lbs',
        quantity: Math.round(fertilizerLbs * 10) / 10,
        unitPrice: customPrices.fertilizer || DEFAULT_PRICES.fertilizer,
        notes: 'Organic all-purpose (NPK balanced)',
      });
    }

    // Mulch (estimate 3" depth = 0.25 cubic ft per sq ft)
    const mulchCubicFt = totalSqFt * 0.25;
    if (mulchCubicFt > 0) {
      items.push({
        id: 'mulch',
        name: 'Organic Mulch',
        emoji: '🍂',
        category: 'mulch',
        unit: 'cubic ft',
        quantity: Math.round(mulchCubicFt * 10) / 10,
        unitPrice: customPrices.mulch || DEFAULT_PRICES.mulch,
        notes: `For 3" depth around plants`,
      });
    }

    // Basic supplies
    const supplyItems = [
      { id: 'gloves', name: 'Gardening Gloves', emoji: '🧤', quantity: 1, unit: 'pair' },
      { id: 'trowel', name: 'Hand Trowel', emoji: '🥄', quantity: 1, unit: 'piece' },
      { id: 'watering', name: 'Watering Can (2gal)', emoji: '🚿', quantity: 1, unit: 'piece' },
      { id: 'labels', name: 'Plant Labels', emoji: '🏷️', quantity: Math.max(1, Object.keys(plantCounts).length), unit: 'pack' },
    ];

    supplyItems.forEach(item => {
      items.push({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        category: 'supplies',
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: DEFAULT_PRICES.supplies,
        notes: '',
      });
    });

    return items;
  }, [placedPlants, gridSize, customPrices]);

  const totalCost = useMemo(() => {
    return supplyItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [supplyItems]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    supplyItems.forEach(item => {
      totals[item.category] = (totals[item.category] || 0) + (item.quantity * item.unitPrice);
    });
    return totals;
  }, [supplyItems]);

  const handlePriceChange = (itemId: string, price: string) => {
    const numPrice = parseFloat(price) || 0;
    setCustomPrices(prev => ({ ...prev, [itemId]: numPrice }));
  };

  const totalPlants = placedPlants.length;
  const uniquePlants = new Set(placedPlants.map(p => p.plantId)).size;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
      >
        <span>🧮</span>
        <span className="font-medium">Supply Calculator</span>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧮</span>
            <div>
              <h3 className="font-bold text-lg">Garden Supply Calculator</h3>
              <p className="text-xs text-white/80">Estimate costs for your garden</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{totalPlants}</p>
          <p className="text-xs text-gray-500">Plants</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{uniquePlants}</p>
          <p className="text-xs text-gray-500">Varieties</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-600">${totalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Est. Total</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="px-4 py-3 flex flex-wrap gap-2">
        {Object.entries(categoryTotals).map(([cat, total]) => (
          <span key={cat} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium capitalize">
            {cat}: ${total.toFixed(2)}
          </span>
        ))}
      </div>

      {/* Supply List */}
      <div className="max-h-80 overflow-y-auto p-4 space-y-3">
        {supplyItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl">🌱</span>
            <p className="mt-2">Place some plants in your garden to see supply estimates</p>
          </div>
        ) : (
          supplyItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">{item.notes || `${item.quantity} ${item.unit}${item.quantity !== 1 ? 's' : ''}`}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800 dark:text-gray-200">${(item.quantity * item.unitPrice).toFixed(2)}</p>
                {item.category !== 'supplies' && (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={`$${item.unitPrice.toFixed(2)}`}
                    onChange={(e) => handlePriceChange(item.category, e.target.value)}
                    className="w-20 text-xs px-2 py-1 mt-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total & Tips */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-gray-700 dark:text-gray-300">Estimated Total</span>
          <span className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</span>
        </div>
        
        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-sm">
          <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">💡 Budget Tips</p>
          <ul className="text-blue-700 dark:text-blue-400 text-xs space-y-1">
            <li>• Buy seeds in late winter for best selection</li>
            <li>• Start seeds indoors to save money</li>
            <li>• Compare prices at local nurseries vs. big box stores</li>
            <li>• Consider splitting seed packets with friends</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
