// Achievement definitions for GardenGrid

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'planting' | 'harvesting' | 'companion' | 'consistency' | 'exploration';
  requirement: number;
  type: 'plants_placed' | 'harvests_logged' | 'companion_pairs' | 'days_active' | 'plants_varieties' | 'journals_written' | 'photos_uploaded' | 'tasks_completed';
}

export const achievements: Achievement[] = [
  // Planting achievements
  {
    id: 'first_plant',
    name: 'First Sprout',
    description: 'Plant your first vegetable',
    icon: '🌱',
    category: 'planting',
    requirement: 1,
    type: 'plants_placed',
  },
  {
    id: 'ten_plants',
    name: 'Growing Collection',
    description: 'Plant 10 vegetables',
    icon: '🌿',
    category: 'planting',
    requirement: 10,
    type: 'plants_placed',
  },
  {
    id: 'fifty_plants',
    name: 'Green Thumb',
    description: 'Plant 50 vegetables',
    icon: '🪴',
    category: 'planting',
    requirement: 50,
    type: 'plants_placed',
  },
  
  // Variety achievements
  {
    id: 'five_varieties',
    name: 'Biodiversity',
    description: 'Grow 5 different types of plants',
    icon: '🌈',
    category: 'exploration',
    requirement: 5,
    type: 'plants_varieties',
  },
  {
    id: 'twenty_varieties',
    name: 'Plant Collector',
    description: 'Grow 20 different types of plants',
    icon: '🏆',
    category: 'exploration',
    requirement: 20,
    type: 'plants_varieties',
  },
  
  // Companion planting achievements
  {
    id: 'first_companion',
    name: 'Perfect Pair',
    description: 'Place 2 companion plants next to each other',
    icon: '💚',
    category: 'companion',
    requirement: 1,
    type: 'companion_pairs',
  },
  {
    id: 'five_companions',
    name: 'Friendship Garden',
    description: 'Create 5 companion plant pairs',
    icon: '🤝',
    category: 'companion',
    requirement: 5,
    type: 'companion_pairs',
  },
  {
    id: 'harmonious_garden',
    name: 'Harmonious Garden',
    description: 'Achieve 90% garden harmony score',
    icon: '✨',
    category: 'companion',
    requirement: 90,
    type: 'companion_pairs',
  },
  
  // Harvest achievements
  {
    id: 'first_harvest',
    name: 'First Harvest',
    description: 'Log your first harvest',
    icon: '🧺',
    category: 'harvesting',
    requirement: 1,
    type: 'harvests_logged',
  },
  {
    id: 'ten_harvests',
    name: 'Harvest Season',
    description: 'Log 10 harvests',
    icon: '🌾',
    category: 'harvesting',
    requirement: 10,
    type: 'harvests_logged',
  },
  {
    id: 'fifty_harvests',
    name: 'Master Gardener',
    description: 'Log 50 harvests',
    icon: '👨‍🌾',
    category: 'harvesting',
    requirement: 50,
    type: 'harvests_logged',
  },
  
  // Consistency achievements
  {
    id: 'week_streak',
    name: 'Weekly Warrior',
    description: 'Visit your garden 7 days in a row',
    icon: '📅',
    category: 'consistency',
    requirement: 7,
    type: 'days_active',
  },
  {
    id: 'month_streak',
    name: 'Monthly Mentor',
    description: 'Visit your garden 30 days in a row',
    icon: '🗓️',
    category: 'consistency',
    requirement: 30,
    type: 'days_active',
  },
  
  // Journal achievements
  {
    id: 'first_note',
    name: 'Garden Diary',
    description: 'Write your first journal entry',
    icon: '📝',
    category: 'consistency',
    requirement: 1,
    type: 'journals_written',
  },
  {
    id: 'ten_notes',
    name: 'Chronicler',
    description: 'Write 10 journal entries',
    icon: '📖',
    category: 'consistency',
    requirement: 10,
    type: 'journals_written',
  },
  
  // Photo achievements
  {
    id: 'first_photo',
    name: 'Memory Keeper',
    description: 'Upload your first garden photo',
    icon: '📸',
    category: 'exploration',
    requirement: 1,
    type: 'photos_uploaded',
  },
  {
    id: 'ten_photos',
    name: 'Garden Portfolio',
    description: 'Upload 10 garden photos',
    icon: '🖼️',
    category: 'exploration',
    requirement: 10,
    type: 'photos_uploaded',
  },
  
  // Task achievements
  {
    id: 'first_task',
    name: 'Task Master',
    description: 'Complete your first garden task',
    icon: '✅',
    category: 'consistency',
    requirement: 1,
    type: 'tasks_completed',
  },
  {
    id: 'twenty_tasks',
    name: 'Diligent Gardener',
    description: 'Complete 20 garden tasks',
    icon: '🎯',
    category: 'consistency',
    requirement: 20,
    type: 'tasks_completed',
  },
];
