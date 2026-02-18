import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Plant } from '@/lib/plants';

export type PlantStage = 'seedling' | 'growing' | 'ready';

export interface PlacedPlant {
  id: string;
  plantId: string;
  x: number;
  y: number;
  plantedAt?: string; // ISO date string when plant was placed
  stage?: PlantStage; // Current growth stage
}

export interface JournalEntry {
  id: string;
  text: string;
  createdAt: string;
  type: 'observation' | 'tip' | 'harvest' | 'problem';
}

export interface Garden {
  id: string;
  name: string;
  gridSize: number;
  placedPlants: PlacedPlant[];
  journalEntries: JournalEntry[];
  createdAt: string;
  updatedAt: string;
}

interface GardenState {
  // Current active garden
  activeGardenId: string;
  gardens: Garden[];
  
  // Computed from active garden (for backwards compatibility)
  gardenName: string;
  gridSize: number;
  gridWidth: number;
  gridHeight: number;
  placedPlants: PlacedPlant[];
  selectedPlantId: string | null;
  hasVisited: boolean;
  mobileMenuOpen: boolean;
  journalEntries: JournalEntry[];
  
  // USDA Zone for frost dates and weather
  zone: number;
  
  // Undo/Redo
  history: PlacedPlant[][];
  historyIndex: number;
  
  // Garden management
  createGarden: (name?: string) => void;
  switchGarden: (id: string) => void;
  deleteGarden: (id: string) => void;
  duplicateGarden: (id: string) => void;
  updateActiveGarden: () => void;
  
  setGardenName: (name: string) => void;
  setGridSize: (size: number) => void;
  setSelectedPlant: (plantId: string | null) => void;
  setPlacedPlants: (plants: PlacedPlant[]) => void;
  setHasVisited: (visited: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  // Journal
  addJournalEntry: (text: string, type: JournalEntry['type']) => void;
  removeJournalEntry: (id: string) => void;
  placePlant: (x: number, y: number) => void;
  removePlant: (x: number, y: number) => void;
  clearGarden: () => void;
  updatePlantStage: (x: number, y: number, stage: PlantStage) => void;
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  // Export/Import
  exportGarden: () => string;
  importGarden: (json: string) => boolean;
  // Share
  getShareUrl: () => string;
  importFromShare: () => boolean;
}

export const useGardenStore = create<GardenState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeGardenId: 'default',
      gardens: [{
        id: 'default',
        name: 'My First Garden',
        gridSize: 8,
        placedPlants: [],
        journalEntries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      
      // Computed properties from active garden
      gardenName: 'My First Garden',
      gridSize: 8,
      gridWidth: 8,
      gridHeight: 8,
      placedPlants: [],
      selectedPlantId: null,
      hasVisited: false,
      mobileMenuOpen: false,
      journalEntries: [],
      zone: 6, // Default USDA zone
      history: [],
      historyIndex: -1,
      
      // Create a new garden
      createGarden: (name?: string) => {
        const { gardens } = get();
        const newId = `garden-${Date.now()}`;
        const newGarden: Garden = {
          id: newId,
          name: name || `Garden ${gardens.length + 1}`,
          gridSize: 8,
          placedPlants: [],
          journalEntries: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({
          gardens: [...gardens, newGarden],
          activeGardenId: newId,
          gardenName: newGarden.name,
          gridSize: 8,
          placedPlants: [],
          journalEntries: [],
          history: [],
          historyIndex: -1,
        });
      },
      
      // Switch to a different garden
      switchGarden: (id: string) => {
        const { gardens } = get();
        const garden = gardens.find(g => g.id === id);
        if (!garden) return;
        
        set({
          activeGardenId: id,
          gardenName: garden.name,
          gridSize: garden.gridSize,
          gridWidth: garden.gridSize,
          gridHeight: garden.gridSize,
          placedPlants: garden.placedPlants,
          journalEntries: garden.journalEntries,
          history: [garden.placedPlants],
          historyIndex: 0,
        });
      },
      
      // Delete a garden
      deleteGarden: (id: string) => {
        const { gardens, activeGardenId } = get();
        if (gardens.length <= 1) return; // Keep at least one garden
        
        const newGardens = gardens.filter(g => g.id !== id);
        const newActiveId = activeGardenId === id ? newGardens[0].id : activeGardenId;
        const activeGarden = newGardens.find(g => g.id === newActiveId);
        
        if (activeGarden) {
          set({
            gardens: newGardens,
            activeGardenId: newActiveId,
            gardenName: activeGarden.name,
            gridSize: activeGarden.gridSize,
            placedPlants: activeGarden.placedPlants,
            journalEntries: activeGarden.journalEntries,
          });
        }
      },
      
      // Duplicate a garden
      duplicateGarden: (id: string) => {
        const { gardens } = get();
        const garden = gardens.find(g => g.id === id);
        if (!garden) return;
        
        const newId = `garden-${Date.now()}`;
        const newGarden: Garden = {
          id: newId,
          name: `${garden.name} (Copy)`,
          gridSize: garden.gridSize,
          placedPlants: [...garden.placedPlants],
          journalEntries: [...garden.journalEntries],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set({
          gardens: [...gardens, newGarden],
          activeGardenId: newId,
          gardenName: newGarden.name,
          placedPlants: newGarden.placedPlants,
          journalEntries: newGarden.journalEntries,
          history: [newGarden.placedPlants],
          historyIndex: 0,
        });
      },
      
      // Update the active garden in the gardens array
      updateActiveGarden: () => {
        const { activeGardenId, gardens, gardenName, gridSize, placedPlants, journalEntries } = get();
        set({
          gardens: gardens.map(g => 
            g.id === activeGardenId 
              ? { ...g, name: gardenName, gridSize, placedPlants, journalEntries, updatedAt: new Date().toISOString() }
              : g
          ),
        });
      },
      
      setGardenName: (name) => {
        set({ gardenName: name });
        get().updateActiveGarden();
      },
      
      setHasVisited: (visited: boolean) => set({ hasVisited: visited }),
      setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),
      setZone: (zone: number) => set({ zone }),
      
      // Journal
      addJournalEntry: (text, type) => {
        const newEntry: JournalEntry = {
          id: `journal-${Date.now()}`,
          text,
          type,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ journalEntries: [newEntry, ...state.journalEntries] }));
        get().updateActiveGarden();
      },
      
      removeJournalEntry: (id) => {
        set((state) => ({ journalEntries: state.journalEntries.filter(e => e.id !== id) }));
        get().updateActiveGarden();
      },
      
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
        get().updateActiveGarden();
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
        const now = new Date().toISOString();
        
        if (existingIndex >= 0) {
          const newPlants = [...placedPlants];
          newPlants[existingIndex] = {
            ...newPlants[existingIndex],
            plantId: selectedPlantId,
            plantedAt: now,
            stage: 'seedling',
          };
          get().setPlacedPlants(newPlants);
        } else {
          const newPlants: PlacedPlant[] = [
            { id: `${selectedPlantId}-${x}-${y}`, plantId: selectedPlantId, x, y, plantedAt: now, stage: 'seedling' },
          ];
          get().setPlacedPlants(newPlants);
        }
      },
      
