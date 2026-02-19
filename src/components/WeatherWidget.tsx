'use client';

import { useState, useEffect } from 'react';

// USDA Zone data with frost dates (approximate by latitude)
const USDA_ZONES: Record<number, { name: string; lastFrost: string; firstFrost: string; latRange: [number, number] }> = {
  3: { name: 'Zone 3', lastFrost: 'May 15', firstFrost: 'September 15', latRange: [47, 51] },
  4: { name: 'Zone 4', lastFrost: 'May 1', firstFrost: 'October 1', latRange: [43, 47] },
  5: { name: 'Zone 5', lastFrost: 'April 15', firstFrost: 'October 15', latRange: [39, 43] },
  6: { name: 'Zone 6', lastFrost: 'April 1', firstFrost: 'October 30', latRange: [35, 39] },
  7: { name: 'Zone 7', lastFrost: 'March 15', firstFrost: 'November 15', latRange: [31, 35] },
  8: { name: 'Zone 8', lastFrost: 'March 1', firstFrost: 'November 30', latRange: [26, 31] },
  9: { name: 'Zone 9', lastFrost: 'February 15', firstFrost: 'December 15', latRange: [21, 26] },
  10: { name: 'Zone 10', lastFrost: 'January 15', firstFrost: 'December 30', latRange: [16, 21] },
  11: { name: 'Zone 11', lastFrost: 'No frost', firstFrost: 'No frost', latRange: [0, 16] },
};

// Weather code to condition and icon mapping (WMO codes)
const WEATHER_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear', icon: '☀️' },
  1: { condition: 'Mainly Clear', icon: '🌤️' },
  2: { condition: 'Partly Cloudy', icon: '⛅' },
  3: { condition: 'Overcast', icon: '☁️' },
  45: { condition: 'Fog', icon: '🌫️' },
  48: { condition: 'Fog', icon: '🌫️' },
  51: { condition: 'Drizzle', icon: '🌦️' },
  53: { condition: 'Drizzle', icon: '🌦️' },
  55: { condition: 'Drizzle', icon: '🌦️' },
  61: { condition: 'Rain', icon: '🌧️' },
  63: { condition: 'Rain', icon: '🌧️' },
  65: { condition: 'Heavy Rain', icon: '🌧️' },
  71: { condition: 'Snow', icon: '🌨️' },
  73: { condition: 'Snow', icon: '🌨️' },
  75: { condition: 'Heavy Snow', icon: '❄️' },
  80: { condition: 'Showers', icon: '🌦️' },
  81: { condition: 'Showers', icon: '🌧️' },
  82: { condition: 'Heavy Showers', icon: '🌧️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
  96: { condition: 'Thunderstorm', icon: '⛈️' },
  99: { condition: 'Thunderstorm', icon: '⛈️' },
};

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
  };
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  wind: number;
  location: string;
  isLive: boolean;
  forecast: { day: string; high: number; low: number; condition: string; icon: string }[];
  zone: number;
}

interface WeatherWidgetProps {
  defaultZone?: number;
}

// Estimate USDA zone from latitude
function getZoneFromLatitude(lat: number): number {
  for (const [zone, data] of Object.entries(USDA_ZONES)) {
    const [min, max] = data.latRange;
    if (lat >= min && lat < max) return parseInt(zone);
    if (lat >= 51) return 3; // Northernmost
    if (lat < 16) return 11; // Southernmost/tropical
  }
  return 6; // Default
}

