'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { achievements, Achievement } from '@/lib/achievements';

export default function GardenAchievements() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { 
    placedPlants, 
    journalEntries, 
    reminders,
    visitDates = [],
  } = useGardenStore();
  
  // Track visit dates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const { addVisitDate } = useGardenStore.getState();
    if (!visitDates.includes(today)) {
      addVisitDate(today);
    }
  }, []);
  
  // Calculate completed tasks (from reminders)
  const completedTasks = useMemo(() => {
    return reminders.filter(r => r.completed).length;
  }, [reminders]);
  
  // Calculate garden score based on placed plants
  const gardenScore = useMemo(() => {
    if (placedPlants.length <= 1) return 100;
    // Simple score calculation - in a real app this would use companion data
    return Math.min(100, 70 + placedPlants.length * 2);
  }, [placedPlants]);
  
  // Calculate achievements
  const { unlockedAchievements, progressMap } = useMemo(() => {
    const uniquePlantIds = new Set(placedPlants.map(p => p.plantId));
    const uniqueVisitDates = new Set(visitDates);
    
    const unlocked: Achievement[] = [];
    const progress: Record<string, number> = {};
    
    achievements.forEach(achievement => {
      let currentProgress = 0;
      
      switch (achievement.type) {
        case 'plants_placed':
          currentProgress = placedPlants.length;
          break;
        case 'plants_varieties':
          currentProgress = uniquePlantIds.size;
          break;
        case 'journals_written':
          currentProgress = journalEntries.length;
          break;
        case 'tasks_completed':
          currentProgress = completedTasks;
          break;
        case 'days_active':
          currentProgress = uniqueVisitDates.size;
          break;
        case 'companion_pairs':
          if (achievement.id === 'harmonious_garden') {
            currentProgress = gardenScore;
          }
          break;
        // Placeholder values for achievements not yet trackable
        case 'harvests_logged':
          currentProgress = Math.floor(placedPlants.length * 0.3); // Estimate based on plants
          break;
        case 'photos_uploaded':
          currentProgress = 0; // Would need to connect to gallery
          break;
      }
      
      progress[achievement.id] = currentProgress;
      
      if (currentProgress >= achievement.requirement) {
        unlocked.push(achievement);
      }
    });
    
    return { 
      unlockedAchievements: unlocked, 
      progressMap: progress 
    };
  }, [placedPlants, journalEntries, visitDates, gardenScore, completedTasks]);
  
  const totalAchievements = achievements.length;
  const completionPercent = Math.round((unlockedAchievements.length / totalAchievements) * 100);
  
  // Group achievements by category
  const categories = ['planting', 'harvesting', 'companion', 'consistency', 'exploration'] as const;
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'planting': return '🌱';
      case 'harvesting': return '🧺';
      case 'companion': return '💚';
      case 'consistency': return '📅';
      case 'exploration': return '🌟';
      default: return '🏆';
    }
  };
  
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'planting': return 'Planting';
      case 'harvesting': return 'Harvesting';
      case 'companion': return 'Companion';
      case 'consistency': return 'Consistency';
      case 'exploration': return 'Exploration';
      default: return 'Other';
    }
  };
  
  return (
    <>
      {/* Achievement Summary Button */}
      <div 
        className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md p-4 cursor-pointer hover:from-amber-600 hover:to-orange-600 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h3 className="font-semibold text-white">Achievements</h3>
              <p className="text-amber-100 text-sm">{unlockedAchievements.length}/{totalAchievements} unlocked</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{completionPercent}%</p>
            <p className="text-amber-100 text-xs">Complete</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        
        {/* Recent unlocks */}
        {unlockedAchievements.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-amber-100 text-xs">Recent:</span>
            <div className="flex gap-1">
              {unlockedAchievements.slice(-3).map(a => (
                <span key={a.id} className="text-lg" title={a.name}>{a.icon}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🏆</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">Garden Achievements</h2>
                    <p className="text-amber-100">{unlockedAchievements.length} of {totalAchievements} unlocked</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {/* Overall progress */}
              <div className="mt-4">
                <div className="flex justify-between text-amber-100 text-sm mb-1">
                  <span>Progress</span>
                  <span>{completionPercent}%</span>
                </div>
                <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Achievement List */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {categories.map(category => {
                const categoryAchievements = achievements.filter(a => a.category === category);
                const unlockedInCategory = categoryAchievements.filter(a => 
                  unlockedAchievements.some(u => u.id === a.id)
                );
                
                return (
                  <div key={category} className="space-y-2">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <span>{getCategoryIcon(category)}</span>
                      {getCategoryName(category)}
                      <span className="text-gray-400 text-sm ml-auto">
                        {unlockedInCategory.length}/{categoryAchievements.length}
                      </span>
                    </h3>
                    
                    <div className="space-y-2">
                      {categoryAchievements.map(achievement => {
                        const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
                        const progress = progressMap[achievement.id] || 0;
                        const percent = Math.min(100, Math.round((progress / achievement.requirement) * 100));
                        
                        return (
                          <div 
                            key={achievement.id}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              isUnlocked 
                                ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700' 
                                : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                                {achievement.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h4 className={`font-medium ${isUnlocked ? 'text-amber-800 dark:text-amber-200' : 'text-gray-600 dark:text-gray-300'}`}>
                                  {achievement.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {achievement.description}
                                </p>
                                
                                {!isUnlocked && (
                                  <div className="mt-2">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                      <span>{progress}/{achievement.requirement}</span>
                                      <span>{percent}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-amber-400 transition-all"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                
                                {isUnlocked && (
                                  <div className="mt-1">
                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                      ✓ Unlocked!
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
