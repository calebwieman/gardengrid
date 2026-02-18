import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Plant } from '@/lib/plants';
import { SoilType } from '@/lib/soil';

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

export interface PestIssue {
  id: string;
  pestId: string;
  plantX: number;
  plantY: number;
  severity: 'low' | 'medium' | 'high';
  notes: string;
  createdAt: string;
  resolved: boolean;
}

export interface Reminder {
  id: string;
  type: 'water' | 'fertilize' | 'harvest' | 'check' | 'custom';
  plantId?: string;
  plantX?: number;
  plantY?: number;
  title: string;
  notes?: string;
  dueDate: string; // ISO date
  completed: boolean;
  snoozedUntil?: string;
  recurringDays?: number; // If set, repeats every N days
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'harvest_ready';
  plantId?: string;
  read: boolean;
  createdAt: string;
}

export interface Garden {
  id: string;
  name: string;
  gridSize: number;
  placedPlants: PlacedPlant[];
  journalEntries: JournalEntry[];
  pestIssues: PestIssue[];
  rotationHistory: Record<string, string[]>; // year -> plant families per cell [x-y]: [family, family, ...]
  reminders: Reminder[];
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
  pestIssues: PestIssue[];
  rotationHistory: Record<string, string[]>; // year -> plant families per cell
  
  // Reminders & Notifications
  reminders: Reminder[];
  notifications: Notification[];
  unreadNotificationCount: number;
  
  // USDA Zone for frost dates and weather
  zone: number;
  setZone: (zone: number) => void;
  
  // Soil type for recommendations
  soilType: SoilType | null;
  setSoilType: (type: SoilType | null) => void;
  
  // Undo/Redo
  history: PlacedPlant[][];
  historyIndex: number;
  
  // Achievement tracking
  visitDates: string[];
  addVisitDate: (date: string) => void;
  completedTasks: string[];
  
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
  // Pest issues
  addPestIssue: (pestId: string, plantX: number, plantY: number, severity: PestIssue['severity'], notes: string) => void;
  removePestIssue: (id: string) => void;
  resolvePestIssue: (id: string) => void;
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
  // Crop rotation
  saveToRotationHistory: (year: number) => void;
  getRotationWarnings: () => { x: number; y: number; plantId: string; years: number[]; message: string }[];
  getRotationSuggestions: () => { family: string; emoji: string; name: string; goodFollowers: string[] }[];
  clearRotationHistory: () => void;
  // Share
  getShareUrl: () => string;
  importFromShare: () => boolean;
  // Reminders
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  completeReminder: (id: string) => void;
  snoozeReminder: (id: string, days: number) => void;
  deleteReminder: (id: string) => void;
  getUpcomingReminders: () => Reminder[];
  getOverdueReminders: () => Reminder[];
  // Notifications
  addNotification: (message: string, type: Notification['type'], plantId?: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
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
        pestIssues: [],
        rotationHistory: {},
        reminders: [],
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
      pestIssues: [],
      rotationHistory: {},
      reminders: [],
      notifications: [],
      unreadNotificationCount: 0,
      zone: 6, // Default USDA zone
      soilType: null, // No soil type selected yet
      history: [],
      historyIndex: -1,
      
      // Achievement tracking
      visitDates: [], // Array of date strings (YYYY-MM-DD)
      completedTasks: [], // Array of completed task IDs
      
      // Add a visit date
      addVisitDate: (date: string) => {
        const { visitDates } = get();
        if (!visitDates.includes(date)) {
          set({ visitDates: [...visitDates, date] });
        }
      },
      
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
          pestIssues: [],
          rotationHistory: {},
          reminders: [],
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
          pestIssues: [],
          rotationHistory: {},
          reminders: [],
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
          pestIssues: garden.pestIssues || [],
          rotationHistory: garden.rotationHistory || {},
          reminders: garden.reminders || [],
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
            pestIssues: activeGarden.pestIssues || [],
            rotationHistory: activeGarden.rotationHistory || {},
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
          pestIssues: [...(garden.pestIssues || [])],
          rotationHistory: { ...garden.rotationHistory },
          reminders: [...(garden.reminders || [])],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set({
          gardens: [...gardens, newGarden],
          activeGardenId: newId,
          gardenName: newGarden.name,
          placedPlants: newGarden.placedPlants,
          journalEntries: newGarden.journalEntries,
          pestIssues: newGarden.pestIssues,
          rotationHistory: newGarden.rotationHistory,
          history: [newGarden.placedPlants],
          historyIndex: 0,
        });
      },
      
