'use client';

import { useState } from 'react';
import { useGardenStore } from '@/stores/gardenStore';

export default function GardenManager() {
  const { 
    gardens, 
    activeGardenId, 
    gardenName,
    createGarden, 
    switchGarden, 
    deleteGarden, 
    duplicateGarden,
    getShareUrl,
  } = useGardenStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNewGarden, setShowNewGarden] = useState(false);
  const [newGardenName, setNewGardenName] = useState('');
  
  const handleCreateGarden = () => {
    createGarden(newGardenName || undefined);
    setNewGardenName('');
    setShowNewGarden(false);
  };
  
  const handleShare = async () => {
    setIsSharing(true);
    try {
      const url = getShareUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback - prompt user
      alert('Copy this link to share your garden:\n' + getShareUrl());
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleDelete = (id: string, name: string) => {
    if (gardens.length <= 1) {
      alert('You need at least one garden.');
      return;
    }
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteGarden(id);
    }
  };
  
  const currentGarden = gardens.find(g => g.id === activeGardenId);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span className="text-xl">📁</span> My Gardens
        </h3>
        <span className="text-xs text-gray-400">{gardens.length} garden{gardens.length !== 1 ? 's' : ''}</span>
      </div>
      
      {/* Current garden display */}
      <div className="mb-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🌱</span>
            <span className="font-medium text-gray-700 dark:text-gray-200">{gardenName}</span>
          </div>
          <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>
      
      {/* Garden list */}
      {isOpen && (
        <div className="space-y-2 animate-in slide-in-from-top-2">
          {gardens.map((garden) => (
            <div
              key={garden.id}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                garden.id === activeGardenId 
                  ? 'bg-green-100 dark:bg-green-900/50' 
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <button
                onClick={() => {
                  switchGarden(garden.id);
                  setIsOpen(false);
                }}
                className="flex-1 text-left flex items-center gap-2"
              >
                <span className={garden.id === activeGardenId ? 'text-green-600' : 'text-gray-400'}>
                  {garden.id === activeGardenId ? '✓' : '○'}
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{garden.name}</span>
                <span className="text-xs text-gray-400">({garden.gridSize}×{garden.gridSize})</span>
              </button>
              
              <div className="flex gap-1">
                <button
                  onClick={() => duplicateGarden(garden.id)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                  title="Duplicate"
                >
                  📋
                </button>
                {gardens.length > 1 && (
                  <button
                    onClick={() => handleDelete(garden.id, garden.name)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {/* Create new garden */}
          {showNewGarden ? (
            <div className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="text"
                value={newGardenName}
                onChange={(e) => setNewGardenName(e.target.value)}
                placeholder="Garden name..."
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-green-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGarden()}
              />
              <button
                onClick={handleCreateGarden}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewGarden(false)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewGarden(true)}
              className="w-full p-2 text-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>+</span> Create New Garden
            </button>
          )}
          
          {/* Share button */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full p-2 text-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSharing ? '⏳ Generating...' : copied ? '✓ Copied!' : '🔗 Share Garden'}
            </button>
          </div>
        </div>
      )}
      
      {/* Stats */}
      {currentGarden && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500">
            <span>🪴 {currentGarden.placedPlants.length} plants</span>
            <span>📝 {currentGarden.journalEntries.length} notes</span>
          </div>
        </div>
      )}
    </div>
  );
}
