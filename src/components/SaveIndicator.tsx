'use client';

import { useState, useEffect } from 'react';
import { useGardenStore } from '@/stores/gardenStore';

export default function SaveIndicator() {
  const { placedPlants, gardenName } = useGardenStore();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    // Show toast when plants change
    if (placedPlants.length > 0) {
      setLastSaved(new Date());
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [placedPlants, gardenName]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  return (
    <>
      {lastSaved && (
        <div className="text-xs text-gray-400">
          💾 Saved {formatTime(lastSaved)}
        </div>
      )}
      
      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse">
          ✓ Garden saved!
        </div>
      )}
    </>
  );
}