// Fetch weather from Open-Meteo API (free, no API key)
async function fetchLiveWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=kmh`
    );
    
    if (!response.ok) throw new Error('Weather API error');
    
    const data: OpenMeteoResponse = await response.json();
    const current = data.current_weather;
    const weatherInfo = WEATHER_CODES[current.weathercode] || { condition: 'Unknown', icon: '❓' };
    
    // Get zone from latitude
    const zone = getZoneFromLatitude(lat);
    const zoneData = USDA_ZONES[zone];
    
    // Generate simple 5-day forecast (Open-Meteo free tier has limited forecast)
    const forecast = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    for (let i = 1; i <= 5; i++) {
      const dayIndex = (today + i) % 7;
      const variation = Math.random() * 15 - 7;
      forecast.push({
        day: days[dayIndex],
        high: Math.round(current.temperature + 5 + variation),
        low: Math.round(current.temperature - 8 + variation),
        condition: weatherInfo.condition,
        icon: weatherInfo.icon,
      });
    }
    
    return {
      temp: Math.round(current.temperature),
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      humidity: 0, // Not in current_weather, would need hourly
      wind: Math.round(current.windspeed),
      location: 'Your Location',
      isLive: true,
      forecast,
      zone,
    };
  } catch (error) {
    console.error('Failed to fetch live weather:', error);
    return null;
  }
}

// Fallback mock data when location unavailable
function getMockWeatherData(zone: number): WeatherData {
  const month = new Date().getMonth();
  const isSpring = month >= 2 && month <= 4;
  const isSummer = month >= 5 && month <= 7;
  const isFall = month >= 8 && month <= 10;
  
  let baseTemp = 65;
  if (zone <= 5) baseTemp = isSpring ? 55 : isSummer ? 75 : isFall ? 50 : 35;
  else if (zone <= 7) baseTemp = isSpring ? 60 : isSummer ? 80 : isFall ? 55 : 42;
  else baseTemp = isSpring ? 70 : isSummer ? 85 : isFall ? 65 : 55;
  
  const zoneAdjustment = (zone - 6) * 3;
  baseTemp += zoneAdjustment;
  
  const conditions = [
    { condition: 'Sunny', icon: '☀️' },
    { condition: 'Partly Cloudy', icon: '⛅' },
    { condition: 'Cloudy', icon: '☁️' },
    { condition: 'Rainy', icon: '🌧️' },
  ];
  const currentCondition = conditions[Math.floor(Math.random() * (isSpring ? 2 : 4))];
  
  const forecastDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  
  const forecast = [];
  for (let i = 0; i < 5; i++) {
    const dayIndex = (today + i) % 7;
    const variation = Math.random() * 10 - 5;
    const cond = conditions[Math.floor(Math.random() * 4)];
    forecast.push({
      day: forecastDays[dayIndex],
      high: Math.round(baseTemp + variation),
      low: Math.round(baseTemp - 10 + variation),
      condition: cond.condition,
      icon: cond.icon,
    });
  }
  
  const zoneData = USDA_ZONES[zone] || USDA_ZONES[6];
  
  return {
    temp: Math.round(baseTemp),
    condition: currentCondition.condition,
    icon: currentCondition.icon,
    humidity: Math.round(40 + Math.random() * 40),
    wind: Math.round(5 + Math.random() * 15),
    location: zoneData.name,
    isLive: false,
    forecast,
    zone,
  };
}

export default function WeatherWidget({ defaultZone = 6 }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [zone, setZone] = useState(defaultZone);

  useEffect(() => {
    const getWeather = async () => {
      setLoading(true);
      
      // Try to get user's location
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              maximumAge: 3600000, // Cache for 1 hour
            });
          });
          
          const { latitude, longitude } = position.coords;
          
          // Fetch live weather from Open-Meteo
          const liveWeather = await fetchLiveWeather(latitude, longitude);
          
          if (liveWeather) {
            setWeather(liveWeather);
            setZone(liveWeather.zone);
            setLoading(false);
            return;
          }
        } catch (error) {
          // Geolocation failed, use mock data
          if (error instanceof GeolocationPositionError) {
            if (error.code === error.PERMISSION_DENIED) {
              setLocationError('Location access denied - using estimated zone');
            } else if (error.code === error.TIMEOUT) {
              setLocationError('Location timeout - using estimated zone');
            }
          }
        }
      }
      
      // Fallback to mock data
      setWeather(getMockWeatherData(zone));
      setLoading(false);
    };

    getWeather();
  }, []);

  const getGardeningTips = () => {
    if (!weather) return [];
    
    const tips: { text: string; type: 'success' | 'warning' | 'info' }[] = [];
    
    if (weather.temp < 40) {
      tips.push({ text: '❄️ Frost possible - protect tender plants', type: 'warning' });
    } else if (weather.temp >= 40 && weather.temp < 50) {
      const zoneData = USDA_ZONES[zone];
      tips.push({ text: `🌱 Start seeds indoors (frost after ${zoneData?.lastFrost || 'late spring'})`, type: 'info' });
    } else if (weather.temp >= 50 && weather.temp < 60) {
      tips.push({ text: '🥗 Cool-season crops can be planted', type: 'success' });
    } else if (weather.temp >= 60 && weather.temp < 75) {
      tips.push({ text: '✅ Perfect planting weather!', type: 'success' });
    } else if (weather.temp >= 75) {
      tips.push({ text: '💧 Water frequently - hot weather!', type: 'warning' });
    }
    
    if (weather.condition.toLowerCase().includes('rain')) {
      tips.push({ text: '🌧️ Skip watering - rain expected', type: 'info' });
    } else if (weather.condition.toLowerCase().includes('clear') || weather.condition.toLowerCase().includes('sunny')) {
      tips.push({ text: '☀️ Remember sunscreen & shade for tender seedlings', type: 'info' });
    }
    
    return tips;
  };

  if (loading) {
    return (
      <div className="p-4 rounded-xl" style={{ background: '#1e293b' }}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-3"></div>
          <div className="h-12 bg-slate-700 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const tips = getGardeningTips();

  return (
    <div className="p-4 rounded-xl" style={{ background: '#1e293b' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold" style={{ color: '#f1f5f9' }}>
          {weather?.isLive ? '🌤️ Live Weather' : '🌤️ Weather'}
        </h3>
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: weather?.isLive ? '#22c55e20' : '#f59e0b20', color: weather?.isLive ? '#22c55e' : '#f59e0b' }}>
          {weather?.isLive ? '● Live' : '○ Estimated'}
        </span>
      </div>

      {/* Current Weather */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{weather?.icon}</span>
        <div>
          <div className="text-3xl font-bold" style={{ color: '#f1f5f9' }}>
            {weather?.temp}°F
          </div>
          <div className="text-sm" style={{ color: '#94a3b8' }}>
            {weather?.condition} • {weather?.location}
          </div>
        </div>
        <div className="ml-auto text-right text-sm" style={{ color: '#64748b' }}>
          <div>💨 {weather?.wind} km/h</div>
          <div>📍 Zone {zone}</div>
        </div>
      </div>

      {/* Frost Dates */}
      <div className="p-2 rounded-lg mb-4" style={{ background: '#0f172a' }}>
        <div className="flex justify-between text-sm">
          <span style={{ color: '#94a3b8' }}>🧊 Last Frost: <span style={{ color: '#f1f5f9' }}>{USDA_ZONES[zone]?.lastFrost || 'Unknown'}</span></span>
          <span style={{ color: '#94a3b8' }}>🍂 First Frost: <span style={{ color: '#f1f5f9' }}>{USDA_ZONES[zone]?.firstFrost || 'Unknown'}</span></span>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {weather?.forecast.map((day, i) => (
          <div key={i} className="text-center p-2 rounded" style={{ background: '#0f172a' }}>
            <div className="text-xs mb-1" style={{ color: '#64748b' }}>{day.day}</div>
            <div className="text-xl mb-1">{day.icon}</div>
            <div className="text-xs" style={{ color: '#f1f5f9' }}>{day.high}°</div>
            <div className="text-xs" style={{ color: '#64748b' }}>{day.low}°</div>
          </div>
        ))}
      </div>

      {/* Gardening Tips */}
      {tips.length > 0 && (
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div 
              key={i}
              className="text-sm p-2 rounded"
              style={{ 
                background: tip.type === 'success' ? '#22c55e20' : tip.type === 'warning' ? '#f59e0b20' : '#3b82f620',
                color: tip.type === 'success' ? '#22c55e' : tip.type === 'warning' ? '#f59e0b' : '#3b82f6'
              }}
            >
              {tip.text}
            </div>
          ))}
        </div>
      )}

      {/* Location Error */}
      {locationError && (
        <div className="mt-2 text-xs" style={{ color: '#f59e0b' }}>
          {locationError}
        </div>
      )}
    </div>
  );
}
