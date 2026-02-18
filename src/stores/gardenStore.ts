import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Plant } from '@/lib/plants';

export interface PlacedPlant {
  id: string;
  plantId: string;
  x: number;
  y: number;
}

interface GardenState {
  gardenName: string;
  gridSize: number;
  gridWidth: number;
  gridHeight: number;
  placedPlants: PlacedPlant[];
  selectedPlantId: string | null;
  hasVisited: boolean;
  mobileMenuOpen: boolean;
  // Undo/Redo
  history: PlacedPlant[][];
  historyIndex: number;
  setGardenName: (name: string) => void;
  setGridSize: (size: number) => void;
  setSelectedPlant: (plantId: string | null) => void;
  setPlacedPlants: (plants: PlacedPlant[]) => void;
  setHasVisited: (visited: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  placePlant: (x: number, y: number) => void;
  removePlant: (x: number, y: number) => void;
  clearGarden: () => void;
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  // Export/Import
  exportGarden: () => string;
  importGarden: (json: string) => boolean;
}

export const useGardenStore = create<GardenState>()(
  persist(
    (set, get) => ({
      gardenName: 'My First Garden',
      gridSize: 8,
      gridWidth: 8,
      gridHeight: 8,
      placedPlants: [],
      selectedPlantId: null,
      hasVisited: false,
      mobileMenuOpen: false,
      history: [],
      historyIndex: -1,
      
      setGardenName: (name) => set({ gardenName: name }),
      setHasVisited: (visited: boolean) => set({ hasVisited: visited }),
      setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),
      
      setGridSize: (size) => set({ 
        gridSize: size, 
        gridWidth: size, 
        gridHeight: size,
        placedPlants: [],
        history: [],
        historyIndex: -1,
      }),
      
      setSelectedPlant: (plantId) => set({ selectedPlantId: plantId }),
      
      setPlacedPlants: (plants) => {
        const { history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(plants);
        // Keep only last 50 states
        if (newHistory.length > 50) newHistory.shift();
        set({ 
          placedPlants: plants,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      // Save state to history
      saveToHistory: () => {
        const { placedPlants, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...placedPlants]);
        if (newHistory.length > 50) newHistory.shift();
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },
      
      placePlant: (x, y) => {
        const { placedPlants, selectedPlantId } = get();
        if (!selectedPlantId) return;
        
        const existingIndex = placedPlants.findIndex(p => p.x === x && p.y === y);
        
        if (existingIndex >= 0) {
          const newPlants = [...placedPlants];
          newPlants[existingIndex] = {
            ...newPlants[existingIndex],
            plantId: selectedPlantId,
          };
          get().setPlacedPlants(newPlants);
        } else {
          const newPlants = [
            ...placedPlants,
            { id: `${selectedPlantId}-${x}-${y}`, plantId: selectedPlantId, x, y },
          ];
          get().setPlacedPlants(newPlants);
        }
      },
      
      removePlant: (x, y) => {
        const { placedPlants } = get();
        get().setPlacedPlants(placedPlants.filter(p => !(p.x === x && p.y === y)));
      },
      
      clearGarden: () => {
        get().setPlacedPlants([]);
      },
      
      // Undo
      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          set({
            placedPlants: [...history[historyIndex - 1]],
            historyIndex: historyIndex - 1,
          });
        }
      },
      
      // Redo
      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          set({
            placedPlants: [...history[historyIndex + 1]],
            historyIndex: historyIndex + 1,
          });
        }
      },
      
      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
      },
      
      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },
      
      // Export garden to JSON
      exportGarden: () => {
        const { gardenName, gridSize, placedPlants } = get();
        return JSON.stringify({
          name: gardenName,
          size: gridSize,
          plants: placedPlants,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        }, null, 2);
      },
      
      // Import garden from JSON
      importGarden: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data.plants || !Array.isArray(data.plants)) return false;
          set({
            gardenName: data.name || 'Imported Garden',
            gridSize: data.size || 8,
            placedPlants: data.plants,
            history: [data.plants],
            historyIndex: 0,
          });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'gardengrid-storage',
      partialize: (state) => ({
        gardenName: state.gardenName,
        gridSize: state.gridSize,
        placedPlants: state.placedPlants,
        hasVisited: state.hasVisited,
      }),
    }
  )
);
