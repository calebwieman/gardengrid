'use client';

import { useState } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { getPlantById, plants } from '@/lib/plants';

// Monthly task definitions based on USDA zones
type Season = 'winter' | 'spring' | 'summer' | 'fall';

interface MonthTasks {
  tasks: Task[];
  tip: string;
}

const monthlyTasks: Record<string, MonthTasks> = {
  january: {
    tasks: [
      { id: 'order-seeds', text: 'Order seeds for spring planting', icon: '📦', season: 'winter' },
      { id: 'plan-garden', text: 'Plan this year\'s garden layout', icon: '📐', season: 'winter' },
      { id: 'check-supplies', text: 'Check and order garden supplies', icon: '🛒', season: 'winter' },
      { id: 'maintain-tools', text: 'Clean and sharpen garden tools', icon: '🔧', season: 'winter' },
    ],
    tip: 'Great time to plan! Cold days are perfect for garden design.',
  },
  february: {
    tasks: [
      { id: 'start-indoor', text: 'Start seeds indoors (tomatoes, peppers)', icon: '🌱', season: 'winter' },
      { id: 'order-seeds', text: 'Finalize seed orders', icon: '📦', season: 'winter' },
      { id: 'prepare-beds', text: 'Prepare cold frames or row covers', icon: '🏠', season: 'winter' },
      { id: 'prune-trees', text: 'Prune fruit trees before spring', icon: '✂️', season: 'winter' },
    ],
    tip: 'Start tomatoes & peppers indoors 6-8 weeks before last frost.',
  },
  march: {
    tasks: [
      { id: 'direct-sow-cold', text: 'Direct sow cold-hardy crops (peas, spinach)', icon: '🌿', season: 'spring' },
      { id: 'transplant-seedlings', text: 'Transplant hardened seedlings', icon: '🪴', season: 'spring' },
      { id: 'prepare-soil', text: 'Prepare garden beds - add compost', icon: '🟤', season: 'spring' },
      { id: 'plant-berry', text: 'Plant berry bushes', icon: '🍓', season: 'spring' },
    ],
    tip: 'As soon as soil can be worked, plant peas and spinach!',
  },
  april: {
    tasks: [
      { id: 'plant-cool-season', text: 'Plant cool-season crops (lettuce, radishes)', icon: '🥬', season: 'spring' },
      { id: 'harden-off', text: 'Harden off indoor seedlings', icon: '🌱', season: 'spring' },
      { id: 'mulch-beds', text: 'Apply mulch to suppress weeds', icon: '🍂', season: 'spring' },
      { id: 'set-up-trellis', text: 'Set up trellises for climbing plants', icon: '🎋', season: 'spring' },
    ],
    tip: 'Wait until after last frost to transplant warm-season crops.',
  },
  may: {
    tasks: [
      { id: 'plant-warm-season', text: 'Plant warm-season crops (tomatoes, peppers)', icon: '🍅', season: 'spring' },
      { id: 'succession-plant', text: 'Succession plant lettuce every 2 weeks', icon: '🔄', season: 'spring' },
      { id: 'stake-plants', text: 'Stake tomatoes and peppers', icon: '🎋', season: 'spring' },
      { id: 'watch-pests', text: 'Monitor for early pest problems', icon: '🐛', season: 'spring' },
    ],
    tip: 'Plant heat-loving crops after soil warms to 60°F+.',
  },
  june: {
    tasks: [
      { id: 'water-consistent', text: 'Water consistently - 1 inch per week', icon: '💧', season: 'summer' },
      { id: 'side-dress', text: 'Side-dress heavy feeders with compost', icon: '🟤', season: 'summer' },
      { id: 'pinch-basil', text: 'Pinch basil to promote bushiness', icon: '🌿', season: 'summer' },
      { id: 'harvest-spring', text: 'Harvest spring crops', icon: '🧺', season: 'summer' },
    ],
    tip: 'Mulch helps retain moisture and keep roots cool!',
  },
  july: {
    tasks: [
      { id: 'water-deep', text: 'Water deeply in early morning', icon: '🌅', season: 'summer' },
      { id: 'succession-zucchini', text: 'Succession plant zucchini every 4 weeks', icon: '🥒', season: 'summer' },
      { id: 'trellis-training', text: 'Train vining plants on trellises', icon: '🎋', season: 'summer' },
      { id: 'watch-disease', text: 'Watch for disease signs (yellow leaves)', icon: '🍂', season: 'summer' },
    ],
    tip: 'Pick vegetables regularly to encourage more production!',
  },
  august: {
    tasks: [
      { id: 'plant-fall', text: 'Plant fall crops (broccoli, kale)', icon: '🥦', season: 'fall' },
      { id: 'save-seeds', text: 'Save seeds from mature plants', icon: '🌰', season: 'fall' },
      { id: 'preserve-harvest', text: 'Preserve excess harvest (canning, freezing)', icon: '🫙', season: 'fall' },
      { id: 'order-garlic', text: 'Order garlic for fall planting', icon: '🧄', season: 'fall' },
    ],
    tip: 'Start fall seeds indoors now for transplant in late summer!',
  },
  september: {
    tasks: [
      { id: 'plant-fall-garlic', text: 'Plant garlic cloves', icon: '🧄', season: 'fall' },
      { id: 'harvest-preserve', text: 'Harvest and preserve remaining produce', icon: '🧺', season: 'fall' },
      { id: 'plant-cover', text: 'Plant cover crops in empty beds', icon: '🌾', season: 'fall' },
      { id: 'clean-beds', text: 'Clean up spent plants', icon: '🧹', season: 'fall' },
    ],
    tip: 'Plant garlic 4-6 weeks before ground freezes.',
  },
  october: {
    tasks: [
      { id: 'plant-spring-bulbs', text: 'Plant spring bulbs (if applicable)', icon: '🌷', season: 'fall' },
      { id: 'add-compost', text: 'Add compost to empty beds', icon: '🟤', season: 'fall' },
      { id: 'protect-cold', text: 'Prepare cold frames for winter greens', icon: '🏠', season: 'fall' },
      { id: 'store-tools', text: 'Clean and store garden tools', icon: '🔧', season: 'fall' },
    ],
    tip: 'Fall is perfect for planting trees and shrubs!',
  },
  november: {
    tasks: [
      { id: 'protect-perennials', text: 'Mulch perennials for winter', icon: '🍂', season: 'winter' },
      { id: 'winter-greens', text: 'Plant winter greens in cold frames', icon: '🥬', season: 'winter' },
      { id: 'review-season', text: 'Review this year\'s garden notes', icon: '📓', season: 'winter' },
      { id: 'plan-next', text: 'Plan next year\'s improvements', icon: '📐', season: 'winter' },
    ],
    tip: 'Keep a garden journal to improve next year!',
  },
  december: {
    tasks: [
      { id: 'rest', text: 'Take a well-deserved rest!', icon: '☕', season: 'winter' },
      { id: 'order-catalogs', text: 'Order seed catalogs', icon: '📦', season: 'winter' },
      { id: 'dream-garden', text: 'Dream about next year\'s garden', icon: '🌈', season: 'winter' },
      { id: 'gift-garden', text: 'Give garden-related gifts', icon: '🎁', season: 'winter' },
    ],
    tip: 'Use winter time to learn new gardening techniques!',
  },
};

