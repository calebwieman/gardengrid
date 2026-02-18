'use client';

import { useState, useMemo } from 'react';

interface MoonPhase {
  name: string;
  emoji: string;
  description: string;
  plantingAdvice: string;
}

const MOON_PHASES: MoonPhase[] = [
  { 
    name: 'New Moon', 
    emoji: '🌑', 
    description: 'Moon is not visible',
    plantingAdvice: 'Best for resting soil and planning. Avoid planting.'
  },
  { 
    name: 'Waxing Crescent', 
    emoji: '🌒', 
    description: 'Moon is growing',
    plantingAdvice: 'Good for leafy greens, cereals, and grains.'
  },
  { 
    name: 'First Quarter', 
    emoji: '🌓', 
    description: 'Half moon, growing',
    plantingAdvice: 'Good for fruits and vegetables with seeds inside.'
  },
  { 
    name: 'Waxing Gibbous', 
    emoji: '🌔', 
    description: 'Almost full, still growing',
    plantingAdvice: 'Continue planting fruiting vegetables.'
  },
  { 
    name: 'Full Moon', 
    emoji: '🌕', 
    description: 'Moon is fully illuminated',
    plantingAdvice: 'Best for root crops and transplanting.'
  },
  { 
    name: 'Waning Gibbous', 
    emoji: '🌖', 
    description: 'Moon past full, decreasing',
    plantingAdvice: 'Good for planting bulbs and perennials.'
  },
  { 
    name: 'Last Quarter', 
    emoji: '🌗', 
    description: 'Half moon, decreasing',
    plantingAdvice: 'Best for pruning, harvesting, and pest control.'
  },
  { 
    name: 'Waning Crescent', 
    emoji: '🌘', 
    description: 'Almost new moon',
    plantingAdvice: 'Rest period - prepare soil and compost.'
  },
];

function getMoonPhase(date: Date): MoonPhase {
  // Simplified moon phase calculation
  // Moon cycle is approximately 29.53 days
  const lunarCycle = 29.53058867;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z'); // Known new moon
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceNewMoon % lunarCycle;
  const phaseIndex = Math.floor((lunarAge / lunarCycle) * 8) % 8;
  return MOON_PHASES[phaseIndex];
}

function getMoonEmoji(phase: number): string {
  const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
  return phases[phase];
}

export default function MoonPhaseGardening() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const moonPhase = useMemo(() => getMoonPhase(selectedDate), [selectedDate]);
  
  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });
  
  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };
  
  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };
  
  const goToToday = () => setSelectedDate(new Date());
  
  const isToday = selectedDate.toDateString() === today.toDateString();
  
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-xl shadow-lg p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <span className="text-xl">🌙</span> Moon Gardening
        </h3>
        <button
          onClick={goToToday}
          className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
        >
          Today
        </button>
      </div>
      
      {/* Current Phase Display */}
      <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="text-5xl filter drop-shadow-lg">{moonPhase.emoji}</div>
          <div>
            <h4 className="font-semibold text-lg">{moonPhase.name}</h4>
            <p className="text-white/70 text-sm">{moonPhase.description}</p>
          </div>
        </div>
        
        {/* Advice Box */}
        <div className="mt-3 p-3 bg-green-500/20 rounded-lg border border-green-400/30">
          <p className="text-sm text-green-100">💡 {moonPhase.plantingAdvice}</p>
        </div>
      </div>
      
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevDay}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          ◀
        </button>
        <span className="font-medium">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
        <button
          onClick={nextDay}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          ▶
        </button>
      </div>
      
      {/* 7-Day Overview */}
      <div className="space-y-1">
        <p className="text-xs text-white/50 mb-2">This Week</p>
        {next7Days.map((date, i) => {
          const phase = getMoonPhase(date);
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isTodayDate = date.toDateString() === today.toDateString();
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                isSelected 
                  ? 'bg-white/30' 
                  : isTodayDate
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'hover:bg-white/5'
              }`}
            >
              <span className="text-sm text-white/70">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-lg">{phase.emoji}</span>
              <span className={`text-xs ${isTodayDate ? 'text-green-300' : 'text-white/50'}`}>
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Quick Tips */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-white/50 mb-2">Quick Guide</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/5 p-2 rounded">
            <span className="text-green-300">🌱</span> Above-ground crops
          </div>
          <div className="bg-white/5 p-2 rounded">
            <span className="text-amber-300">🥕</span> Root crops
          </div>
          <div className="bg-white/5 p-2 rounded">
            <span className="text-purple-300">🌸</span> Flowering plants
          </div>
          <div className="bg-white/5 p-2 rounded">
            <span className="text-red-300">✂️</span> Pruning time
          </div>
        </div>
      </div>
    </div>
  );
}
