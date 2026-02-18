'use client';

import { useState, useEffect } from 'react';

// USDA Zone data with frost dates
const USDA_ZONES: Record<number, { name: string; lastFrost: string; firstFrost: string }> = {
  3: { name: 'Zone 3', lastFrost: 'May 15', firstFrost: 'September 15' },
  4: { name: 'Zone 4', lastFrost: 'May 1', firstFrost: 'October 1' },
  5: { name: 'Zone 5', lastFrost: 'April 15', firstFrost: 'October 15' },
  6: { name: 'Zone 6', lastFrost: 'April 1', firstFrost: 'October 30' },
  7: { name: 'Zone 7', lastFrost: 'March 15', firstFrost: 'November 15' },
  8: { name: 'Zone 8', lastFrost: 'March 1', firstFrost: 'November 30' },
  9: { name: 'Zone 9', lastFrost: 'February 15', firstFrost: 'December 15' },
  10: { name: 'Zone 10', lastFrost: 'January 15', firstFrost: 'December 30' },
  11: { name: 'Zone 11', lastFrost: 'No frost', firstFrost: 'No frost' },
};

// Weather condition icons
const WEATHER_ICONS: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  partlyCloudy: '⛅',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '🌨️',
};

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  forecast: { day: string; high: number; low: number; condition: string }[];
}

interface WeatherWidgetProps {
  zone: number;
}

// Mock weather data (in production, this would come from a weather API)
function getWeatherData(zone: number): WeatherData {
  const month = new Date().getMonth();
  const isSpring = month >= 2 && month <= 4;
  const isSummer = month >= 5 && month <= 7;
  const isFall = month >= 8 && month <= 10;
  
  // Base temperature on zone and season
  let baseTemp = 65;
  if (zone <= 5) baseTemp = isSpring ? 55 : isSummer ? 75 : isFall ? 50 : 35;
  else if (zone <= 7) baseTemp = isSpring ? 60 : isSummer ? 80 : isFall ? 55 : 42;
  else baseTemp = isSpring ? 70 : isSummer ? 85 : isFall ? 65 : 55;
  
  const zoneAdjustment = (zone - 6) * 3;
  baseTemp += zoneAdjustment;
  
  const conditions = ['sunny', 'partlyCloudy', 'cloudy', 'rainy'];
  const currentCondition = conditions[Math.floor(Math.random() * (isSpring ? 2 : 4))];
  
  const forecastDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  
  const forecast = [];
  for (let i = 0; i < 5; i++) {
    const dayIndex = (today + i) % 7;
    const variation = Math.random() * 10 - 5;
    forecast.push({
      day: forecastDays[dayIndex],
      high: Math.round(baseTemp + variation),
      low: Math.round(baseTemp - 10 + variation),
      condition: conditions[Math.floor(Math.random() * 4)],
    });
  }
  
  return {
    temp: Math.round(baseTemp),
    condition: currentCondition,
    humidity: Math.round(40 + Math.random() * 40),
    wind: Math.round(5 + Math.random() * 15),
    forecast,
  };
}

export default function WeatherWidget({ zone }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWeather(getWeatherData(zone));
      setLoading(false);
    }, 300);
  }, [zone]);
  
  const zoneData = USDA_ZONES[zone] || USDA_ZONES[6];
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  const currentDay = now.getDate();
  
  // Calculate days until next frost
  const getDaysUntilFrost = () => {
    const [frostMonthStr, frostDayStr] = currentMonth < 5 || (currentMonth === 5 && currentDay < 15)
      ? zoneData.lastFrost.split(' ')
      : zoneData.firstFrost.split(' ');
    
    const frostMonth = parseInt(frostMonthStr) - 1; // Convert to 0-indexed
    const frostDay = parseInt(frostDayStr);
    
    const frostDate = new Date(now.getFullYear(), frostMonth, frostDay);
    if (frostDate < now) {
      frostDate.setFullYear(frostDate.getFullYear() + 1);
    }
    
    const diffTime = frostDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysUntilFrost = getDaysUntilFrost();
  const isSpring = currentMonth >= 2 && currentMonth <= 4;
  const isFall = currentMonth >= 8 && currentMonth <= 10;
  
  // Planting advice based on zone and season
  const getPlantingAdvice = () => {
    if (isSpring && daysUntilFrost > 30) {
      return { text: 'Start seeds indoors soon!', type: 'info' };
    } else if (isSpring && daysUntilFrost > 14 && daysUntilFrost <= 30) {
      return { text: 'Direct sow cold-hardy crops', type: 'success' };
    } else if (isSpring && daysUntilFrost <= 14) {
      return { text: 'Safe to transplant warm-season crops', type: 'success' };
    } else if (isFall && daysUntilFrost > 60) {
      return { text: 'Time to plant fall crops', type: 'success' };
    } else if (isFall && daysUntilFrost <= 30) {
      return { text: 'Harvest tender crops before frost', type: 'warning' };
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      return { text: 'Main growing season - keep watered!', type: 'info' };
    } else {
      return { text: 'Plan next season\'s garden', type: 'info' };
    }
  };
  
  const advice = getPlantingAdvice();
  
  if (loading || !weather) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-5 w-20 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
        <span>🌤️</span> Weather & Frost
      </h3>
      
      {/* Current Weather */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <span className="text-4xl">{WEATHER_ICONS[weather.condition] || '🌤️'}</span>
        <div>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{weather.temp}°F</p>
          <p className="text-sm text-gray-500 capitalize">{weather.condition.replace(/([A-Z])/g, ' $1').trim()}</p>
        </div>
        <div className="ml-auto text-right text-xs text-gray-500">
          <p>💧 {weather.humidity}%</p>
          <p>💨 {weather.wind} mph</p>
        </div>
      </div>
      
      {/* 5-Day Forecast */}
      <div className="flex justify-between mb-4">
        {weather.forecast.map((day, i) => (
          <div key={i} className="text-center">
            <p className="text-xs text-gray-500">{i === 0 ? 'Today' : day.day}</p>
            <p className="text-xl my-1">{WEATHER_ICONS[day.condition] || '🌤️'}</p>
            <p className="text-xs">
              <span className="text-gray-800 dark:text-gray-200">{day.high}°</span>
              <span className="text-gray-400"> / {day.low}°</span>
            </p>
          </div>
        ))}
      </div>
      
      {/* Frost Dates */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Last Frost</p>
            <p className="font-medium text-gray-700 dark:text-gray-200">{zoneData.lastFrost}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">First Frost</p>
            <p className="font-medium text-gray-700 dark:text-gray-200">{zoneData.firstFrost}</p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <p className={`text-sm font-medium ${
            daysUntilFrost <= 14 ? 'text-red-600' :
            daysUntilFrost <= 30 ? 'text-orange-600' :
            'text-green-600'
          }`}>
            {daysUntilFrost <= 30 ? `⚠️ ${daysUntilFrost} days until frost` : `✅ ${daysUntilFrost} days until frost`}
          </p>
        </div>
      </div>
      
      {/* Planting Advice */}
      <div className={`rounded-lg p-3 ${
        advice.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
        advice.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
        'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      }`}>
        <p className="text-sm font-medium">💡 {advice.text}</p>
      </div>
      
      {/* Zone Info */}
      <p className="text-xs text-gray-400 mt-3 text-center">
        Based on USDA Zone {zone} ({zoneData.name})
      </p>
    </div>
  );
}
