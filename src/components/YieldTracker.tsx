'use client';

import { useState, useMemo, useEffect } from 'react';
import { useGardenStore, PlacedPlant } from '@/stores/gardenStore';
import { plants, getPlantById, Plant } from '@/lib/plants';

interface HarvestLog {
  id: string;
  plantId: string;
  x: number;
  y: number;
  quantity: number;
  unit: string;
  date: string;
  notes: string;
  rating?: number; // 1-5
}

interface YieldExpectation {
  plantId: string;
  expectedYield: number;
  unit: string;
}

// Default yields per plant (in lbs per plant, approximate)
const defaultYields: Record<string, { yield: number; unit: string }> = {
  tomato: { yield: 10, unit: 'lbs' },
  pepper: { yield: 5, unit: 'lbs' },
  cucumber: { yield: 8, unit: 'lbs' },
  zucchini: { yield: 8, unit: 'lbs' },
  squash: { yield: 6, unit: 'lbs' },
  lettuce: { yield: 0.5, unit: 'lbs' },
  spinach: { yield: 0.3, unit: 'lbs' },
  kale: { yield: 1, unit: 'lbs' },
  carrot: { yield: 0.25, unit: 'lbs' },
  onion: { yield: 0.3, unit: 'lbs' },
  garlic: { yield: 0.1, unit: 'lbs' },
  potato: { yield: 2, unit: 'lbs' },
  corn: { yield: 2, unit: 'ears' },
  bean: { yield: 0.5, unit: 'lbs' },
  pea: { yield: 0.3, unit: 'lbs' },
  broccoli: { yield: 1, unit: 'lbs' },
  cauliflower: { yield: 1.5, unit: 'lbs' },
  cabbage: { yield: 2, unit: 'lbs' },
  beet: { yield: 0.25, unit: 'lbs' },
  radish: { yield: 0.1, unit: 'lbs' },
  celery: { yield: 1, unit: 'lbs' },
  asparagus: { yield: 0.5, unit: 'lbs' },
  eggplant: { yield: 4, unit: 'lbs' },
  pumpkin: { yield: 15, unit: 'lbs' },
  melon: { yield: 8, unit: 'lbs' },
  watermelon: { yield: 20, unit: 'lbs' },
  strawberry: { yield: 1, unit: 'lbs' },
  blueberry: { yield: 2, unit: 'lbs' },
  raspberry: { yield: 2, unit: 'lbs' },
  basil: { yield: 0.25, unit: 'lbs' },
  cilantro: { yield: 0.1, unit: 'lbs' },
  parsley: { yield: 0.2, unit: 'lbs' },
  mint: { yield: 0.5, unit: 'lbs' },
  rosemary: { yield: 0.3, unit: 'lbs' },
  thyme: { yield: 0.2, unit: 'lbs' },
};

function getDefaultYield(plantId: string): { yield: number; unit: string } {
  return defaultYields[plantId] || { yield: 1, unit: 'lbs' };
}