      // Update the active garden in the gardens array
      updateActiveGarden: () => {
        const { activeGardenId, gardens, gardenName, gridSize, placedPlants, journalEntries, pestIssues, rotationHistory, reminders } = get();
        set({
          gardens: gardens.map(g => 
            g.id === activeGardenId 
              ? { ...g, name: gardenName, gridSize, placedPlants, journalEntries, pestIssues, rotationHistory, reminders, updatedAt: new Date().toISOString() }
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
      setSoilType: (type: SoilType | null) => set({ soilType: type }),
      
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
      
      // Pest issues
      addPestIssue: (pestId, plantX, plantY, severity, notes) => {
        const newIssue: PestIssue = {
          id: `pest-${Date.now()}`,
          pestId,
          plantX,
          plantY,
          severity,
          notes,
          createdAt: new Date().toISOString(),
          resolved: false,
        };
        set((state) => ({ pestIssues: [newIssue, ...state.pestIssues] }));
        get().updateActiveGarden();
      },
      
      removePestIssue: (id) => {
        set((state) => ({ pestIssues: state.pestIssues.filter(i => i.id !== id) }));
        get().updateActiveGarden();
      },
      
      resolvePestIssue: (id) => {
        set((state) => ({ 
          pestIssues: state.pestIssues.map(i => 
            i.id === id ? { ...i, resolved: !i.resolved } : i
          ) 
        }));
        get().updateActiveGarden();
      },
      
      // Crop Rotation functions
      saveToRotationHistory: (year: number) => {
        const { placedPlants, rotationHistory, activeGardenId, gardens } = get();
        const { getPlantFamily } = require('@/lib/plants');
        
        // Build cell key -> family mapping for this year's plantings
        const yearKey = year.toString();
        const cellFamilies: Record<string, string> = {};
        
        placedPlants.forEach(plant => {
          const cellKey = `${plant.x}-${plant.y}`;
          const family = getPlantFamily(plant.plantId);
          if (family) {
            if (!cellFamilies[cellKey]) {
              cellFamilies[cellKey] = family;
            }
          }
        });
        
        // Convert to array format for storage
        const newHistory = { ...rotationHistory };
        newHistory[yearKey] = Object.entries(cellFamilies).map(([cell, family]) => `${cell}:${family}`);
        
        set({ rotationHistory: newHistory });
        
        // Also save to the garden
        const updatedGardens = gardens.map(g => 
          g.id === activeGardenId 
            ? { ...g, rotationHistory: newHistory, updatedAt: new Date().toISOString() }
            : g
        );
        set({ gardens: updatedGardens });
      },
      
      getRotationWarnings: () => {
        const { placedPlants, rotationHistory, gridSize } = get();
        const { getPlantFamily } = require('@/lib/plants');
        
        const currentYear = new Date().getFullYear();
        const warnings: { x: number; y: number; plantId: string; years: number[]; message: string }[] = [];
        
        // Get all previous years
        const years = Object.keys(rotationHistory).map(Number).sort((a, b) => a - b);
        
        placedPlants.forEach(plant => {
          const cellKey = `${plant.x}-${plant.y}`;
          const currentFamily = getPlantFamily(plant.plantId);
          
          if (!currentFamily) return;
          
          years.forEach(year => {
            const yearData = rotationHistory[year.toString()] || [];
            const cellEntry = yearData.find((entry: string) => entry.startsWith(`${cellKey}:`));
            
            if (cellEntry) {
              const [, previousFamily] = cellEntry.split(':');
              if (previousFamily === currentFamily && currentYear - year < 3) {
                warnings.push({
                  x: plant.x,
                  y: plant.y,
                  plantId: plant.plantId,
                  years: [year],
                  message: `⚠️ Same plant family planted here in ${year}. Rotate crops!`,
                });
              }
            }
          });
        });
        
        return warnings;
      },
      
      getRotationSuggestions: () => {
        const { placedPlants } = get();
        const { getPlantFamily, plantFamilyNames, plantFamilyEmoji } = require('@/lib/plants');
        
        // Get unique families in current garden
        const families = new Set<string>();
        placedPlants.forEach(plant => {
          const family = getPlantFamily(plant.plantId);
          if (family) families.add(family);
        });
        
        // For each family, suggest what to plant next
        const suggestions: Record<string, string[]> = {
          solanaceae: ['fabaceae', 'cucurbitaceae', 'brassicaceae'], // Follow with legumes, gourds, cabbage
          brassicaceae: ['fabaceae', 'solanaceae', 'cucurbitaceae'], // Follow with legumes, nightshades
          fabaceae: ['solanaceae', 'cucurbitaceae', 'brassicaceae'], // Follow with anything (fixes nitrogen)
          cucurbitaceae: ['fabaceae', 'brassicaceae', 'solanaceae'], // Follow with legumes or cabbage
          allium: ['brassicaceae', 'solanaceae', 'cucurbitaceae'], // Follow with any
          apiaceae: ['fabaceae', 'solanaceae', 'cucurbitaceae'], // Follow with legumes or nightshades
          asteraceae: ['fabaceae', 'solanaceae', 'cucurbitaceae'], // Follow with legumes or nightshades
        };
        
        const result: { family: string; emoji: string; name: string; goodFollowers: string[] }[] = [];
        
        families.forEach(family => {
          const goodFollowers = suggestions[family] || [];
          result.push({
            family,
            emoji: plantFamilyEmoji[family as keyof typeof plantFamilyEmoji] || '🌱',
            name: plantFamilyNames[family as keyof typeof plantFamilyNames] || family,
            goodFollowers,
          });
        });
        
        return result;
      },
      
      clearRotationHistory: () => {
        const { activeGardenId, gardens } = get();
        set({ rotationHistory: {} });
        
        const updatedGardens = gardens.map(g => 
          g.id === activeGardenId 
            ? { ...g, rotationHistory: {}, updatedAt: new Date().toISOString() }
            : g
        );
        set({ gardens: updatedGardens });
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
        const { gardenName, gridSize, placedPlants, pestIssues, rotationHistory } = get();
        return JSON.stringify({
          name: gardenName,
          size: gridSize,
          plants: placedPlants,
          pestIssues: pestIssues,
          rotationHistory: rotationHistory,
          exportedAt: new Date().toISOString(),
          version: '1.4',
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
            pestIssues: data.pestIssues || [],
            rotationHistory: data.rotationHistory || {},
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
        const { gardenName, gridSize, placedPlants, pestIssues, rotationHistory } = get();
        const shareData = {
          name: gardenName,
          size: gridSize,
          plants: placedPlants,
          pestIssues: pestIssues,
          rotationHistory: rotationHistory,
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
            pestIssues: shareData.pestIssues || [],
            rotationHistory: shareData.rotationHistory || {},
            reminders: shareData.reminders || [],
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
            pestIssues: newGarden.pestIssues,
            rotationHistory: newGarden.rotationHistory,
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
      
      // Reminders
      addReminder: (reminder) => {
        const newReminder: Reminder = {
          ...reminder,
          id: `reminder-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ reminders: [newReminder, ...state.reminders] }));
        get().updateActiveGarden();
      },
      
      completeReminder: (id) => {
        const { reminders } = get();
        const reminder = reminders.find(r => r.id === id);
        
        if (reminder?.recurringDays) {
          // For recurring reminders, create a new one
          const nextDue = new Date();
          nextDue.setDate(nextDue.getDate() + reminder.recurringDays);
          
          set((state) => ({
            reminders: state.reminders.map(r => 
              r.id === id 
                ? { ...r, completed: true, dueDate: nextDue.toISOString() }
                : r
            ).concat([{
              ...reminder,
              id: `reminder-${Date.now()}`,
              dueDate: nextDue.toISOString(),
              completed: false,
              createdAt: new Date().toISOString(),
            }])
          }));
        } else {
          set((state) => ({ 
            reminders: state.reminders.map(r => 
              r.id === id ? { ...r, completed: true } : r
            )
          }));
        }
        get().updateActiveGarden();
      },
      
      snoozeReminder: (id, days) => {
        const snoozeUntil = new Date();
        snoozeUntil.setDate(snoozeUntil.getDate() + days);
        
        set((state) => ({ 
          reminders: state.reminders.map(r => 
            r.id === id ? { ...r, snoozedUntil: snoozeUntil.toISOString() } : r
          )
        }));
        get().updateActiveGarden();
      },
      
      deleteReminder: (id) => {
        set((state) => ({ reminders: state.reminders.filter(r => r.id !== id) }));
        get().updateActiveGarden();
      },
      
      getUpcomingReminders: () => {
        const { reminders } = get();
        const now = new Date();
        return reminders
          .filter(r => !r.completed && new Date(r.dueDate) > now && (!r.snoozedUntil || new Date(r.snoozedUntil) <= now))
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      },
      
      getOverdueReminders: () => {
        const { reminders } = get();
        const now = new Date();
        return reminders
          .filter(r => !r.completed && new Date(r.dueDate) < now && (!r.snoozedUntil || new Date(r.snoozedUntil) <= now))
          .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      },
      
      // Notifications
      addNotification: (message, type, plantId) => {
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          message,
          type,
          plantId,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ 
          notifications: [newNotification, ...state.notifications].slice(0, 50),
          unreadNotificationCount: state.unreadNotificationCount + 1,
        }));
      },
      
      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
          unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
        }));
      },
      
      clearNotifications: () => {
        set({ notifications: [], unreadNotificationCount: 0 });
      },
    }),
    {
      name: 'gardengrid-storage',
      partialize: (state) => ({
        gardens: state.gardens,
        activeGardenId: state.activeGardenId,
        hasVisited: state.hasVisited,
        zone: state.zone,
        soilType: state.soilType,
        notifications: state.notifications,
        reminders: state.reminders,
      }),
    }
  )
);
