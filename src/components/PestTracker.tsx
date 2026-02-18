'use client';

import { useState, useMemo } from 'react';
import { useGardenStore, PestIssue } from '@/stores/gardenStore';
import { commonPests, Pest } from '@/lib/pests';
import { getPlantById } from '@/lib/plants';

export default function PestTracker() {
  const { placedPlants, pestIssues, addPestIssue, removePestIssue, resolvePestIssue } = useGardenStore();
  const [selectedPest, setSelectedPest] = useState<Pest | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    pestId: '',
    plantX: 0,
    plantY: 0,
    severity: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
  });
  
  // Get unique plants in garden
  const gardenPlantIds = useMemo(() => {
    return [...new Set(placedPlants.map(p => p.plantId))];
  }, [placedPlants]);
  
  // Get potential pest risks based on plants in garden
  const pestRisks = useMemo(() => {
    const risks: { pest: Pest; affectedCount: number }[] = [];
    
    for (const pest of commonPests) {
      const affectedCount = pest.affectedPlants.filter(plantId => 
        gardenPlantIds.includes(plantId)
      ).length;
      
      if (affectedCount > 0) {
        risks.push({ pest, affectedCount });
      }
    }
    
    // Sort by affected count
    return risks.sort((a, b) => b.affectedCount - a.affectedCount);
  }, [gardenPlantIds]);
  
  // Get unresolved pest issues
  const activeIssues = useMemo(() => {
    return pestIssues.filter(i => !i.resolved);
  }, [pestIssues]);
  
  const resolvedIssues = useMemo(() => {
    return pestIssues.filter(i => i.resolved);
  }, [pestIssues]);
  
  const handleAddIssue = () => {
    if (!formData.pestId) return;
    addPestIssue(
      formData.pestId,
      formData.plantX,
      formData.plantY,
      formData.severity,
      formData.notes
    );
    setShowAddForm(false);
    setFormData({
      pestId: '',
      plantX: 0,
      plantY: 0,
      severity: 'medium',
      notes: '',
    });
  };
  
  const getPlantAtPosition = (x: number, y: number) => {
    const placed = placedPlants.find(p => p.x === x && p.y === y);
    return placed ? getPlantById(placed.plantId) : null;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header - Always Expanded */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐛</span>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Pest Tracker</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeIssues.length} active issue{activeIssues.length !== 1 ? 's' : ''}
              {pestRisks.length > 0 && ` • ${pestRisks.length} potential risks`}
            </p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Quick Stats */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{activeIssues.filter(i => i.severity === 'high').length}</div>
              <div className="text-xs text-gray-500">High</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{activeIssues.filter(i => i.severity === 'medium').length}</div>
              <div className="text-xs text-gray-500">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{resolvedIssues.length}</div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
          </div>
          
          {/* Add Issue Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>+</span> Report Pest Issue
              </button>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 dark:text-white">Report New Issue</h4>
                
                <select
                  value={formData.pestId}
                  onChange={(e) => setFormData({ ...formData, pestId: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                >
                  <option value="">Select pest or problem...</option>
                  {commonPests.map(pest => (
                    <option key={pest.id} value={pest.id}>{pest.emoji} {pest.name}</option>
                  ))}
                </select>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Plant X</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={formData.plantX}
                      onChange={(e) => setFormData({ ...formData, plantX: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Plant Y</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={formData.plantY}
                      onChange={(e) => setFormData({ ...formData, plantY: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Severity</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map(sev => (
                      <button
                        key={sev}
                        onClick={() => setFormData({ ...formData, severity: sev })}
                        className={`flex-1 py-2 rounded-lg font-medium capitalize transition-colors ${
                          formData.severity === sev
                            ? sev === 'high' ? 'bg-red-600 text-white' 
                              : sev === 'medium' ? 'bg-yellow-500 text-white'
                              : 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
                
                <textarea
                  placeholder="Notes (optional)..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                  rows={2}
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handleAddIssue}
                    disabled={!formData.pestId}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Add Issue
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Active Issues */}
          {activeIssues.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">Active Issues</h4>
              <div className="space-y-2">
                {activeIssues.map(issue => {
                  const pest = commonPests.find(p => p.id === issue.pestId);
                  const plant = getPlantAtPosition(issue.plantX, issue.plantY);
                  
                  return (
                    <div 
                      key={issue.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        issue.severity === 'high' 
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                          : issue.severity === 'medium'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{pest?.emoji || '🐛'}</span>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{pest?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">
                              {plant ? `${plant.emoji} ${plant.name}` : `Position (${issue.plantX}, ${issue.plantY})`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => resolvePestIssue(issue.id)}
                            className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"
                            title="Mark resolved"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => removePestIssue(issue.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      {issue.notes && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{issue.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Pest Risk Alerts */}
          {pestRisks.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">⚠️ Potential Pest Risks</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Based on your plants, watch for these common pests:
              </p>
              <div className="space-y-2">
                {pestRisks.slice(0, 5).map(({ pest, affectedCount }) => (
                  <button
                    key={pest.id}
                    onClick={() => setSelectedPest(pest)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pest.emoji}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{pest.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">Affects {affectedCount} plant{affectedCount !== 1 ? 's' : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Pest Details Modal */}
          {selectedPest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {selectedPest.emoji} {selectedPest.name}
                  </h3>
                  <button
                    onClick={() => setSelectedPest(null)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">Affected Plants</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPest.affectedPlants.map(plantId => {
                        const plant = getPlantById(plantId);
                        return plant ? (
                          <span key={plantId} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                            {plant.emoji} {plant.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">Symptoms</h4>
                    <ul className="space-y-1">
                      {selectedPest.symptoms.map((symptom, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-red-500">•</span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">🧪 Organic Remedies</h4>
                    <ul className="space-y-1">
                      {selectedPest.organicRemedies.map((remedy, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          {remedy}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">🛡️ Prevention</h4>
                    <ul className="space-y-1">
                      {selectedPest.prevention.map((tip, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-500">★</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
