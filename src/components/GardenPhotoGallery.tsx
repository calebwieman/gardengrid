'use client';

import { useState, useRef } from 'react';
import { useGardenStore } from '@/stores/gardenStore';

interface GardenPhoto {
  id: string;
  url: string;
  caption: string;
  date: string;
}

export default function GardenPhotoGallery() {
  const { gardenName } = useGardenStore();
  const [photos, setPhotos] = useState<GardenPhoto[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GardenPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newPhoto: GardenPhoto = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url,
          caption: '',
          date: new Date().toISOString().split('T')[0],
        };
        setPhotos(prev => [newPhoto, ...prev]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const updateCaption = (id: string, caption: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
  };
  
  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
      >
        <span>📸</span>
        <span className="font-medium">Garden Photos</span>
        {photos.length > 0 && (
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
            {photos.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span>📸</span> Garden Photos
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      
      {/* Upload button */}
      <label className="block mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <div className="w-full px-4 py-3 bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-lg text-center cursor-pointer transition-colors flex items-center justify-center gap-2">
          <span>📷</span>
          <span className="font-medium">Add Photos</span>
        </div>
      </label>
      
      {/* Photo grid */}
      {photos.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📸</div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No photos yet. Start documenting your garden journey!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {photos.map(photo => (
            <div
              key={photo.id}
              className="relative aspect-square group cursor-pointer rounded-lg overflow-hidden"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Garden photo'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                <div className="w-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white text-center truncate bg-black/50 rounded">
                    {formatDate(photo.date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Photo count */}
      {photos.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-3">
          {photos.length} photo{photos.length !== 1 ? 's' : ''} • Tap to view
        </p>
      )}
      
      {/* Selected photo modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Garden photo'}
              className="w-full max-h-[60vh] object-contain"
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(selectedPhoto.date)}
                </p>
                <button
                  onClick={() => deletePhoto(selectedPhoto.id)}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
              <input
                type="text"
                value={selectedPhoto.caption}
                onChange={(e) => updateCaption(selectedPhoto.id, e.target.value)}
                placeholder="Add a caption..."
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