      removePlant: (x, y) => {
        const { placedPlants } = get();
        get().setPlacedPlants(placedPlants.filter(p => !(p.x === x && p.y === y)));
      },
      
      // Update plant stage (seedling → growing → ready)
      updatePlantStage: (x: number, y: number, stage: PlantStage) => {
        const { placedPlants } = get();
        const newPlants = placedPlants.map(p => 
          p.x === x && p.y === y ? { ...p, stage } : p
        );
        get().setPlacedPlants(newPlants);
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
          get().updateActiveGarden();
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
          get().updateActiveGarden();
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
          version: '1.2',
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
          get().updateActiveGarden();
          return true;
        } catch {
          return false;
        }
      },
      
      // Get shareable URL with garden data encoded
      getShareUrl: () => {
        const { gardenName, gridSize, placedPlants } = get();
        const shareData = {
          name: gardenName,
          size: gridSize,
          plants: placedPlants,
        };
        const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?garden=${encoded}`;
      },
      
      // Import from share URL
      importFromShare: () => {
        try {
          const params = new URLSearchParams(window.location.search);
          const gardenParam = params.get('garden');
          if (!gardenParam) return false;
          
          const shareData = JSON.parse(decodeURIComponent(atob(gardenParam)));
          if (!shareData.plants || !Array.isArray(shareData.plants)) return false;
          
          // Create a new garden from the share
          const { gardens } = get();
          const newId = `garden-${Date.now()}`;
          const newGarden: Garden = {
            id: newId,
            name: shareData.name || 'Shared Garden',
            gridSize: shareData.size || 8,
            placedPlants: shareData.plants,
            journalEntries: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({
            gardens: [...gardens, newGarden],
            activeGardenId: newId,
            gardenName: newGarden.name,
            gridSize: newGarden.gridSize,
            placedPlants: newGarden.placedPlants,
            journalEntries: [],
            history: [newGarden.placedPlants],
            historyIndex: 0,
          });
          
          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: 'gardengrid-storage',
      partialize: (state) => ({
        gardens: state.gardens,
        activeGardenId: state.activeGardenId,
        hasVisited: state.hasVisited,
        zone: state.zone,
      }),
    }
  )
);
