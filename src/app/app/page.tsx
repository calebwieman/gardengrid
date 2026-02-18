'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, useDraggable, useDroppable, TouchSensor } from '@dnd-kit/core';
import { useGardenStore, PlacedPlant, PlantStage } from '@/stores/gardenStore';
import { plants, getPlantById, Plant } from '@/lib/plants';
import { BottomNav, SideNav, navItems, TabId } from '@/components/Navigation';
import PlantingCalendar from '@/components/PlantingCalendar';
import SaveIndicator from '@/components/SaveIndicator';
import GardenStats from '@/components/GardenStats';
import GardenTips from '@/components/GardenTips';
import GardenTemplates from '@/components/GardenTemplates';
import WelcomeModal from '@/components/WelcomeModal';
import PlantDetailsModal from '@/components/PlantDetailsModal';
import GardenJournal from '@/components/GardenJournal';
import GardenManager from '@/components/GardenManager';
import WeatherWidget from '@/components/WeatherWidget';
import GardenCare from '@/components/GardenCare';
import SeedList from '@/components/SeedList';
import Tutorial from '@/components/Tutorial';
import PestTracker from '@/components/PestTracker';
import CropRotationPlanner from '@/components/CropRotationPlanner';
import GardenShare from '@/components/GardenShare';
import GardenTasks from '@/components/GardenTasks';
import GardenAnalytics from '@/components/GardenAnalytics';
import SuccessionPlanting from '@/components/SuccessionPlanting';
import GardenThemes from '@/components/GardenThemes';
import YieldTracker from '@/components/YieldTracker';
import RecipeSuggestions from '@/components/RecipeSuggestions';
import GardenPhotoGallery from '@/components/GardenPhotoGallery';
import GardenReminders from '@/components/GardenReminders';
import GardenAchievements from '@/components/GardenAchievements';
import MoonPhaseGardening from '@/components/MoonPhaseGardening';
import SmartSuggestions from '@/components/SmartSuggestions';
import GardenSupplyCalculator from '@/components/GardenSupplyCalculator';
import GardenCostTracker from '@/components/GardenCostTracker';
import GardenHealthScore from '@/components/GardenHealthScore';
import GardenBackup from '@/components/GardenBackup';
import GardenAssistant from '@/components/GardenAssistant';
import SeedVault from '@/components/SeedVault';

