'use client';

import { useState, useMemo, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, useDraggable, useDroppable, TouchSensor } from '@dnd-kit/core';
import { useGardenStore, PlacedPlant } from '@/stores/gardenStore';
import { plants, getPlantById, Plant } from '@/lib/plants';
import PlantingCalendar from '@/components/PlantingCalendar';
import SaveIndicator from '@/components/SaveIndicator';
import GardenStats from '@/components/GardenStats';
import GardenTips from '@/components/GardenTips';
import GardenTemplates from '@/components/GardenTemplates';
import WelcomeModal from '@/components/WelcomeModal';

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
        className={`flex items-center gap-2 w-full p-2 rounded-lg text-left transition-all ${
          isSelected 
            ? 'bg-green-100 border-2 border-green-500' 
            : 'bg-white border border-gray-200 hover:bg-gray-50'
        } ${isDragging ? 'opacity-50' : ''}`}
        style={style}
      >
        <span className="text-2xl">{plant.emoji}</span>
        <span className="font-medium text-gray-700">{plant.name}</span>
        <span className="text-xs text-gray-400 ml-auto">{plant.category}</span>
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

function DroppableCell({ x, y, showRelationships, relationships }: { 
  x: number; 
  y: number;
  showRelationships: boolean;
  relationships: { type: 'companion' | 'antagonist' | 'spacing'; fromX: number; fromY: number; toX: number; toY: number }[];
}) {
  const { placedPlants, selectedPlantId, placePlant, removePlant } = useGardenStore();
  
  const placedPlant = placedPlants.find(p => p.x === x && p.y === y);
  const plantData = placedPlant ? getPlantById(placedPlant.plantId) : null;
  
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${x}-${y}`,
    data: { type: 'cell', x, y },
  });
  
  const handleClick = () => {
    if (placedPlant) {
      removePlant(x, y);
    } else if (selectedPlantId) {
      placePlant(x, y);
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
      className={`aspect-square rounded cursor-pointer transition-all flex items-center justify-center text-2xl relative
        ${isOver && selectedPlantId ? 'ring-2 ring-green-400 ring-inset' : ''}
        ${plantData 
          ? '' 
          : selectedPlantId 
            ? 'bg-green-50 hover:bg-green-100 border border-green-200' 
            : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
        }
      `}
      style={{ 
        backgroundColor: plantData ? plantData.color + '40' : undefined,
      }}
      title={plantData ? plantData.name : (selectedPlantId ? 'Drop to plant' : 'Select a plant first')}
    >
      {plantData?.emoji}
      
      {/* Relationship indicators */}
      {showRelationships && cellRelationships.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {cellRelationships.map((r, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full border-2 border-white ${
                r.type === 'companion' ? 'bg-green-500' : r.type === 'antagonist' ? 'bg-red-500' : 'bg-orange-400'
              }`}
              style={{
                top: r.fromX === x && r.fromY === y ? '5%' : 
                     r.toX === x && r.toY === y ? '85%' : '50%',
                left: r.fromX === x && r.fromY === y ? '85%' : 
                      r.toX === x && r.toY === y ? '5%' : '50%',
              }}
            />
          ))}
        </div>
      )}
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
  cellSize 
}: { 
  relationships: { type: 'companion' | 'antagonist' | 'spacing'; fromX: number; fromY: number; toX: number; toY: number }[];
  cellSize: number;
}) {
  if (relationships.length === 0) return null;
  
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ padding: '4px' }}>
      {relationships.map((r, i) => {
        const x1 = r.fromX * cellSize + cellSize / 2;
        const y1 = r.fromY * cellSize + cellSize / 2;
        const x2 = r.toX * cellSize + cellSize / 2;
        const y2 = r.toY * cellSize + cellSize / 2;
        
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={r.type === 'companion' ? '#22c55e' : r.type === 'antagonist' ? '#ef4444' : '#f97316'}
            strokeWidth="3"
            strokeDasharray={r.type === 'antagonist' ? '8,4' : r.type === 'spacing' ? '4,4' : undefined}
            opacity="0.7"
          />
        );
      })}
    </svg>
  );
}

