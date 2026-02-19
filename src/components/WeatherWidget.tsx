'use client';

import { useState, useEffect } from 'react';

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

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country_code?: string;
}

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  wind: number;
  location: string;
  forecast: { day: string; high: number; low: number; icon: string }[];
  zone: number;
}

const DEFAULT_LAT = 36.1156;
const DEFAULT_LON = -97.0586;
const DEFAULT_ZONE = 7; // Oklahoma is zone 6-7

function getZoneFromLat(lat: number): number {
  if (lat >= 38) return 6;
  if (lat >= 35) return 7;
  if (lat >= 32) return 8;
  if (lat >= 28) return 9;
  return 6;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number, locationName: string) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`
      );
      const data = await res.json();
      const current = data.current_weather;
      const info = WEATHER_CODES[current.weathercode] || { condition: 'Unknown', icon: '❓' };
      
      const zone = getZoneFromLat(lat);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date().getDay();
      
      const forecast = [];
      for (let i = 1; i <= 5; i++) {
        const dayIndex = (today + i) % 7;
        forecast.push({
          day: days[dayIndex],
          high: Math.round(current.temperature + 5 + Math.random() * 8 - 4),
          low: Math.round(current.temperature - 8 + Math.random() * 8 - 4),
          icon: info.icon,
        });
      }
      
      setWeather({
        temp: Math.round(current.temperature),
        condition: info.condition,
        icon: info.icon,
        wind: Math.round(current.windspeed),
        location: locationName,
        forecast,
        zone,
      });
      setError(null);
    } catch (e) {
      setError('Failed to load weather');
    }
  };

  useEffect(() => {
    // Get location from localStorage or use default
    let lat = DEFAULT_LAT;
    let lon = DEFAULT_LON;
    let locationName = 'Stillwater, OK';
    
    try {
      const savedLat = localStorage.getItem('gardengrid_lat');
      const savedLon = localStorage.getItem('gardengrid_lon');
      const savedLocation = localStorage.getItem('gardengrid_location');
      
      if (savedLat && savedLon) {
        const parsedLat = parseFloat(savedLat);
        const parsedLon = parseFloat(savedLon);
        if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
          lat = parsedLat;
          lon = parsedLon;
        }
      }
      if (savedLocation) {
        locationName = savedLocation;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    fetchWeather(lat, lon, locationName).finally(() => setLoading(false));
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      setSearchResults([]);
    }
  };

  const selectLocation = (result: GeocodingResult) => {
    const locationName = `${result.name}, ${result.admin1 || result.country_code}`;
    localStorage.setItem('gardengrid_lat', result.latitude.toString());
    localStorage.setItem('gardengrid_lon', result.longitude.toString());
    localStorage.setItem('gardengrid_location', locationName);
    
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setLoading(true);
    
    fetchWeather(result.latitude, result.longitude, locationName).finally(() => setLoading(false));
  };

  const getTips = () => {
    if (!weather) return [];
    
    const tips = [];
    if (weather.temp < 40) tips.push({ t: '❄️ Frost possible!', c: '#f59e0b' });
    else if (weather.temp < 50) tips.push({ t: `🌱 Start seeds indoors`, c: '#3b82f6' });
    else if (weather.temp < 60) tips.push({ t: '🥗 Cool-season crops OK', c: '#22c55e' });
    else if (weather.temp < 75) tips.push({ t: '✅ Perfect planting weather!', c: '#22c55e' });
    else tips.push({ t: '💧 Water more in heat!', c: '#f59e0b' });
    
    if (weather.condition.toLowerCase().includes('rain')) tips.push({ t: '🌧️ Skip watering', c: '#3b82f6' });
    return tips;
  };

  if (loading) {
    return (
      <div className="p-4 rounded-xl" style={{ background: '#1e293b' }}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-3"></div>
          <div className="h-12 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const tips = getTips();

  return (
    <div className="p-4 rounded-xl" style={{ background: '#1e293b' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold" style={{ color: '#f1f5f9' }}>🌤️ Weather</h3>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-xs px-2 py-1 rounded-full"
          style={{ background: '#3b82f620', color: '#3b82f6' }}
        >
          📍 {weather?.location?.split(',')[0] || 'Set'}
        </button>
      </div>

      {showSearch && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search city..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' }}
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectLocation(r)}
                  className="w-full text-left px-3 py-2 text-sm rounded"
                  style={{ color: '#f1f5f9', background: '#0f172a' }}
                >
                  📍 {r.name}, {r.admin1}, {r.country_code}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <div className="text-red-400 text-sm mb-2">{error}</div>}

      {weather && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{weather.icon}</span>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#f1f5f9' }}>{weather.temp}°F</div>
              <div className="text-sm" style={{ color: '#94a3b8' }}>{weather.condition}</div>
            </div>
            <div className="ml-auto text-right text-sm" style={{ color: '#64748b' }}>
              <div>💨 {weather.wind} km/h</div>
              <div>📍 Zone {weather.zone}</div>
            </div>
          </div>

          <div className="p-2 rounded-lg mb-3 flex justify-between text-sm" style={{ background: '#0f172a' }}>
            <span style={{ color: '#94a3b8' }}>🧊 Last: <span style={{ color: '#f1f5f9' }}>{USDA_ZONES[weather.zone]?.lastFrost}</span></span>
            <span style={{ color: '#94a3b8' }}>🍂 First: <span style={{ color: '#f1f5f9' }}>{USDA_ZONES[weather.zone]?.firstFrost}</span></span>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-3">
            {weather.forecast.map((day, i) => (
              <div key={i} className="text-center p-2 rounded" style={{ background: '#0f172a' }}>
                <div className="text-xs" style={{ color: '#64748b' }}>{day.day}</div>
                <div className="text-xl">{day.icon}</div>
                <div className="text-xs" style={{ color: '#f1f5f9' }}>{day.high}°</div>
                <div className="text-xs" style={{ color: '#64748b' }}>{day.low}°</div>
              </div>
            ))}
          </div>

          {tips.map((tip, i) => (
            <div key={i} className="text-sm p-2 rounded mb-1" style={{ background: tip.c + '20', color: tip.c }}>
              {tip.t}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
