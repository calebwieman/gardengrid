'use client';

import { useMemo } from 'react';
import { useGardenStore, PlacedPlant } from '@/stores/gardenStore';
import { getPlantById, Plant } from '@/lib/plants';

interface GardenAnalyticsProps {
  placedPlants: PlacedPlant[];
}

export default function GardenAnalytics({ placedPlants }: GardenAnalyticsProps) {
  const { zone } = useGardenStore();

  const analytics = useMemo(() => {
    if (placedPlants.length === 0) {
      return null;
    }

    // Get plant data for all placed plants
    const plantData = placedPlants.map(p => ({
      ...p,
      data: getPlantById(p.plantId),
    })).filter(p => p.data) as (PlacedPlant & { data: Plant })[];

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    plantData.forEach(p => {
      const cat = p.data.category;
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    // Harvest timeline
    const harvestTimeline: Record<string, { plant: Plant; days: number }[]> = {};
    const today = new Date();
    
    plantData.forEach(p => {
      if (!p.plantedAt || p.stage === 'ready') return;
      
      const planted = new Date(p.plantedAt);
      const harvestDate = new Date(planted);
      harvestDate.setDate(harvestDate.getDate() + p.data.daysToMaturity);
      
      const daysUntil = Math.ceil((harvestDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const monthKey = harvestDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!harvestTimeline[monthKey]) harvestTimeline[monthKey] = [];
      harvestTimeline[monthKey].push({ plant: p.data, days: daysUntil });
    });

    // Sort harvest timeline
    const sortedHarvestMonths = Object.keys(harvestTimeline).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    // Days to first harvest
    const daysToFirstHarvest = plantData
      .filter(p => p.plantedAt && p.stage !== 'ready')
      .map(p => {
        const planted = new Date(p.plantedAt!);
        const harvest = new Date(planted);
        harvest.setDate(harvest.getDate() + p.data.daysToMaturity);
        return Math.ceil((harvest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      })
      .filter(d => d > 0)
      .sort((a, b) => a - b)[0] || null;

    // Sun needs breakdown
    const sunBreakdown: Record<string, number> = {};
    plantData.forEach(p => {
      const sun = p.data.sunNeeds;
      sunBreakdown[sun] = (sunBreakdown[sun] || 0) + 1;
    });

    // Average days to maturity
    const avgDaysToMaturity = Math.round(
      plantData.reduce((sum, p) => sum + p.data.daysToMaturity, 0) / plantData.length
    );

    // Stage breakdown
    const stageBreakdown: Record<string, number> = { seedling: 0, growing: 0, ready: 0 };
    plantData.forEach(p => {
      const stage = p.stage || 'seedling';
      stageBreakdown[stage]++;
    });

    // Growth stage progress
    const plantsWithProgress = plantData.filter(p => p.plantedAt);
    const progressPercent = plantsWithProgress.length > 0 
      ? Math.round(
          plantsWithProgress.reduce((sum, p) => {
            const planted = new Date(p.plantedAt!);
            const harvest = new Date(planted);
            harvest.setDate(harvest.getDate() + p.data.daysToMaturity);
            const elapsed = today.getTime() - planted.getTime();
            const total = harvest.getTime() - planted.getTime();
            return sum + Math.min(100, (elapsed / total) * 100);
          }, 0) / plantsWithProgress.length
        )
      : 0;

    return {
      totalPlants: placedPlants.length,
      uniquePlants: new Set(plantData.map(p => p.plantId)).size,
      categoryBreakdown,
      harvestTimeline: sortedHarvestMonths.map(month => ({
        month,
        plants: harvestTimeline[month],
        count: harvestTimeline[month].length,
      })),
      daysToFirstHarvest,
      sunBreakdown,
      avgDaysToMaturity,
      stageBreakdown,
      progressPercent,
    };
  }, [placedPlants]);

  if (!analytics || placedPlants.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
          <span className="text-xl">📊</span> Garden Analytics
        </h3>
        <p className="text-sm text-gray-400 text-center py-4">
          Add plants to see analytics
        </p>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    vegetable: 'bg-green-500',
    herb: 'bg-emerald-500',
    fruit: 'bg-red-500',
    flower: 'bg-purple-500',
  };

  const categoryEmojis: Record<string, string> = {
    vegetable: '🥬',
    herb: '🌿',
    fruit: '🍓',
    flower: '🌸',
  };

  const maxCategoryCount = Math.max(...Object.values(analytics.categoryBreakdown));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
        <span className="text-xl">📊</span> Garden Analytics
      </h3>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-3">
          <p className="text-2xl font-bold text-green-600">{analytics.totalPlants}</p>
          <p className="text-xs text-gray-500">Total Plants</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-3">
          <p className="text-2xl font-bold text-blue-600">{analytics.uniquePlants}</p>
          <p className="text-xs text-gray-500">Varieties</p>
        </div>
      </div>

      {/* Days to First Harvest */}
      {analytics.daysToFirstHarvest && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">First Harvest</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                {analytics.daysToFirstHarvest} days
              </p>
            </div>
            <div className="text-3xl">🌱</div>
          </div>
        </div>
      )}

      {/* Growth Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-300">Overall Growth</span>
          <span className="text-green-600 font-medium">{analytics.progressPercent}%</span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all"
            style={{ width: `${analytics.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Plant Categories</p>
        <div className="space-y-2">
          {Object.entries(analytics.categoryBreakdown).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-lg">{categoryEmojis[cat] || '🌱'}</span>
              <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${categoryColors[cat] || 'bg-gray-500'}`}
                  style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-6">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sun Needs */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Sun Requirements</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(analytics.sunBreakdown).map(([sun, count]) => (
            <span 
              key={sun}
              className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs"
            >
              ☀️ {sun.replace('-', ' ')}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Growth Stages</p>
        <div className="flex gap-2">
          <div className="flex-1 text-center p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
            <p className="text-lg">🌱</p>
            <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">{analytics.stageBreakdown.seedling}</p>
            <p className="text-xs text-gray-400">Seedling</p>
          </div>
          <div className="flex-1 text-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-lg">🌿</p>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">{analytics.stageBreakdown.growing}</p>
            <p className="text-xs text-gray-400">Growing</p>
          </div>
          <div className="flex-1 text-center p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <p className="text-lg">✨</p>
            <p className="text-xs font-medium text-green-700 dark:text-green-400">{analytics.stageBreakdown.ready}</p>
            <p className="text-xs text-gray-400">Ready</p>
          </div>
        </div>
      </div>

      {/* Harvest Timeline */}
      {analytics.harvestTimeline.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">📅 Harvest Timeline</p>
          <div className="space-y-2">
            {analytics.harvestTimeline.slice(0, 4).map(({ month, plants, count }) => (
              <div 
                key={month}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{month}</span>
                <div className="flex items-center gap-1">
                  {plants.slice(0, 5).map((p, i) => (
                    <span key={i} className="text-lg" title={`${p.plant.name} (${p.days} days)`}>
                      {p.plant.emoji}
                    </span>
                  ))}
                  {count > 5 && (
                    <span className="text-xs text-gray-400">+{count - 5}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Average Maturity */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-400">
          Avg. {analytics.avgDaysToMaturity} days to maturity • Zone {zone}
        </p>
      </div>
    </div>
  );
}