// Zone-specific adjustments
const zoneAdjustments: Record<number, string[]> = {
  3: ['Start seeds indoors earlier', 'Use cold frames longer in fall'],
  4: ['Account for shorter growing season', 'Plant cold-hardy varieties'],
  5: ['Standard timing works well', 'Good variety selection'],
  6: ['Plant earlier in spring', 'Extended fall growing season'],
  7: ['Start seeds 2-3 weeks earlier', 'Long fall harvest possible'],
  8: ['Very long growing season', 'Plant fall crops earlier'],
  9: ['Year-round growing possible', 'Plant through winter'],
  10: ['Tropical gardening', 'Avoid summer heat for cool crops'],
  11: ['Year-round tropical', 'Focus on heat-loving plants'],
};

interface Task {
  id: string;
  text: string;
  icon: string;
  season: 'winter' | 'spring' | 'summer' | 'fall';
}

interface CompletedTask {
  taskId: string;
  month: string;
  completedAt: number;
}

export default function GardenTasks() {
  const { placedPlants, zone } = useGardenStore();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return now.toLocaleString('default', { month: 'long' }).toLowerCase();
  });
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);

  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const currentMonthIndex = monthNames.indexOf(currentMonth);
  
  // Get personalized tasks based on what's planted
  const getPersonalizedTasks = (): { tasks: Task[]; tip: string } => {
    const baseTasks = monthlyTasks[currentMonth as keyof typeof monthlyTasks];
    const personalizedTasks: Task[] = [...baseTasks.tasks];
    const tips = [baseTasks.tip];
    
    // Add plant-specific tasks
    const plantIds = placedPlants.map(p => p.plantId);
    const uniquePlants = [...new Set(plantIds)];
    
    // Check for tomatoes - need staking/pruning
    if (uniquePlants.includes('tomato')) {
      if (['june', 'july', 'august'].includes(currentMonth)) {
        personalizedTasks.push({ id: 'prune-tomato', text: 'Prune tomato suckers for better yield', icon: '✂️', season: 'summer' });
      }
    }
    
    // Check for beans - succession planting
    if (uniquePlants.includes('bean')) {
      if (['may', 'june', 'july'].includes(currentMonth)) {
        personalizedTasks.push({ id: 'succession-beans', text: 'Succession plant beans every 3 weeks', icon: '🔄', season: 'summer' });
      }
    }
    
    // Check for carrots - thinning
    if (uniquePlants.includes('carrot')) {
      if (['april', 'may'].includes(currentMonth)) {
        personalizedTasks.push({ id: 'thin-carrots', text: 'Thin carrot seedlings to 2" apart', icon: '🌱', season: 'spring' });
      }
    }
    
    // Check for peppers - fertilizing
    if (uniquePlants.includes('pepper')) {
      if (['june', 'july'].includes(currentMonth)) {
        personalizedTasks.push({ id: 'feed-peppers', text: 'Side-dress peppers with calcium', icon: '💊', season: 'summer' });
      }
    }
    
    // Check for herbs - harvesting/drying
    if (uniquePlants.some(id => ['basil', 'oregano', 'thyme', 'rosemary', 'mint'].includes(id))) {
      if (['july', 'august', 'september'].includes(currentMonth)) {
        personalizedTasks.push({ id: 'dry-herbs', text: 'Harvest and dry herbs', icon: '🌿', season: 'summer' });
      }
    }
    
    // Check for leafy greens - heat protection
    if (uniquePlants.some(id => ['lettuce', 'spinach', 'kale'].includes(id))) {
      if (['june', 'july'].includes(currentMonth)) {
        personalizedTasks.push({ id: 'shade-greens', text: 'Provide shade for lettuce in heat', icon: '☂️', season: 'summer' });
      }
    }
    
    // Check for garlic - planting/harvest
    if (uniquePlants.includes('garlic')) {
      if (currentMonth === 'september' || currentMonth === 'october') {
        personalizedTasks.push({ id: 'plant-garlic', text: 'Plant garlic cloves 6 weeks before freeze', icon: '🧄', season: 'fall' });
      }
      if (currentMonth === 'june' || currentMonth === 'july') {
        personalizedTasks.push({ id: 'harvest-garlic', text: 'Harvest garlic when leaves brown', icon: '🧄', season: 'summer' });
      }
    }
    
    // Check for strawberries - renovation
    if (uniquePlants.includes('strawberry')) {
      if (currentMonth === 'july' || currentMonth === 'august') {
        personalizedTasks.push({ id: 'renovate-strawberry', text: 'Renovate strawberry beds after harvest', icon: '🍓', season: 'summer' });
      }
    }
    
    // Add zone-specific tips
    if (zoneAdjustments[zone]) {
      tips.push(`Zone ${zone}: ${zoneAdjustments[zone][0]}`);
    }
    
    return { tasks: personalizedTasks, tip: tips.join(' ') };
  };
  
  const { tasks, tip } = getPersonalizedTasks();
  
  const isTaskCompleted = (taskId: string) => {
    return completedTasks.some(t => t.taskId === taskId && t.month === currentMonth);
  };
  
  const toggleTask = (taskId: string) => {
    if (isTaskCompleted(taskId)) {
      setCompletedTasks(completedTasks.filter(t => !(t.taskId === taskId && t.month === currentMonth)));
    } else {
      setCompletedTasks([...completedTasks, { taskId, month: currentMonth, completedAt: Date.now() }]);
    }
  };
  
  const completedCount = tasks.filter(t => isTaskCompleted(t.id)).length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  
  // Get season color
  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'winter': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'spring': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'summer': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'fall': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const monthNamesDisplay = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span className="text-xl">📋</span> Monthly Tasks
        </h3>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
          Zone {zone}
        </span>
      </div>
      
      {/* Month selector */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
        {monthNamesDisplay.map((name, idx) => (
          <button
            key={name}
            onClick={() => setCurrentMonth(monthNames[idx])}
            className={`px-2 py-1 text-xs rounded transition-colors whitespace-nowrap ${
              currentMonth === monthNames[idx]
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-gray-600 dark:text-gray-400">{completedCount}/{tasks.length}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Tasks list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.map(task => (
          <label
            key={task.id}
            className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
              isTaskCompleted(task.id)
                ? 'bg-green-50 dark:bg-green-900/30'
                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <input
              type="checkbox"
              checked={isTaskCompleted(task.id)}
              onChange={() => toggleTask(task.id)}
              className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>{task.icon}</span>
                <span className={`text-sm ${
                  isTaskCompleted(task.id)
                    ? 'text-gray-400 line-through'
                    : 'text-gray-700 dark:text-gray-200'
                }`}>
                  {task.text}
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getSeasonColor(task.season)}`}>
                {task.season}
              </span>
            </div>
          </label>
        ))}
      </div>
      
      {/* Tip */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
        <p className="text-xs text-amber-800 dark:text-amber-200">
          💡 {tip}
        </p>
      </div>
      
      {/* Plant-specific reminder */}
      {placedPlants.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            🌱 You have {placedPlants.length} plants in your garden that need attention this month!
          </p>
        </div>
      )}
    </div>
  );
}
