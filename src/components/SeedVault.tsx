'use client';

import { useState, useEffect } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { plants, Plant } from '@/lib/plants';

export interface SeedEntry {
  id: string;
  plantId: string;
  quantity: number; // in seeds
  purchasedDate: string;
  expirationDate: string;
  notes?: string;
  source?: string; // where bought
}

interface SeedVaultProps {
  onClose?: () => void;
}

export default function SeedVault({ onClose }: SeedVaultProps) {
  const { seedVault, addSeedEntry, updateSeedEntry, removeSeedEntry, zone } = useGardenStore();
  const [selectedPlant, setSelectedPlant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(25);
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'expiring' | 'low'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique plants that can be grown from seed
  const seedablePlants = plants.filter(p => p.sowing !== 'start indoors');

  const filteredSeeds = seedVault.filter(seed => {
    const plant = plants.find(p => p.id === seed.plantId);
    if (!plant) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!plant.name.toLowerCase().includes(query)) return false;
    }
    
    if (filter === 'expiring') {
      const expDate = new Date(seed.expirationDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expDate <= thirtyDaysFromNow;
    }
    
    if (filter === 'low') {
      return seed.quantity <= 10;
    }
    
    return true;
  });

  const expiringSoon = seedVault.filter(seed => {
    const expDate = new Date(seed.expirationDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expDate <= thirtyDaysFromNow;
  });

  const lowStock = seedVault.filter(seed => seed.quantity <= 10);

  const handleAddSeed = () => {
    if (!selectedPlant || quantity <= 0) return;
    
    const newEntry: SeedEntry = {
      id: editingId || `seed-${Date.now()}`,
      plantId: selectedPlant,
      quantity,
      purchasedDate: new Date().toISOString().split('T')[0],
      expirationDate: expirationDate || getDefaultExpiration(selectedPlant),
      notes,
      source
    };

    if (editingId) {
      updateSeedEntry(editingId, newEntry);
    } else {
      addSeedEntry(newEntry);
    }

    // Reset form
    setSelectedPlant('');
    setQuantity(25);
    setExpirationDate('');
    setNotes('');
    setSource('');
    setEditingId(null);
  };

  const getDefaultExpiration = (plantId: string): string => {
    const plant = plants.find(p => p.id === plantId);
    if (!plant) {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 2);
      return date.toISOString().split('T')[0];
    }
    
    // Most seeds last 2-4 years depending on type
    const date = new Date();
    if (plant.category === 'Vegetables') {
      if (['tomato', 'pepper', 'eggplant', 'squash', 'pumpkin', 'cucumber', 'melon'].some(c => plant.id.includes(c))) {
        date.setFullYear(date.getFullYear() + 6);
      } else if (['onion', 'carrot', 'parsley', 'celery'].some(c => plant.id.includes(c))) {
        date.setFullYear(date.getFullYear() + 2);
      } else {
        date.setFullYear(date.getFullYear() + 4);
      }
    } else if (plant.category === 'Herbs') {
      date.setFullYear(date.getFullYear() + 3);
    } else {
      date.setFullYear(date.getFullYear() + 2);
    }
    return date.toISOString().split('T')[0];
  };

  const handleEdit = (seed: SeedEntry) => {
    setSelectedPlant(seed.plantId);
    setQuantity(seed.quantity);
    setExpirationDate(seed.expirationDate);
    setNotes(seed.notes || '');
    setSource(seed.source || '');
    setEditingId(seed.id);
  };

  const isExpired = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  const isExpiringSoon = (dateStr: string) => {
    const expDate = new Date(dateStr);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expDate <= thirtyDaysFromNow && !isExpired(dateStr);
  };

  const totalSeeds = seedVault.reduce((acc, seed) => acc + seed.quantity, 0);
  const totalVarieties = seedVault.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Seed Vault 🗄️</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalVarieties}</div>
          <div className="text-sm text-emerald-700 dark:text-emerald-300">Varieties</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{totalSeeds}</div>
          <div className="text-sm text-amber-700 dark:text-amber-300">Total Seeds</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 rounded-xl p-4 border border-red-100 dark:border-red-800">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">{expiringSoon.length}</div>
          <div className="text-sm text-red-700 dark:text-red-300">Expiring Soon</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{lowStock.length}</div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Low Stock</div>
        </div>
      </div>

      {/* Add/Edit Seed Form */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
          {editingId ? '✏️ Edit Seed Entry' : '➕ Add Seeds to Vault'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Plant Type</label>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select a plant...</option>
              {seedablePlants.map(plant => (
                <option key={plant.id} value={plant.id}>{plant.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expires</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddSeed}
              disabled={!selectedPlant || quantity <= 0}
              className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors text-sm"
            >
              {editingId ? 'Update' : 'Add Seeds'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <input
            type="text"
            placeholder="Source (optional - e.g., local nursery, online)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search seeds..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          {(['all', 'expiring', 'low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'all' ? 'All Seeds' : f === 'expiring' ? '⚠️ Expiring' : '📉 Low Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Seed List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredSeeds.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">🌱</div>
            <p>No seeds in vault yet. Add your first seeds above!</p>
          </div>
        ) : (
          filteredSeeds.map(seed => {
            const plant = plants.find(p => p.id === seed.plantId);
            if (!plant) return null;
            
            const expired = isExpired(seed.expirationDate);
            const expiringSoon = isExpiringSoon(seed.expirationDate);
            const lowStock = seed.quantity <= 10;

            return (
              <div
                key={seed.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  expired 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : expiringSoon
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : lowStock
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-xl">
                    {plant.icon || '🌱'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">{plant.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {seed.quantity} seeds • Expires: {new Date(seed.expirationDate).toLocaleDateString()}
                      {seed.source && ` • ${seed.source}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {expired && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs rounded-full font-medium">
                      Expired
                    </span>
                  )}
                  {expiringSoon && !expired && (
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium">
                      Soon
                    </span>
                  )}
                  {lowStock && !expired && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                      Low
                    </span>
                  )}
                  <button
                    onClick={() => handleEdit(seed)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                    title="Edit"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => removeSeedEntry(seed.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    title="Delete"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">💡 Seed Storage Tips</h4>
        <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1">
          <li>• Store seeds in a cool, dark, and dry location</li>
          <li>• Airtight containers (glass jars) work best for long-term storage</li>
          <li>• Add silica gel packets to absorb moisture</li>
          <li>• Most vegetable seeds last 2-6 years when stored properly</li>
        </ul>
      </div>
    </div>
  );
}
