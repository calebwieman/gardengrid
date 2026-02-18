'use client';

import { useState, useRef } from 'react';
import { useGardenStore, Garden } from '@/stores/gardenStore';

interface GardenBackupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GardenBackup({ isOpen, onClose }: GardenBackupProps) {
  const { gardens, activeGardenId } = useGardenStore();
  const store = useGardenStore.getState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gardenGridLastBackup');
    }
    return null;
  });

  const activeGarden = gardens.find(g => g.id === activeGardenId);

  // Export current garden to JSON
  const exportGarden = () => {
    if (!activeGarden) return;

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      garden: activeGarden,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeGarden.name.replace(/\s+/g, '_')}_garden_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Save backup timestamp
    const now = new Date().toISOString();
    localStorage.setItem('gardenGridLastBackup', now);
    setLastBackup(now);
  };

  // Export ALL gardens
  const exportAllGardens = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      type: 'all-gardens',
      gardens: gardens,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_gardens_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const now = new Date().toISOString();
    localStorage.setItem('gardenGridLastBackup', now);
    setLastBackup(now);
  };

  // Import garden(s) from JSON
  const importGarden = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setImportError(null);
        setImportSuccess(null);
        
        const data = JSON.parse(e.target?.result as string);
        
        if (data.type === 'all-gardens' && Array.isArray(data.gardens)) {
          // Import multiple gardens
          let importedCount = 0;
          data.gardens.forEach((garden: Garden) => {
            if (garden.id && garden.name) {
              // Generate new IDs to avoid conflicts
              const newGarden: Garden = {
                ...garden,
                id: `garden_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: `${garden.name} (Imported)`,
                createdAt: garden.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              // Add garden directly to the store
              const currentGardens = useGardenStore.getState().gardens;
              useGardenStore.setState({ gardens: [...currentGardens, newGarden] });
              importedCount++;
            }
          });
          setImportSuccess(`Successfully imported ${importedCount} garden(s)!`);
        } else if (data.garden && data.garden.id && data.garden.name) {
          // Import single garden
          const newGarden: Garden = {
            ...data.garden,
            id: `garden_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `${data.garden.name} (Imported)`,
            createdAt: data.garden.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          // Add garden directly to the store
          const currentGardens = useGardenStore.getState().gardens;
          useGardenStore.setState({ gardens: [...currentGardens, newGarden] });
          setImportSuccess(`Successfully imported "${data.garden.name}"!`);
        } else {
          setImportError('Invalid garden file format. Please select a valid GardenGrid export file.');
        }
      } catch (err) {
        setImportError('Failed to parse file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span>💾</span> Garden Backup
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Last Backup Info */}
          {lastBackup && (
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-sm">
              <p className="text-blue-800 dark:text-blue-200">
                📅 Last backup: {new Date(lastBackup).toLocaleDateString()} at {new Date(lastBackup).toLocaleTimeString()}
              </p>
            </div>
          )}

          {/* Current Garden Info */}
          {activeGarden && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                🌱 Currently editing: {activeGarden.name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                {activeGarden.placedPlants.length} plants placed • {activeGarden.gridSize}x{activeGarden.gridSize} grid
              </p>
            </div>
          )}

          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span>📤</span> Export
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={exportGarden}
                disabled={!activeGarden}
                className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>🌱</span> Export Current Garden
              </button>
              <button
                onClick={exportAllGardens}
                disabled={gardens.length === 0}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span>📚</span> Export All Gardens ({gardens.length})
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span>📥</span> Import
            </h3>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importGarden}
              className="hidden"
              id="garden-import-input"
            />
            <label
              htmlFor="garden-import-input"
              className="block w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <span>📁</span> Import Garden File
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Select a .json file exported from GardenGrid
            </p>
          </div>

          {/* Error Message */}
          {importError && (
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
              ⚠️ {importError}
            </div>
          )}

          {/* Success Message */}
          {importSuccess && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
              ✅ {importSuccess}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Your garden data is stored locally on this device. Use export to create backups or share gardens with friends!
          </p>
        </div>
      </div>
    </div>
  );
}
