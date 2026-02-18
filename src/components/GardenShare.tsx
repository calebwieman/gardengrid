'use client';

import { useState } from 'react';
import { useGardenStore } from '@/stores/gardenStore';

export default function GardenShare() {
  const { getShareUrl, placedPlants } = useGardenStore();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (placedPlants.length === 0) return;
    
    setIsSharing(true);
    try {
      const shareUrl = getShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
        <span>🔗</span> Share Garden
      </h3>
      
      {placedPlants.length === 0 ? (
        <p className="text-sm text-gray-500">Add plants to your garden to share it</p>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">
            Share your garden layout with friends and family!
          </p>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className={`w-full px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
            }`}
          >
            {copied ? (
              <>✅ Copied to Clipboard!</>
            ) : isSharing ? (
              <>⏳ Generating Link...</>
            ) : (
              <>📋 Copy Share Link</>
            )}
          </button>
          {copied && (
            <p className="text-xs text-green-600 text-center mt-2">
              Send the link to anyone - they'll see your garden!
            </p>
          )}
        </>
      )}
    </div>
  );
}