function DraggablePlant({ plant }: { plant: Plant }) {
  const { selectedPlantId, setSelectedPlant } = useGardenStore();
  const isSelected = selectedPlantId === plant.id;
  const [isHovered, setIsHovered] = useState(false);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `plant-source-${plant.id}`,
    data: { type: 'plant', plantId: plant.id },
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;
  
  return (
    <div className="relative">
      <button
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => setSelectedPlant(plant.id === selectedPlantId ? null : plant.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex items-center gap-2 md:gap-3 w-full p-3 md:p-2 rounded-lg text-left transition-all touch-manipulation ${
          isSelected 
            ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
        } ${isDragging ? 'opacity-50' : ''}`}
        style={style}
      >
        <span className="text-2xl md:text-3xl">{plant.emoji}</span>
        <span className="font-medium text-gray-700 dark:text-gray-200 text-base md:text-sm">{plant.name}</span>
        <span className="text-xs text-gray-400 ml-auto hidden md:block">{plant.category}</span>
      </button>
      
      {/* Hover Tooltip */}
      {isHovered && !isSelected && (
        <div className="absolute z-50 left-0 top-full mt-1 w-56 bg-gray-800 text-white text-sm rounded-lg p-3 shadow-xl">
          <p className="font-semibold">{plant.emoji} {plant.name}</p>
          <div className="mt-2 space-y-1 text-xs">
            <p>⏱️ {plant.daysToMaturity} days to harvest</p>
            <p>☀️ {plant.sunNeeds.replace('-', ' ')}</p>
            <p>📏 Space: {plant.spacing}"</p>
            <p className="text-green-400 mt-2">✓ {plant.companions.slice(0, 3).map(id => getPlantById(id)?.emoji).join(' ')}</p>
            <p className="text-red-400">✗ {plant.antagonists.slice(0, 3).map(id => getPlantById(id)?.emoji).join(' ')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DroppableCell({ x, y, showRelationships, relationships, onViewDetails, isMobile, onHover, onCellTap }: { 
  x: number; 
  y: number;
  showRelationships: boolean;
  relationships: { type: 'companion' | 'antagonist' | 'spacing'; fromX: number; fromY: number; toX: number; toY: number }[];
  onViewDetails?: (plant: Plant, x: number, y: number) => void;
  isMobile: boolean;
  onHover?: (x: number, y: number) => void;
  onCellTap?: (x: number, y: number) => void;
}) {
  const { placedPlants, selectedPlantId, placePlant, removePlant, updatePlantStage } = useGardenStore();
  
  const placedPlant = placedPlants.find(p => p.x === x && p.y === y);
  const plantData = placedPlant ? getPlantById(placedPlant.plantId) : null;
  
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${x}-${y}`,
    data: { type: 'cell', x, y },
  });
  
  const handleClick = () => {
    if (placedPlant) {
      // Cycle through stages: seedling → growing → ready → seedling
      const stages: PlantStage[] = ['seedling', 'growing', 'ready'];
      const currentStage = placedPlant.stage || 'seedling';
      const currentIndex = stages.indexOf(currentStage);
      const nextStage = stages[(currentIndex + 1) % stages.length];
      updatePlantStage(x, y, nextStage);
    } else if (selectedPlantId) {
      placePlant(x, y);
    } else if (isMobile && onCellTap) {
      // On mobile with no plant selected, tap cell to open plant picker
      onCellTap(x, y);
    }
  };
  
  // Handle view details (e.g., on right-click or modifier+click)
  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    if (plantData && onViewDetails) {
      onViewDetails(plantData, x, y);
    }
  };
  
  // Check if this cell has relationships
  const cellRelationships = relationships.filter(r => 
    (r.fromX === x && r.fromY === y) || (r.toX === x && r.toY === y)
  );
  
  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      onContextMenu={handleViewDetails}
      onMouseEnter={() => onHover?.(x, y)}
      onMouseLeave={() => onHover?.(-1, -1)}
      className={`aspect-square rounded-sm md:rounded cursor-pointer transition-all flex items-center justify-center text-xl md:text-2xl relative group touch-manipulation
        ${isOver && selectedPlantId ? 'ring-2 ring-green-400 ring-inset' : ''}
        ${plantData 
          ? '' 
          : selectedPlantId 
            ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900 dark:hover:bg-green-800 border border-green-200 dark:border-green-700' 
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
        }
      `}
      style={{ 
        backgroundColor: plantData ? plantData.color + '40' : undefined,
        minHeight: isMobile ? '36px' : 'auto',
      }}
      title={plantData ? `${plantData.name} - Click to change stage` : (selectedPlantId ? 'Drop to plant' : 'Select a plant first')}
    >
      {plantData?.emoji}
      
      {/* Relationship indicators */}
      {showRelationships && cellRelationships.length > 0 && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {cellRelationships.slice(0, 3).map((r, i) => (
            <div 
              key={i}
              className={`w-2.5 h-2.5 rounded-full border border-white dark:border-gray-800 ${
                r.type === 'companion' ? 'bg-green-500' : 
                r.type === 'antagonist' ? 'bg-red-500' : 'bg-orange-500'
              }`}
              title={r.type === 'companion' ? 'Good companion' : r.type === 'antagonist' ? 'Bad combination' : 'Too close'}
            />
          ))}
        </div>
      )}
      
      {/* Stage indicator */}
      {plantData && placedPlant?.stage && (
        <div 
          className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 text-xs px-1.5 py-0.5 rounded-full font-medium pointer-events-none ${
            placedPlant.stage === 'seedling' ? 'bg-yellow-100 text-yellow-700' :
            placedPlant.stage === 'growing' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'
          }`}
        >
          {placedPlant.stage === 'seedling' ? '🌱' : placedPlant.stage === 'growing' ? '🌿' : '✨'}
        </div>
      )}
      
      {/* Info button for placed plants */}
      {plantData && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(e);
          }}
          className="absolute top-0.5 right-0.5 w-5 h-5 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
          title="View details (right-click)"
        >
          ℹ️
        </button>
      )}
      
      {/* Note: Relationship lines are now rendered via the SVG RelationshipLines component below */}
    </div>
  );
}

function DragOverlayPlant({ plant }: { plant: Plant }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white border-2 border-green-500 rounded-lg shadow-lg">
      <span className="text-2xl">{plant.emoji}</span>
      <span className="font-medium text-gray-700">{plant.name}</span>
    </div>
  );
}

// SVG overlay for relationship lines
function RelationshipLines({ 
  relationships, 
  cellSize,
  gridSize
}: { 
  relationships: { type: 'companion' | 'antagonist' | 'spacing'; fromX: number; fromY: number; toX: number; toY: number }[];
  cellSize: number;
  gridSize: number;
}) {
  if (relationships.length === 0) return null;
  
  const size = gridSize * cellSize;
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none" 
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {relationships.map((r, i) => {
        // Calculate line coordinates on grid edges (between adjacent cells)
        let x1, y1, x2, y2;
        
        if (r.toX > r.fromX) {
          // Horizontal: from right edge of fromCell to left edge of toCell
          x1 = (r.fromX + 1) * cellSize;
          x2 = r.toX * cellSize;
          y1 = r.fromY * cellSize + cellSize / 2;
          y2 = r.toY * cellSize + cellSize / 2;
        } else if (r.toY > r.fromY) {
          // Vertical: from bottom edge of fromCell to top edge of toCell
          x1 = r.fromX * cellSize + cellSize / 2;
          x2 = r.toX * cellSize + cellSize / 2;
          y1 = (r.fromY + 1) * cellSize;
          y2 = r.toY * cellSize;
        } else {
          // Fallback to center
          x1 = r.fromX * cellSize + cellSize / 2;
          y1 = r.fromY * cellSize + cellSize / 2;
          x2 = r.toX * cellSize + cellSize / 2;
          y2 = r.toY * cellSize + cellSize / 2;
        }
        
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={r.type === 'companion' ? '#22c55e' : r.type === 'antagonist' ? '#ef4444' : '#f97316'}
            strokeWidth="4"
            strokeDasharray={r.type === 'antagonist' ? '8,4' : r.type === 'spacing' ? '4,4' : undefined}
            opacity="0.8"
          />
        );
      })}
    </svg>
  );
}

// Calculate harvest date from planted date and days to maturity
function calculateHarvestDate(plantedAt: string | undefined, daysToMaturity: number): string | null {
  if (!plantedAt) return null;
  const planted = new Date(plantedAt);
  const harvest = new Date(planted);
  harvest.setDate(harvest.getDate() + daysToMaturity);
  return harvest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Calculate days until harvest
function daysUntilHarvest(plantedAt: string | undefined, daysToMaturity: number): number | null {
  if (!plantedAt) return null;
  const planted = new Date(plantedAt);
  const harvest = new Date(planted);
  harvest.setDate(harvest.getDate() + daysToMaturity);
  const now = new Date();
  const diffTime = harvest.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
function useGardenRelationships(placedPlants: PlacedPlant[]) {
  return useMemo(() => {
    const relationships: { type: 'companion' | 'antagonist' | 'spacing'; fromX: number; fromY: number; toX: number; toY: number }[] = [];
    let companionCount = 0;
    let antagonistCount = 0;
    let spacingWarnings = 0;
    
    for (let i = 0; i < placedPlants.length; i++) {
      for (let j = i + 1; j < placedPlants.length; j++) {
        const plant1 = getPlantById(placedPlants[i].plantId);
        const plant2 = getPlantById(placedPlants[j].plantId);
        
        if (!plant1 || !plant2) continue;
        
        // Calculate distance in cells (only show lines for adjacent plants)
        const dx = Math.abs(placedPlants[i].x - placedPlants[j].x);
        const dy = Math.abs(placedPlants[i].y - placedPlants[j].y);
        const distance = dx + dy; // Manhattan distance (adjacent = 1)
        
        // Only draw lines between adjacent plants (distance of 1)
        if (distance !== 1) continue;
        
        // Check if too close based on combined spacing requirements (convert to inches: 1 cell = 12 inches)
        const minDistance = (plant1.spacing + plant2.spacing) / 2;
        const distanceInInches = distance * 12;
        if (distanceInInches < minDistance) {
          relationships.push({
            type: 'spacing',
            fromX: placedPlants[i].x,
            fromY: placedPlants[i].y,
            toX: placedPlants[j].x,
            toY: placedPlants[j].y,
          });
          spacingWarnings++;
        }
        
        // Check if plant2 is a companion of plant1
        if (plant1.companions.includes(plant2.id)) {
          relationships.push({
            type: 'companion',
            fromX: placedPlants[i].x,
            fromY: placedPlants[i].y,
            toX: placedPlants[j].x,
            toY: placedPlants[j].y,
          });
          companionCount++;
        }
        
        // Check if plant2 is an antagonist of plant1
        if (plant1.antagonists.includes(plant2.id)) {
          relationships.push({
            type: 'antagonist',
            fromX: placedPlants[i].x,
            fromY: placedPlants[i].y,
            toX: placedPlants[j].x,
            toY: placedPlants[j].y,
          });
          antagonistCount++;
        }
        
        // Check reverse (plant1 in plant2's lists)
        if (plant2.companions.includes(plant1.id)) {
          relationships.push({
            type: 'companion',
            fromX: placedPlants[j].x,
            fromY: placedPlants[j].y,
            toX: placedPlants[i].x,
            toY: placedPlants[i].y,
          });
          companionCount++;
        }
        
        if (plant2.antagonists.includes(plant1.id)) {
          relationships.push({
            type: 'antagonist',
            fromX: placedPlants[j].x,
            fromY: placedPlants[j].y,
            toX: placedPlants[i].x,
            toY: placedPlants[i].y,
          });
          antagonistCount++;
        }
      }
    }
    
    // Calculate score
    let score = 70;
    if (placedPlants.length > 1) {
      score += companionCount * 10;
      score -= antagonistCount * 15;
      score -= spacingWarnings * 8;
      score = Math.max(0, Math.min(100, score));
    } else {
      score = 100;
    }
    
    return { relationships, score, companionCount, antagonistCount, spacingWarnings };
  }, [placedPlants]);
}

export default function Home() {
  const { 
    gardenName, 
    setGardenName, 
    gridSize, 
    setGridSize,
    selectedPlantId, 
    setSelectedPlant, 
    clearGarden, 
    placedPlants, 
    placePlant,
    removePlant,
    updatePlantStage,
    undo,
    redo,
    canUndo,
    canRedo,
    exportGarden,
    importGarden,
    importFromShare,
    zone,
    setZone,
    setPlacedPlants,
  } = useGardenStore();
  const [activePlant, setActivePlant] = useState<Plant | null>(null);
  const [showRelationships, setShowRelationships] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vegetable' | 'herb' | 'fruit'>('all');
  const [selectedPlacedPlant, setSelectedPlacedPlant] = useState<{plant: Plant; x: number; y: number} | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('garden');
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [showCostTracker, setShowCostTracker] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showPlantSelector, setShowPlantSelector] = useState(true);
  const [cellPickerOpen, setCellPickerOpen] = useState<{x: number; y: number} | null>(null);
  const [cellPickerCategory, setCellPickerCategory] = useState<'all' | 'vegetable' | 'herb' | 'fruit'>('all');
  
  // Toggle dark mode on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Use a ref to always have fresh placedPlants
  const placedPlantsRef = useRef(placedPlants);
  placedPlantsRef.current = placedPlants;
  
  // Direct plant placement - uses ref to avoid stale closure
  const placePlantDirect = (plantId: string, x: number, y: number) => {
    const currentPlants = placedPlantsRef.current;
    const now = new Date().toISOString();
    const existingIndex = currentPlants.findIndex(p => p.x === x && p.y === y);
    
    if (existingIndex >= 0) {
      const newPlants = [...currentPlants];
      newPlants[existingIndex] = {
        ...newPlants[existingIndex],
        plantId,
        plantedAt: now,
        stage: 'seedling',
      };
      useGardenStore.getState().setPlacedPlants(newPlants);
    } else {
      const newPlant = {
        id: `${plantId}-${x}-${y}-${Date.now()}`,
        plantId,
        x,
        y,
        plantedAt: now,
        stage: 'seedling' as const,
      };
      useGardenStore.getState().setPlacedPlants([...currentPlants, newPlant]);
    }
  };
  
  const { relationships, score, companionCount, antagonistCount, spacingWarnings } = useGardenRelationships(placedPlants);
  
  // Filter plants based on search and category
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      const matchesSearch = searchQuery === '' || 
        plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plant.emoji.includes(searchQuery);
      const matchesCategory = categoryFilter === 'all' || plant.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);
  
  const selectedPlant = selectedPlantId ? getPlantById(selectedPlantId) : null;
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );
  
  const handleDragStart = (event: any) => {
    const { active } = event;
    const plantId = active.data.current?.plantId;
    if (plantId) {
      const plant = getPlantById(plantId);
      if (plant) {
        setActivePlant(plant);
        setSelectedPlant(plantId);
      }
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlant(null);
    
    if (over && selectedPlantId) {
      const x = over.data.current?.x;
      const y = over.data.current?.y;
      if (typeof x === 'number' && typeof y === 'number') {
        placePlant(x, y);
      }
    }
  };
  
  // Export garden to file
  const handleExport = () => {
    const json = exportGarden();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gardenName.replace(/\s+/g, '-').toLowerCase()}-garden.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Import garden from file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importGarden(json);
      if (!success) {
        alert('Failed to import garden. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };
  
  const gardenGridRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Export garden as image
  const handleExportImage = async () => {
    if (!gardenGridRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(gardenGridRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      } as any);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${gardenName.replace(/\s+/g, '-').toLowerCase()}-garden-${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Close mobile menu when selecting a plant on mobile
  useEffect(() => {
    if (isMobile && selectedPlantId) {
      setShowMobileMenu(false);
    }
  }, [selectedPlantId, isMobile]);
  
  // Check for shared garden URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('garden')) {
      const success = importFromShare();
      if (success) {
        alert('Garden loaded from shared link!');
      }
    }
  }, []);
  
  // Get score color
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Create grid cells
  const gridCells = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      gridCells.push(
        <DroppableCell 
          key={`${x}-${y}`} 
          x={x} 
          y={y} 
          showRelationships={showRelationships}
          relationships={relationships}
          onViewDetails={(plant, px, py) => setSelectedPlacedPlant({ plant, x: px, y: py })}
          isMobile={isMobile}
          onHover={(cx, cy) => setHoveredCell(cx >= 0 ? { x: cx, y: cy } : null)}
          onCellTap={(cx, cy) => setCellPickerOpen({ x: cx, y: cy })}
        />
      );
    }
  }
  
  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <WelcomeModal />
      <Tutorial onComplete={() => {}} />
      <SideNav activeTab={activeTab} onTabChange={setActiveTab} darkMode={darkMode} />
      <main className={`min-h-screen p-3 md:p-8 bg-gradient-to-b from-green-50 to-white dark:from-green-900 dark:to-gray-900 transition-colors ${!isMobile ? 'ml-16 md:ml-52' : 'pb-20'}`}>
        <div className="max-w-6xl mx-auto">
          
          {/* Only show header on Garden tab */}
          {activeTab === 'garden' && (
          <>
          {/* Header */}
          <header className="mb-4 md:mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl md:text-3xl font-bold text-green-800 dark:text-green-400 flex items-center gap-2">
                <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                  <rect x="2" y="2" width="16" height="16" rx="3" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2"/>
                  <rect x="22" y="2" width="16" height="16" rx="3" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2"/>
                  <rect x="2" y="22" width="16" height="16" rx="3" fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2"/>
                  <rect x="22" y="22" width="16" height="16" rx="3" fill="#16a34a" stroke="#16a34a" strokeWidth="2"/>
                  <path d="M30 30L34 34M30 34L34 30" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
                GardenGrid
              </h1>
              <input
                type="text"
                value={gardenName}
                onChange={(e) => setGardenName(e.target.value)}
                className="text-sm md:text-xl font-semibold text-gray-700 dark:text-gray-200 bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:outline-none px-2 py-1 flex-1 min-w-[120px] max-w-xs"
                placeholder="Garden name..."
              />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-xs md:text-base">
              Drag plants onto the grid. Green = companions, Red = avoid!
            </p>
          </header>
          </>
          )}

          {/* Dark mode toggle - fixed position on desktop */}
          {!isMobile && (
            <button
              id="dark-mode"
              onClick={() => setDarkMode(!darkMode)}
              className="fixed top-4 right-4 z-40 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          )}
          
          {/* Show alternative content based on active tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">📅 Planting Calendar</h2>
                <PlantingCalendar placedPlants={placedPlants} />
              </div>
              <SuccessionPlanting />
              <MoonPhaseGardening />
              <GardenReminders />
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <GardenHealthScore />
              <GardenStats placedPlants={placedPlants} />
              <YieldTracker />
              <GardenTips placedPlants={placedPlants} />
              <GardenAnalytics placedPlants={placedPlants} />
            </div>
          )}
          
          {activeTab === 'weather' && (
            <div className="space-y-4">
              <WeatherWidget zone={zone} />
            </div>
          )}
          
          {activeTab === 'journal' && (
            <div className="space-y-4">
              <GardenJournal />
              <GardenTasks />
              <GardenPhotoGallery />
            </div>
          )}
          
          {activeTab === 'pests' && (
            <div className="space-y-4">
              <PestTracker />
            </div>
          )}
          
          {activeTab === 'rotation' && (
            <div className="space-y-4">
              <CropRotationPlanner />
            </div>
          )}
          
          {activeTab === 'assistant' && (
            <div className="space-y-4">
              <GardenAssistant />
            </div>
          )}
          
          {activeTab === 'seeds' && (
            <div className="space-y-4">
              <SeedVault />
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">⚙️ Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">USDA Zone</label>
                    <select
                      value={zone}
                      onChange={(e) => setZone(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      {[3,4,5,6,7,8,9,10,11].map(z => (
                        <option key={z} value={z}>Zone {z}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                    >
                      {darkMode ? '☀️' : '🌙'}
                    </button>
                  </div>
                </div>
              </div>
              <GardenManager />
              <GardenShare />
              
              {/* Backup & Import/Export Button */}
              <button
                onClick={() => setShowBackup(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>💾</span> Backup & Import
              </button>
              
              <GardenBackup isOpen={showBackup} onClose={() => setShowBackup(false)} />
              
              {/* Cost Tracker Button */}
              <button
                onClick={() => setShowCostTracker(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>💰</span> Garden Cost Tracker
              </button>
              
              <GardenCostTracker isOpen={showCostTracker} onClose={() => setShowCostTracker(false)} />
            </div>
          )}
          
          {/* Garden tab content */}
          {activeTab === 'garden' && (
          <>
          
          {/* Responsive layout: plant selector left on desktop, grid first on mobile */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            
            {/* Plant Selector Sidebar - BEFORE grid on desktop, AFTER on mobile */}
            <aside id="plant-picker" className={`w-full md:w-64 md:flex-shrink-0 space-y-3 ${isMobile ? 'order-2' : 'order-1'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <span>🪴</span> Plants
                </h2>
                
                {/* Search */}
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {(['all', 'vegetable', 'herb', 'fruit'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        categoryFilter === cat
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-200'
                      }`}
                    >
                      {cat === 'all' ? '🌱' : cat === 'vegetable' ? '🥬' : cat === 'herb' ? '🌿' : '🍓'}
                    </button>
                  ))}
                </div>
                
                {/* Plant List */}
                <div className="space-y-1 max-h-48 md:max-h-96 overflow-y-auto pr-1">
                  {filteredPlants.slice(0, isMobile ? 12 : 40).map((plant) => (
                    <button
                      key={plant.id}
                      onClick={() => setSelectedPlant(plant.id === selectedPlantId ? null : plant.id)}
                      className={`flex items-center gap-2 w-full p-2 rounded-lg text-left ${
                        selectedPlantId === plant.id 
                          ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500' 
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="text-xl">{plant.emoji}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-200">{plant.name}</span>
                    </button>
                  ))}
                </div>
                
                {filteredPlants.length > (isMobile ? 12 : 40) && (
                  <p className="text-xs text-gray-400 mt-2 text-center">+{filteredPlants.length - (isMobile ? 12 : 40)} more</p>
                )}
              </div>
              
              {/* Quick Actions */}
              <div id="save-export" className="flex gap-2">
                <button onClick={undo} disabled={!canUndo()} className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm disabled:opacity-40">↩️ Undo</button>
                <button onClick={redo} disabled={!canRedo()} className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm disabled:opacity-40">↪️ Redo</button>
                <button onClick={clearGarden} className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg text-sm">🗑️</button>
              </div>
              
              {/* Themes */}
              <GardenThemes />
            </aside>
            
            {/* Garden Grid - AFTER plant selector on desktop, FIRST on mobile */}
            <div className={`flex-1 ${isMobile ? 'order-1' : 'order-2'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 md:p-4">
                <div className="flex justify-between items-center gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-700 dark:text-gray-200">🌿 My Garden</h2>
                    <select
                      value={gridSize}
                      onChange={(e) => setGridSize(Number(e.target.value))}
                      className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded px-2 py-1"
                    >
                      <option value={4}>4×4</option>
                      <option value={8}>8×8</option>
                      <option value={12}>12×12</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{placedPlants.length} plants</span>
                    <SaveIndicator />
                  </div>
                </div>
                
                {/* Harmony Score */}
                {placedPlants.length > 0 && (
                  <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Harmony: <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span></span>
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-600">✓{companionCount}</span>
                        <span className="text-red-600">✗{antagonistCount}</span>
                      </div>
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                )}
                
                {/* Grid */}
                <div id="garden-grid" className="relative overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
                  <div 
                    ref={gardenGridRef}
                    className="grid gap-0.5 md:gap-1 bg-gray-200 dark:bg-gray-600 p-0.5 md:p-1 rounded mx-auto"
                    style={{ 
                      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                      width: '100%',
                      maxWidth: isMobile ? 'calc(100vw - 32px)' : '600px',
                      aspectRatio: '1 / 1'
                    }}
                  >
                    {gridCells}
                  </div>
                  {/* Relationship lines now shown as indicators on cells instead */}
                </div>
                
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {isMobile ? 'Tap cell to plant • Tap again to change stage' : 'Click cell to place plant • Click again to change stage'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Mobile Cell Plant Picker Modal */}
          {cellPickerOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
              <div className="bg-white dark:bg-gray-800 w-full md:w-96 md:max-w-[90vw] md:rounded-2xl rounded-t-2xl max-h-[70vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Pick a Plant</h3>
                  <button onClick={() => setCellPickerOpen(null)} className="text-gray-500 text-xl">✕</button>
                </div>
                
                {/* Category tabs */}
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {(['all', 'vegetable', 'herb', 'fruit'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCellPickerCategory(cat)}
                      className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap ${
                        cellPickerCategory === cat
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {cat === 'all' ? '🌱 All' : cat === 'vegetable' ? '🥬 Veg' : cat === 'herb' ? '🌿 Herb' : '🍓 Fruit'}
                    </button>
                  ))}
                </div>
                
                {/* Plant grid */}
                <div className="p-3 overflow-y-auto max-h-80">
                  <div className="grid grid-cols-4 gap-2">
                    {plants.filter(p => cellPickerCategory === 'all' || p.category === cellPickerCategory).slice(0, 20).map((plant) => (
                      <button
                        key={plant.id}
                        onClick={() => {
                          placePlantDirect(plant.id, cellPickerOpen.x, cellPickerOpen.y);
                          setSelectedPlant(null); // Clear to prevent moving plant on next tap
                          setCellPickerOpen(null);
                        }}
                        className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <span className="text-2xl">{plant.emoji}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-300 mt-1">{plant.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => setCellPickerOpen(null)}
                    className="w-full py-2 text-gray-500 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
          )}
        </div>
      </main>
      
      <div id="nav-tabs">
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      <DragOverlay>
        {activePlant && <DragOverlayPlant plant={activePlant} />}
      </DragOverlay>
      
      {/* Plant Details Modal */}
      {selectedPlacedPlant && (
        <PlantDetailsModal
          plant={selectedPlacedPlant.plant}
          position={{ x: selectedPlacedPlant.x, y: selectedPlacedPlant.y }}
          onClose={() => setSelectedPlacedPlant(null)}
          onRemove={() => {
            removePlant(selectedPlacedPlant.x, selectedPlacedPlant.y);
            setSelectedPlacedPlant(null);
          }}
        />
      )}
    </DndContext>
  );
}
