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
  setGardenName: (name: string) => void;
  setGridSize: (size: number) => void;
  setSelectedPlant: (plantId: string | null) => void;
  setPlacedPlants: (plants: PlacedPlant[]) => void;
  placePlant: (x: number, y: number) => void;
  removePlant: (x: number, y: number) => void;
  clearGarden: () => void;
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
      
      setGardenName: (name) => set({ gardenName: name }),
      
      setGridSize: (size) => set({ 
        gridSize: size, 
        gridWidth: size, 
        gridHeight: size,
        placedPlants: [],
      }),
      
      setSelectedPlant: (plantId) => set({ selectedPlantId: plantId }),
      
      setPlacedPlants: (plants) => set({ placedPlants: plants }),
      
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
          set({ placedPlants: newPlants });
        } else {
          set({
            placedPlants: [
              ...placedPlants,
              { id: `${selectedPlantId}-${x}-${y}`, plantId: selectedPlantId, x, y },
            ],
          });
        }
      },
      
      removePlant: (x, y) => {
        const { placedPlants } = get();
        set({
          placedPlants: placedPlants.filter(p => !(p.x === x && p.y === y)),
        });
      },
      
      clearGarden: () => set({ placedPlants: [] }),
    }),
    {
      name: 'gardengrid-storage',
    }
  )
);