export default function YieldTracker() {
  const { placedPlants, zone } = useGardenStore();
  const [activeTab, setActiveTab] = useState<'expectations' | 'harvests' | 'summary'>('expectations');
  const [harvestLogs, setHarvestLogs] = useState<HarvestLog[]>([]);
  const [yieldExpectations, setYieldExpectations] = useState<YieldExpectation[]>([]);
  const [showAddHarvest, setShowAddHarvest] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<HarvestLog | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Set client flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLogs = localStorage.getItem('gardenHarvestLogs');
    const savedExpectations = localStorage.getItem('gardenYieldExpectations');
    if (savedLogs) setHarvestLogs(JSON.parse(savedLogs));
    if (savedExpectations) setYieldExpectations(JSON.parse(savedExpectations));
  }, []);
  
  // Save to localStorage when changed
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    if (harvestLogs.length > 0) {
      localStorage.setItem('gardenHarvestLogs', JSON.stringify(harvestLogs));
    }
  }, [harvestLogs, isClient]);
  
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    if (yieldExpectations.length > 0) {
      localStorage.setItem('gardenYieldExpectations', JSON.stringify(yieldExpectations));
    }
  }, [yieldExpectations, isClient]);
  
  // Get placed plants with their data
  const placedPlantsWithData = useMemo(() => {
    return placedPlants.map(p => ({
      ...p,
      plantData: getPlantById(p.plantId),
    })).filter(p => p.plantData) as (PlacedPlant & { plantData: Plant })[];
  }, [placedPlants]);
  
  // Get unique plants in garden
  const uniquePlants = useMemo(() => {
    const seen = new Set<string>();
    return placedPlantsWithData.filter(p => {
      if (seen.has(p.plantId)) return false;
      seen.add(p.plantId);
      return true;
    });
  }, [placedPlantsWithData]);
  
  // Calculate totals
  const totals = useMemo(() => {
    const plantYields: Record<string, { actual: number; expected: number; unit: string; plantName: string; emoji: string }> = {};
    
    // Initialize with expectations
    yieldExpectations.forEach(exp => {
      const plant = getPlantById(exp.plantId);
      if (plant) {
        const count = placedPlants.filter(p => p.plantId === exp.plantId).length;
        plantYields[exp.plantId] = {
          actual: 0,
          expected: exp.expectedYield * count,
          unit: exp.unit,
          plantName: plant.name,
          emoji: plant.emoji,
        };
      }
    });
    
    // Add actual harvests
    harvestLogs.forEach(log => {
      if (plantYields[log.plantId]) {
        plantYields[log.plantId].actual += log.quantity;
      } else {
        const plant = getPlantById(log.plantId);
        if (plant) {
          plantYields[log.plantId] = {
            actual: log.quantity,
            expected: 0,
            unit: log.unit,
            plantName: plant.name,
            emoji: plant.emoji,
          };
        }
      }
    });
    
    // Add plants with harvests but no expectations
    harvestLogs.forEach(log => {
      if (!plantYields[log.plantId]) {
        const plant = getPlantById(log.plantId);
        if (plant) {
          const defaultYield = getDefaultYield(log.plantId);
          const count = placedPlants.filter(p => p.plantId === log.plantId).length;
          plantYields[log.plantId] = {
            actual: log.quantity,
            expected: defaultYield.yield * count,
            unit: log.unit,
            plantName: plant.name,
            emoji: plant.emoji,
          };
        }
      }
    });
    
    return plantYields;
  }, [harvestLogs, yieldExpectations, placedPlants]);
  
  const totalExpected = Object.values(totals).reduce((sum, t) => sum + t.expected, 0);
  const totalActual = Object.values(totals).reduce((sum, t) => sum + t.actual, 0);
  
  // Handle adding a new harvest
  const handleAddHarvest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newHarvest: HarvestLog = {
      id: Date.now().toString(),
      plantId: formData.get('plantId') as string,
      x: parseInt(formData.get('x') as string) || 0,
      y: parseInt(formData.get('y') as string) || 0,
      quantity: parseFloat(formData.get('quantity') as string) || 0,
      unit: formData.get('unit') as string,
      date: formData.get('date') as string,
      notes: formData.get('notes') as string,
      rating: formData.get('rating') ? parseInt(formData.get('rating') as string) : undefined,
    };
    
    setHarvestLogs([...harvestLogs, newHarvest]);
    setShowAddHarvest(false);
  };
  
  // Handle editing a harvest
  const handleEditHarvest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingHarvest) return;
    
    const formData = new FormData(e.currentTarget);
    const updatedHarvest: HarvestLog = {
      ...editingHarvest,
      plantId: formData.get('plantId') as string,
      x: parseInt(formData.get('x') as string) || 0,
      y: parseInt(formData.get('y') as string) || 0,
      quantity: parseFloat(formData.get('quantity') as string) || 0,
      unit: formData.get('unit') as string,
      date: formData.get('date') as string,
      notes: formData.get('notes') as string,
      rating: formData.get('rating') ? parseInt(formData.get('rating') as string) : undefined,
    };
    
    setHarvestLogs(harvestLogs.map(h => h.id === editingHarvest.id ? updatedHarvest : h));
    setEditingHarvest(null);
  };
  
  // Delete harvest
  const handleDeleteHarvest = (id: string) => {
    setHarvestLogs(harvestLogs.filter(h => h.id !== id));
  };
  
  // Set expectation for a plant
  const handleSetExpectation = (plantId: string, yieldValue: number, unit: string) => {
    const existing = yieldExpectations.find(e => e.plantId === plantId);
    if (existing) {
      setYieldExpectations(yieldExpectations.map(e => 
        e.plantId === plantId ? { ...e, expectedYield: yieldValue, unit } : e
      ));
    } else {
      setYieldExpectations([...yieldExpectations, { plantId, expectedYield: yieldValue, unit }]);
    }
  };
  
  // Sort harvests by date (newest first)
  const sortedHarvests = [...harvestLogs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🌾 Yield Tracker</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track expected yields vs actual harvests</p>
        </div>
        <button
          onClick={() => setShowAddHarvest(true)}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>📝</span> Log Harvest
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'expectations', label: '📊 Expectations', count: uniquePlants.length },
          { id: 'harvests', label: '🧺 Harvests', count: harvestLogs.length },
          { id: 'summary', label: '📈 Summary', count: null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
      
      {/* Expectations Tab */}
      {activeTab === 'expectations' && (
        <div className="space-y-4">
          {uniquePlants.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-4xl mb-4">🪴</p>
              <p>Add plants to your garden first to set yield expectations</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {uniquePlants.map(({ plantData, x, y }) => {
                const expectation = yieldExpectations.find(e => e.plantId === plantData.id);
                const defaultYield = getDefaultYield(plantData.id);
                const plantCount = placedPlants.filter(p => p.plantId === plantData.id).length;
                const totalExpectedYield = (expectation?.expectedYield || defaultYield.yield) * plantCount;
                
                return (
                  <div key={`${plantData.id}-${x}-${y}`} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{plantData.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{plantData.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {plantCount} plant{plantCount > 1 ? 's' : ''} in garden
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        defaultValue={expectation?.expectedYield || defaultYield.yield}
                        onBlur={(e) => handleSetExpectation(plantData.id, parseFloat(e.target.value) || defaultYield.yield, expectation?.unit || defaultYield.unit)}
                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                        placeholder="Yield"
                      />
                      <span className="text-gray-600 dark:text-gray-300">{expectation?.unit || defaultYield.unit}</span>
                      <span className="text-gray-400 dark:text-gray-500">per plant</span>
                      <span className="ml-auto font-semibold text-green-600 dark:text-green-400">
                        = {totalExpectedYield.toFixed(1)} {expectation?.unit || defaultYield.unit} expected
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Harvests Tab */}
      {activeTab === 'harvests' && (
        <div className="space-y-4">
          {harvestLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-4xl mb-4">🧺</p>
              <p>No harvests logged yet</p>
              <p className="text-sm mt-2">Click "Log Harvest" to record your first harvest!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedHarvests.map(harvest => {
                const plant = getPlantById(harvest.plantId);
                if (!plant) return null;
                
                return (
                  <div key={harvest.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-4">
                    <span className="text-3xl">{plant.emoji}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{plant.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(harvest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {harvest.notes && ` • ${harvest.notes}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {harvest.quantity} {harvest.unit}
                      </p>
                      {harvest.rating && (
                        <div className="text-yellow-500 text-sm">
                          {'★'.repeat(harvest.rating)}{'☆'.repeat(5 - harvest.rating)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingHarvest(harvest)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteHarvest(harvest.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalExpected.toFixed(1)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Expected Total (lbs)</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalActual.toFixed(1)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Harvested Total (lbs)</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">of Goal Achieved</p>
            </div>
          </div>
          
          {/* Per-Plant Breakdown */}
          {Object.keys(totals).length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📊 Yield by Plant</h3>
              <div className="space-y-3">
                {Object.entries(totals).map(([plantId, data]) => {
                  const progress = data.expected > 0 ? Math.min((data.actual / data.expected) * 100, 100) : 0;
                  const isOver = data.actual > data.expected;
                  
                  return (
                    <div key={plantId} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{data.emoji}</span>
                        <span className="font-medium text-gray-800 dark:text-white">{data.plantName}</span>
                        <span className="ml-auto text-sm">
                          <span className={isOver ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}>
                            {data.actual.toFixed(1)} {data.unit}
                          </span>
                          <span className="text-gray-400"> / {data.expected.toFixed(1)} {data.unit}</span>
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {Object.keys(totals).length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-4xl mb-4">📈</p>
              <p>Set yield expectations and log harvests to see your garden statistics</p>
            </div>
          )}
        </div>
      )}
      
      {/* Add Harvest Modal */}
      {showAddHarvest && (
        <div className="fixed inset-0 bg items-center justify-center z-50 p-black/50 flex-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">🌾 Log Harvest</h3>
            <form onSubmit={handleAddHarvest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plant</label>
                <select
                  name="plantId"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a plant...</option>
                  {uniquePlants.map(({ plantData }) => (
                    <option key={plantData.id} value={plantData.id}>
                      {plantData.emoji} {plantData.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    step="0.1"
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <select
                    name="unit"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                    <option value="oz">oz</option>
                    <option value="ears">ears</option>
                    <option value="bunches">bunches</option>
                    <option value="pieces">pieces</option>
                    <option value="cups">cups</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                <textarea
                  name="notes"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="How did it taste? Any issues?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={(e) => {
                        const form = e.currentTarget.closest('form');
                        const input = form?.querySelector('input[name="rating"]') as HTMLInputElement;
                        if (input) input.value = star.toString();
                      }}
                      className="text-2xl hover:scale-110 transition-transform"
                    >
                      ⭐
                    </button>
                  ))}
                  <input type="hidden" name="rating" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddHarvest(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Save Harvest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Harvest Modal */}
      {editingHarvest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">✏️ Edit Harvest</h3>
            <form onSubmit={handleEditHarvest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plant</label>
                <select
                  name="plantId"
                  required
                  defaultValue={editingHarvest.plantId}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a plant...</option>
                  {uniquePlants.map(({ plantData }) => (
                    <option key={plantData.id} value={plantData.id}>
                      {plantData.emoji} {plantData.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    step="0.1"
                    min="0"
                    required
                    defaultValue={editingHarvest.quantity}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <select
                    name="unit"
                    defaultValue={editingHarvest.unit}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                    <option value="oz">oz</option>
                    <option value="ears">ears</option>
                    <option value="bunches">bunches</option>
                    <option value="pieces">pieces</option>
                    <option value="cups">cups</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={editingHarvest.date}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingHarvest.notes}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingHarvest(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
