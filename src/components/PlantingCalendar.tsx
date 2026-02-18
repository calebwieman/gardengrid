'use client';

import { useState, useMemo } from 'react';
import { useGardenStore, PlacedPlant } from '@/stores/gardenStore';
import { plants, getPlantById, zones, getZoneData, Plant } from '@/lib/plants';

interface CalendarEvent {
  plant: Plant;
  type: 'start-indoors' | 'transplant' | 'direct-sow' | 'harvest';
  date: Date;
  week: number;
}

function PlantingCalendar({ placedPlants }: { placedPlants: PlacedPlant[] }) {
  const [zone, setZone] = useState(6);
  const zoneData = getZoneData(zone);
  
  // Parse last frost date
  const [month, day] = zoneData.lastFrost.split(' ');
  const lastFrostMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
  const lastFrostDay = parseInt(day);
  
  // Generate calendar events for all placed plants
  const events = useMemo(() => {
    const result: CalendarEvent[] = [];
    const plantIds = placedPlants.map(p => p.plantId);
    const uniquePlantIds = Array.from(new Set(plantIds));
    
    uniquePlantIds.forEach(plantId => {
      const plant = getPlantById(plantId);
      if (!plant) return;
      
      const lastFrost = new Date(2024, lastFrostMonth, lastFrostDay);
      
      // Start indoors
      if (plant.startIndoorsWeeks > 0) {
        const startDate = new Date(lastFrost);
        startDate.setDate(startDate.getDate() - (plant.startIndoorsWeeks * 7));
        result.push({
          plant,
          type: 'start-indoors',
          date: startDate,
          week: plant.startIndoorsWeeks,
        });
      }
      
      // Transplant
      if (plant.transplantWeeks > 0) {
        const transplantDate = new Date(lastFrost);
        transplantDate.setDate(transplantDate.getDate() + (plant.transplantWeeks * 7));
        result.push({
          plant,
          type: 'transplant',
          date: transplantDate,
          week: plant.transplantWeeks,
        });
      }
      
      // Direct sow
      if (plant.transplantWeeks === 0 && plant.startIndoorsWeeks === 0) {
        const sowDate = new Date(lastFrost);
        result.push({
          plant,
          type: 'direct-sow',
          date: sowDate,
          week: 0,
        });
      }
      
      // Harvest (from transplant or sow date)
      const harvestDate = new Date(lastFrost);
      if (plant.transplantWeeks > 0) {
        harvestDate.setDate(harvestDate.getDate() + (plant.transplantWeeks * 7) + plant.daysToMaturity);
      } else {
        harvestDate.setDate(harvestDate.getDate() + plant.daysToMaturity);
      }
      result.push({
        plant,
        type: 'harvest',
        date: harvestDate,
        week: plant.transplantWeeks + Math.ceil(plant.daysToMaturity / 7),
      });
    });
    
    // Sort by date
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [placedPlants, lastFrostMonth, lastFrostDay]);
  
  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'start-indoors': return '🏠';
      case 'transplant': return '🪴';
      case 'direct-sow': return '🌱';
      case 'harvest': return '🧺';
    }
  };
  
  const getEventLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'start-indoors': return 'Start indoors';
      case 'transplant': return 'Transplant outside';
      case 'direct-sow': return 'Direct sow';
      case 'harvest': return 'Expected harvest';
    }
  };
  
  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };
  
  const formatDateFull = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };
  
  if (placedPlants.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-700 mb-3">📅 Planting Calendar</h3>
        <p className="text-sm text-gray-500">Add plants to see your personalized planting schedule.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-700 mb-3">📅 Planting Calendar</h3>
      
      {/* Zone Selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 block mb-1">Your USDA Zone:</label>
        <select
          value={zone}
          onChange={(e) => setZone(Number(e.target.value))}
          className="w-full text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-green-500"
        >
          {zones.map(z => (
            <option key={z.zone} value={z.zone}>Zone {z.zone} (Last frost: {z.lastFrost})</option>
          ))}
        </select>
      </div>
      
      {/* Events List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.map((event, i) => (
          <div 
            key={i} 
            className={`p-2 rounded-lg text-sm flex items-center gap-2 ${
              event.type === 'harvest' ? 'bg-amber-50 border border-amber-200' :
              event.type === 'transplant' ? 'bg-blue-50 border border-blue-200' :
              event.type === 'direct-sow' ? 'bg-green-50 border border-green-200' :
              'bg-purple-50 border border-purple-200'
            }`}
          >
            <span className="text-lg">{getEventIcon(event.type)}</span>
            <div>
              <p className="font-medium text-gray-700">
                {event.plant.emoji} {event.plant.name}
              </p>
              <p className="text-xs text-gray-600">
                {getEventLabel(event.type)} • {formatDateFull(event.date)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-400 mt-3">
        * Dates based on average last frost for Zone {zone}
      </p>
    </div>
  );
}

export default PlantingCalendar;