// Calculate relationships and compatibility score
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
        
        // Calculate distance in cells (1 cell = 1 foot = 12 inches)
        const dx = Math.abs(placedPlants[i].x - placedPlants[j].x);
        const dy = Math.abs(placedPlants[i].y - placedPlants[j].y);
        const distanceInFeet = Math.sqrt(dx * dx + dy * dy);
        const distanceInInches = distanceInFeet * 12;
        
        // Check if too close based on combined spacing requirements
        const minDistance = (plant1.spacing + plant2.spacing) / 2;
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
    undo,
    redo,
    canUndo,
    canRedo,
    exportGarden,
    importGarden,
  } = useGardenStore();
  const [activePlant, setActivePlant] = useState<Plant | null>(null);
  const [showRelationships, setShowRelationships] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vegetable' | 'herb' | 'fruit'>('all');
  
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
  
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
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
      <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-green-800">🌱 GardenGrid</h1>
              <input
                type="text"
                value={gardenName}
                onChange={(e) => setGardenName(e.target.value)}
                className="text-lg md:text-xl font-semibold text-gray-700 bg-transparent border-b-2 border-gray-300 focus:border-green-500 focus:outline-none px-2 py-1 flex-1 max-w-xs"
                placeholder="Garden name..."
              />
              {/* Mobile menu toggle */}
              {isMobile && (
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 bg-green-500 text-white rounded-lg"
                >
                  {showMobileMenu ? '✕' : '☰'}
                </button>
              )}
            </div>
            <p className="text-gray-600 text-sm md:text-base">
              Drag plants onto the grid. Green lines = good companions, Red dashed = bad neighbors!
            </p>
          </header>
          
          {/* Main content - responsive layout */}
          <div className={`flex flex-col md:flex-row gap-4 md:gap-8 ${isMobile && !showMobileMenu ? 'hidden' : ''}`}>
            {/* Plant Selector Sidebar */}
            <aside className={`w-full md:w-64 flex-shrink-0 space-y-4 ${isMobile ? 'order-2' : ''}`}>
              <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="text-xl">🪴</span> Plants
                </h2>
                
                {/* Search */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Search plants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:bg-white transition-colors"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex gap-1 mb-4">
                  {(['all', 'vegetable', 'herb', 'fruit'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`flex-1 px-2 py-1 text-xs rounded-full transition-colors ${
                        categoryFilter === cat
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? '🌱 All' : cat === 'vegetable' ? '🥬 Veg' : cat === 'herb' ? '🌿 Herb' : '🍓 Fruit'}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-2 max-h-48 md:max-h-80 overflow-y-auto pr-1">
                  {filteredPlants.map((plant) => (
                    <DraggablePlant key={plant.id} plant={plant} />
                  ))}
                </div>
                
                {selectedPlant && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>{selectedPlant.emoji} {selectedPlant.name}</strong>
                      <br />
                      Spacing: {selectedPlant.spacing}&quot;
                      <br />
                      Sun: {selectedPlant.sunNeeds.replace('-', ' ')}
                      <br />
                      Days: {selectedPlant.daysToMaturity}
                    </p>
                    <div className="mt-2 text-xs">
                      <p className="font-medium">Good with:</p>
                      <p className="text-green-600">
                        {selectedPlant.companions.map(id => getPlantById(id)?.emoji).join(' ')}
                      </p>
                      <p className="font-medium mt-1">Avoid:</p>
                      <p className="text-red-600">
                        {selectedPlant.antagonists.map(id => getPlantById(id)?.emoji).join(' ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={clearGarden}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowRelationships(!showRelationships)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    showRelationships 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  {showRelationships ? 'Lines On' : 'Lines Off'}
                </button>
              </div>
              
              {/* Undo/Redo */}
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={!canUndo()}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Undo (Ctrl+Z)"
                >
                  ↩️ Undo
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo()}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Redo (Ctrl+Y)"
                >
                  ↪️ Redo
                </button>
              </div>
              
              {/* Export/Import */}
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  📥 Export
                </button>
                <label className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-center cursor-pointer">
                  📤 Import
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImport} 
                    className="hidden" 
                  />
                </label>
              </div>
              
              {/* Garden Templates */}
              <GardenTemplates />
              
              {/* Planting Calendar */}
              <PlantingCalendar placedPlants={placedPlants} />
              
              {/* Garden Stats */}
              <GardenStats placedPlants={placedPlants} />
              
              {/* Growing Tips */}
              <GardenTips placedPlants={placedPlants} />
            </aside>
            
            {/* Garden Grid */}
            <div className="flex-1 order-1 md:order-2">
              <div className="bg-white rounded-xl shadow-md p-3 md:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-xl">🌿</span> My Garden
                    </h2>
                    <select
                      value={gridSize}
                      onChange={(e) => setGridSize(Number(e.target.value))}
                      className="text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-green-500"
                    >
                      <option value={4}>4×4</option>
                      <option value={8}>8×8</option>
                      <option value={12}>12×12</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{placedPlants.length} plants</span>
                    <SaveIndicator />
                  </div>
                </div>
                
                {/* Compatibility Score */}
                {placedPlants.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-sm text-gray-600">Garden Harmony: </span>
                        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                        <span className="text-green-600">✓ {companionCount} companions</span>
                        <span className="text-red-600">✗ {antagonistCount} conflicts</span>
                        {spacingWarnings > 0 && <span className="text-orange-500">⚠ {spacingWarnings} spacing</span>}
                      </div>
                    </div>
                    {/* Score bar */}
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Grid with relationship lines */}
                <div className="relative overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
                  <div 
                    className="grid gap-1 bg-gray-200 p-1 rounded mx-auto"
                    style={{ 
                      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                      maxWidth: '100%',
                      width: 'fit-content'
                    }}
                  >
                    {gridCells}
                  </div>
                  <RelationshipLines relationships={relationships} cellSize={isMobile ? (gridSize === 4 ? 60 : gridSize === 8 ? 35 : 28) : gridSize === 4 ? 100 : gridSize === 8 ? 50 : 35} />
                </div>
                
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Each cell = 1 sq ft • Green lines = companions • Red dashed = avoid
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <DragOverlay>
        {activePlant && <DragOverlayPlant plant={activePlant} />}
      </DragOverlay>
    </DndContext>
  );
}
