'use client';

import { Plant, getPlantById } from '@/lib/plants';

interface PlantDetailsModalProps {
  plant: Plant;
  onClose: () => void;
  onRemove?: () => void;
  position?: { x: number; y: number };
}

export default function PlantDetailsModal({ plant, onClose, onRemove, position }: PlantDetailsModalProps) {
  const companions = plant.companions.map(id => getPlantById(id)).filter(Boolean) as Plant[];
  const antagonists = plant.antagonists.map(id => getPlantById(id)).filter(Boolean) as Plant[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with plant color */}
        <div 
          className="p-6 text-white relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${plant.color}dd 0%, ${plant.color}88 100%)`
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/20 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
          
          <div className="relative flex items-center gap-4">
            <span className="text-5xl">{plant.emoji}</span>
            <div>
              <h2 className="text-2xl font-bold">{plant.name}</h2>
              <p className="text-white/80 capitalize">{plant.category} • {plant.daysToMaturity} days to harvest</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-2xl">☀️</div>
              <div className="text-xs text-gray-500 mt-1 capitalize">{plant.sunNeeds.replace('-', ' ')}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-2xl">📏</div>
              <div className="text-xs text-gray-500 mt-1">{plant.spacing}&quot; spacing</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-2xl">💧</div>
              <div className="text-xs text-gray-500 mt-1 capitalize">{plant.waterNeeds || 'average'}</div>
            </div>
          </div>
          
          {/* Description */}
          {plant.description && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{plant.description}</p>
            </div>
          )}
          
          {/* Companions */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-green-500">✓</span> Good Companions
            </h3>
            <div className="flex flex-wrap gap-2">
              {companions.length > 0 ? companions.map(p => (
                <div 
                  key={p.id}
                  className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm"
                >
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                </div>
              )) : (
                <p className="text-gray-400 text-sm italic">No specific companions listed</p>
              )}
            </div>
          </div>
          
          {/* Antagonists */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-red-500">✗</span> Avoid Planting With
            </h3>
            <div className="flex flex-wrap gap-2">
              {antagonists.length > 0 ? antagonists.map(p => (
                <div 
                  key={p.id}
                  className="flex items-center gap-2 bg-red-50 text-red-800 px-3 py-2 rounded-lg text-sm"
                >
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                </div>
              )) : (
                <p className="text-gray-400 text-sm italic">No specific antagonists listed</p>
              )}
            </div>
          </div>
          
          {/* Growing tips */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">🌱 Growing Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Plant in {plant.sunNeeds.replace('-', ' ')} for best results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Space plants {plant.spacing} inches apart</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Keep soil {plant.waterNeeds || 'moderately'} moist</span>
              </li>
              {plant.harvestTips && (
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{plant.harvestTips}</span>
                </li>
              )}
            </ul>
          </div>
          
          {/* Position info if provided */}
          {position && (
            <div className="bg-gray-100 rounded-lg p-3 text-center text-sm text-gray-600">
              📍 Position: Row {position.y + 1}, Column {position.x + 1}
            </div>
          )}
        </div>
        
        {/* Actions */}
        {onRemove && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onRemove}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              🗑️ Remove from Garden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
