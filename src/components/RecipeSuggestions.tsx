'use client';

import { useMemo, useState } from 'react';
import { PlacedPlant } from '@/stores/gardenStore';
import { getPlantById } from '@/lib/plants';

interface Recipe {
  id: string;
  name: string;
  emoji: string;
  ingredients: string[]; // plant IDs
  optionalIngredients: string[];
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  category: 'salad' | 'soup' | 'main' | 'side' | 'sauce' | 'dessert' | 'drink';
}

const recipes: Recipe[] = [
  // Tomato-based recipes
  {
    id: 'caprese',
    name: 'Caprese Salad',
    emoji: '🥗',
    ingredients: ['tomato', 'basil'],
    optionalIngredients: ['onion', 'garlic'],
    time: '10 min',
    difficulty: 'Easy',
    description: 'Fresh tomatoes with mozzarella and basil',
    category: 'salad',
  },
  {
    id: 'marinara',
    name: 'Homemade Marinara',
    emoji: '🍝',
    ingredients: ['tomato', 'garlic', 'basil', 'onion'],
    optionalIngredients: ['oregano', 'pepper'],
    time: '45 min',
    difficulty: 'Easy',
    description: 'Classic Italian tomato sauce',
    category: 'sauce',
  },
  {
    id: 'salsa',
    name: 'Fresh Garden Salsa',
    emoji: '🌶️',
    ingredients: ['tomato', 'onion', 'pepper', 'cilantro', 'garlic'],
    optionalIngredients: ['lime', 'basil'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Fresh pico de gallo with garden veggies',
    category: 'sauce',
  },
  {
    id: 'bruschetta',
    name: 'Tomato Bruschetta',
    emoji: '🥖',
    ingredients: ['tomato', 'basil', 'garlic', 'onion'],
    optionalIngredients: ['oregano', 'pepper'],
    time: '20 min',
    difficulty: 'Easy',
    description: 'Toasted bread with fresh tomatoes',
    category: 'side',
  },
  // Salad recipes
  {
    id: 'greensalad',
    name: 'Garden Green Salad',
    emoji: '🥗',
    ingredients: ['lettuce', 'tomato', 'onion', 'carrot'],
    optionalIngredients: ['pepper', 'cucumber', 'radish', 'basil'],
    time: '10 min',
    difficulty: 'Easy',
    description: 'Fresh mixed salad with garden vegetables',
    category: 'salad',
  },
  {
    id: 'carrotsalad',
    name: 'Honey Glazed Carrots',
    emoji: '🥕',
    ingredients: ['carrot'],
    optionalIngredients: ['basil', 'parsley'],
    time: '25 min',
    difficulty: 'Easy',
    description: 'Sweet and savory glazed carrots',
    category: 'side',
  },
  {
    id: 'slaw',
    name: 'Cole Slaw',
    emoji: '🥬',
    ingredients: ['cabbage', 'carrot'],
    optionalIngredients: ['onion', 'pepper'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Classic creamy cabbage slaw',
    category: 'salad',
  },
  // Soup recipes
  {
    id: 'tomatosoup',
    name: 'Fresh Tomato Soup',
    emoji: '🍅',
    ingredients: ['tomato', 'onion', 'garlic', 'basil'],
    optionalIngredients: ['carrot', 'celery', 'oregano'],
    time: '40 min',
    difficulty: 'Easy',
    description: 'Creamy homemade tomato soup',
    category: 'soup',
  },
  {
    id: 'carrotsoup',
    name: 'Carrot Ginger Soup',
    emoji: '🥕',
    ingredients: ['carrot', 'onion', 'garlic'],
    optionalIngredients: ['ginger', 'cilantro', 'basil'],
    time: '35 min',
    difficulty: 'Easy',
    description: 'Warming carrot soup with ginger',
    category: 'soup',
  },
  {
    id: 'minestrone',
    name: 'Garden Minestrone',
    emoji: '🍲',
    ingredients: ['tomato', 'carrot', 'onion', 'bean', 'celery', 'zucchini'],
    optionalIngredients: ['garlic', 'basil', 'parsley', 'kale'],
    time: '60 min',
    difficulty: 'Medium',
    description: 'Hearty Italian vegetable soup',
    category: 'soup',
  },
  {
    id: 'potatosoup',
    name: 'Creamy Potato Soup',
    emoji: '🥔',
    ingredients: ['potato', 'onion', 'garlic'],
    optionalIngredients: ['chives', 'celery', 'carrot'],
    time: '45 min',
    difficulty: 'Easy',
    description: 'Rich and creamy potato soup',
    category: 'soup',
  },
  // Main dishes
  {
    id: 'stirfry',
    name: 'Garden Stir Fry',
    emoji: '🥘',
    ingredients: ['broccoli', 'pepper', 'carrot', 'onion', 'garlic'],
    optionalIngredients: ['zucchini', 'cabbage', 'basil', 'cilantro', 'ginger'],
    time: '25 min',
    difficulty: 'Medium',
    description: 'Quick stir-fried vegetables',
    category: 'main',
  },
  {
    id: 'pasta primavera',
    name: 'Pasta Primavera',
    emoji: '🍝',
    ingredients: ['tomato', 'zucchini', 'pepper', 'onion', 'garlic', 'basil'],
    optionalIngredients: ['carrot', 'broccoli', 'garlic'],
    time: '30 min',
    difficulty: 'Easy',
    description: 'Pasta with fresh garden vegetables',
    category: 'main',
  },
  {
    id: 'ratatouille',
    name: 'Provençal Ratatouille',
    emoji: '🥘',
    ingredients: ['tomato', 'zucchini', 'pepper', 'onion', 'garlic', 'basil'],
    optionalIngredients: ['eggplant', 'oregano', 'thyme'],
    time: '60 min',
    difficulty: 'Medium',
    description: 'Classic French vegetable stew',
    category: 'main',
  },
  {
    id: 'stuffedpepper',
    name: 'Stuffed Bell Peppers',
    emoji: '🫑',
    ingredients: ['pepper', 'tomato', 'onion', 'garlic', 'basil'],
    optionalIngredients: ['carrot', 'celery', 'oregano'],
    time: '50 min',
    difficulty: 'Medium',
    description: 'Peppers stuffed with garden veggies',
    category: 'main',
  },
  {
    id: 'friedrice',
    name: 'Vegetable Fried Rice',
    emoji: '🍚',
    ingredients: ['carrot', 'onion', 'garlic', 'pea'],
    optionalIngredients: ['corn', 'pepper', 'basil', 'cilantro'],
    time: '20 min',
    difficulty: 'Easy',
    description: 'Quick fried rice with garden veggies',
    category: 'main',
  },
  {
    id: 'pizza',
    name: 'Garden Vegetable Pizza',
    emoji: '🍕',
    ingredients: ['tomato', 'basil', 'pepper', 'onion'],
    optionalIngredients: ['zucchini', 'mushroom', 'garlic', 'oregano'],
    time: '40 min',
    difficulty: 'Medium',
    description: 'Homemade pizza with fresh toppings',
    category: 'main',
  },
  {
    id: 'fajitas',
    name: 'Veggie Fajitas',
    emoji: '🌯',
    ingredients: ['pepper', 'onion', 'tomato', 'cilantro', 'garlic'],
    optionalIngredients: ['corn', 'basil', 'lime'],
    time: '25 min',
    difficulty: 'Easy',
    description: 'Sizzling vegetable fajitas',
    category: 'main',
  },
  // Side dishes
  {
    id: 'roastedveggies',
    name: 'Roasted Garden Vegetables',
    emoji: '🥗',
    ingredients: ['carrot', 'potato', 'onion', 'pepper', 'zucchini'],
    optionalIngredients: ['garlic', 'basil', 'thyme', 'rosemary'],
    time: '45 min',
    difficulty: 'Easy',
    description: 'Caramelized roasted vegetables',
    category: 'side',
  },
  {
    id: 'coleslaw',
    name: 'Fresh Coleslaw',
    emoji: '🥬',
    ingredients: ['cabbage', 'carrot'],
    optionalIngredients: ['onion', 'pepper', 'cilantro'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Crunchy cabbage slaw',
    category: 'side',
  },
  {
    id: 'guacamole',
    name: 'Garden Guacamole',
    emoji: '🥑',
    ingredients: ['tomato', 'onion', 'pepper', 'cilantro', 'garlic'],
    optionalIngredients: ['basil', 'lime', 'corn'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Fresh homemade guacamole',
    category: 'side',
  },
  {
    id: 'hummus',
    name: 'Garden Hummus',
    emoji: '🫘',
    ingredients: ['garlic', 'basil', 'cilantro'],
    optionalIngredients: ['pepper', 'carrot'],
    time: '10 min',
    difficulty: 'Easy',
    description: 'Creamy herb hummus',
    category: 'side',
  },
  // Herb-focused
  {
    id: 'pesto',
    name: 'Fresh Basil Pesto',
    emoji: '🌿',
    ingredients: ['basil', 'garlic'],
    optionalIngredients: ['parsley', 'cilantro', 'spinach'],
    time: '10 min',
    difficulty: 'Easy',
    description: 'Classic basil pesto sauce',
    category: 'sauce',
  },
  {
    id: 'chimichurri',
    name: 'Chimichurri Sauce',
    emoji: '🌿',
    ingredients: ['parsley', 'cilantro', 'garlic', 'onion'],
    optionalIngredients: ['basil', 'oregano'],
    time: '10 min',
    difficulty: 'Easy',
    description: 'Fresh herb sauce for grilled foods',
    category: 'sauce',
  },
  {
    id: 'herbinfusedwater',
    name: 'Herb Infused Water',
    emoji: '💧',
    ingredients: ['basil', 'mint'],
    optionalIngredients: ['cilantro', 'lavender', 'rosemary'],
    time: '5 min',
    difficulty: 'Easy',
    description: 'Refreshing infused water',
    category: 'drink',
  },
  // Pickles & preserves
  {
    id: 'pickles',
    name: 'Quick Pickles',
    emoji: '🥒',
    ingredients: ['cucumber', 'onion', 'garlic', 'dill'],
    optionalIngredients: ['pepper', 'carrot', 'basil'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Fast refrigerator pickles',
    category: 'side',
  },
  {
    id: 'salsaverde',
    name: 'Salsa Verde',
    emoji: '🫛',
    ingredients: ['tomato', 'onion', 'garlic', 'cilantro', 'pepper'],
    optionalIngredients: ['basil', 'oregano'],
    time: '20 min',
    difficulty: 'Easy',
    description: 'Green tomato salsa',
    category: 'sauce',
  },
  // Fruit/dessert
  {
    id: 'fruit salad',
    name: 'Garden Fruit Salad',
    emoji: '🍓',
    ingredients: ['strawberry', 'blueberry', 'raspberry'],
    optionalIngredients: ['basil', 'mint'],
    time: '10 min',
    difficulty: 'Easy',
    description: 'Mixed berry fruit salad',
    category: 'dessert',
  },
  {
    id: 'strawberryshortcake',
    name: 'Strawberry Shortcake',
    emoji: '🍰',
    ingredients: ['strawberry'],
    optionalIngredients: ['basil', 'mint'],
    time: '30 min',
    difficulty: 'Medium',
    description: 'Fresh strawberry dessert',
    category: 'dessert',
  },
  // Beans & legumes
  {
    id: 'beansalad',
    name: 'Three Bean Salad',
    emoji: '🫘',
    ingredients: ['bean', 'onion', 'pepper', 'cilantro'],
    optionalIngredients: ['carrot', 'tomato', 'basil'],
    time: '20 min',
    difficulty: 'Easy',
    description: 'Protein-packed bean salad',
    category: 'salad',
  },
  {
    id: 'hummusclassic',
    name: 'Classic Hummus',
    emoji: '🫘',
    ingredients: ['garlic'],
    optionalIngredients: ['basil', 'cilantro', 'pepper'],
    time: '10 min',
    difficulty: 'Easy',
    description: 'Creamy chickpea dip',
    category: 'side',
  },
  // Corn
  {
    id: 'cornchowder',
    name: 'Corn Chowder',
    emoji: '🌽',
    ingredients: ['corn', 'potato', 'onion', 'garlic'],
    optionalIngredients: ['pepper', 'basil', 'cilantro'],
    time: '45 min',
    difficulty: 'Medium',
    description: 'Creamy corn soup',
    category: 'soup',
  },
  {
    id: 'cornsalad',
    name: 'Mexican Corn Salad',
    emoji: '🌽',
    ingredients: ['corn', 'pepper', 'onion', 'cilantro'],
    optionalIngredients: ['basil', 'tomato', 'lime'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Elote-inspired salad',
    category: 'salad',
  },
  // Cucumber
  {
    id: 'cucumbersalad',
    name: 'Cucumber Salad',
    emoji: '🥒',
    ingredients: ['cucumber', 'onion', 'tomato'],
    optionalIngredients: ['pepper', 'basil', 'cilantro', 'dill'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Refreshing cucumber salad',
    category: 'salad',
  },
  {
    id: 'tzatziki',
    name: 'Garden Tzatziki',
    emoji: '🥒',
    ingredients: ['cucumber', 'garlic', 'dill'],
    optionalIngredients: ['basil', 'mint', 'pepper'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Greek cucumber yogurt dip',
    category: 'side',
  },
  // Potatoes
  {
    id: 'potatosalad',
    name: 'Classic Potato Salad',
    emoji: '🥔',
    ingredients: ['potato', 'onion', 'celery', 'garlic'],
    optionalIngredients: ['carrot', 'basil', 'parsley'],
    time: '30 min',
    difficulty: 'Easy',
    description: 'Creamy potato salad',
    category: 'salad',
  },
  {
    id: 'roastedpotatoes',
    name: 'Roasted Rosemary Potatoes',
    emoji: '🥔',
    ingredients: ['potato', 'rosemary'],
    optionalIngredients: ['garlic', 'thyme', 'basil'],
    time: '45 min',
    difficulty: 'Easy',
    description: 'Crispy herb roasted potatoes',
    category: 'side',
  },
  // Kale & greens
  {
    id: 'kalechips',
    name: 'Kale Chips',
    emoji: '🥬',
    ingredients: ['kale', 'garlic'],
    optionalIngredients: ['basil', 'rosemary'],
    time: '20 min',
    difficulty: 'Easy',
    description: 'Crispy baked kale chips',
    category: 'side',
  },
  {
    id: 'kalesalad',
    name: 'Massaged Kale Salad',
    emoji: '🥬',
    ingredients: ['kale', 'carrot', 'onion', 'garlic'],
    optionalIngredients: ['pepper', 'basil', 'cilantro', 'lemon'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Tender massaged kale salad',
    category: 'salad',
  },
  {
    id: 'spinachsalad',
    name: 'Spinach Salad',
    emoji: '🥬',
    ingredients: ['spinach', 'onion', 'garlic'],
    optionalIngredients: ['carrot', 'tomato', 'basil', 'strawberry'],
    time: '10 min',
    difficulty: 'Easy',
    description: 'Fresh spinach with toppings',
    category: 'salad',
  },
  // Eggplant
  {
    id: 'eggplantparm',
    name: 'Eggplant Parmesan',
    emoji: '🍆',
    ingredients: ['eggplant', 'tomato', 'basil', 'garlic'],
    optionalIngredients: ['oregano', 'pepper', 'onion'],
    time: '75 min',
    difficulty: 'Hard',
    description: 'Crispy breaded eggplant casserole',
    category: 'main',
  },
  {
    id: 'babaganoush',
    name: 'Baba Ganoush',
    emoji: '🍆',
    ingredients: ['eggplant', 'garlic'],
    optionalIngredients: ['basil', 'cilantro', 'pepper'],
    time: '45 min',
    difficulty: 'Medium',
    description: 'Smoky roasted eggplant dip',
    category: 'side',
  },
  // Zucchini
  {
    id: 'zoodles',
    name: 'Zucchini Noodles',
    emoji: '🥒',
    ingredients: ['zucchini', 'garlic', 'tomato'],
    optionalIngredients: ['basil', 'oregano', 'pepper'],
    time: '20 min',
    difficulty: 'Easy',
    description: 'Low-carb zucchini pasta',
    category: 'main',
  },
  {
    id: 'zucchinibread',
    name: 'Zucchini Bread',
    emoji: '🍞',
    ingredients: ['zucchini'],
    optionalIngredients: ['basil', 'mint'],
    time: '60 min',
    difficulty: 'Medium',
    description: 'Sweet zucchini loaf',
    category: 'dessert',
  },
  {
    id: 'stuffedzucchini',
    name: 'Stuffed Zucchini',
    emoji: '🥒',
    ingredients: ['zucchini', 'tomato', 'onion', 'garlic', 'basil'],
    optionalIngredients: ['pepper', 'carrot', 'oregano'],
    time: '45 min',
    difficulty: 'Medium',
    description: 'Zucchini boats with filling',
    category: 'main',
  },
  // Cabbage
  {
    id: 'stirfrycabbage',
    name: 'Stir Fried Cabbage',
    emoji: '🥬',
    ingredients: ['cabbage', 'onion', 'garlic'],
    optionalIngredients: ['carrot', 'pepper', 'basil', 'ginger'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Quick fried cabbage',
    category: 'side',
  },
  {
    id: 'cabblerolls',
    name: 'Cabbage Rolls',
    emoji: '🥬',
    ingredients: ['cabbage', 'onion', 'carrot', 'tomato', 'garlic'],
    optionalIngredients: ['basil', 'celery', 'pepper'],
    time: '90 min',
    difficulty: 'Hard',
    description: 'Stuffed cabbage in tomato sauce',
    category: 'main',
  },
  // Broccoli
  {
    id: 'broccolisalad',
    name: 'Broccoli Salad',
    emoji: '🥦',
    ingredients: ['broccoli', 'onion', 'carrot'],
    optionalIngredients: ['garlic', 'basil', 'pepper'],
    time: '20 min',
    difficulty: 'Easy',
    description: 'Crunchy broccoli slaw',
    category: 'salad',
  },
  {
    id: 'garlicbroccoli',
    name: 'Garlic Broccoli',
    emoji: '🥦',
    ingredients: ['broccoli', 'garlic', 'onion'],
    optionalIngredients: ['basil', 'pepper', 'lemon'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Quick garlic broccoli',
    category: 'side',
  },
  // Cauliflower
  {
    id: 'cauliflowerrice',
    name: 'Cauliflower Rice',
    emoji: '🥦',
    ingredients: [],
    optionalIngredients: ['carrot', 'onion', 'garlic', 'basil', 'cilantro'],
    time: '15 min',
    difficulty: 'Easy',
    description: 'Low-carb cauliflower rice',
    category: 'side',
  },
  {
    id: 'roastedcauliflower',
    name: 'Roasted Cauliflower',
    emoji: '🥦',
    ingredients: [],
    optionalIngredients: ['garlic', 'basil', 'thyme', 'rosemary'],
    time: '30 min',
    difficulty: 'Easy',
    description: 'Caramelized roasted cauliflower',
    category: 'side',
  },
];

interface RecipeSuggestionsProps {
  placedPlants: PlacedPlant[];
}

export default function RecipeSuggestions({ placedPlants }: RecipeSuggestionsProps) {
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Get unique plant IDs from garden
  const gardenPlantIds = useMemo(() => {
    const ids = new Set(placedPlants.map(p => p.plantId));
    return Array.from(ids);
  }, [placedPlants]);
  
  // Score recipes based on how many ingredients are in the garden
  const scoredRecipes = useMemo(() => {
    return recipes.map(recipe => {
      const matchedIngredients = recipe.ingredients.filter(ing => gardenPlantIds.includes(ing));
      const optionalMatched = recipe.optionalIngredients.filter(ing => gardenPlantIds.includes(ing));
      const totalRequired = recipe.ingredients.length;
      const totalOptional = recipe.optionalIngredients.length;
      
      // Score: weighted combination of required and optional matches
      const requiredScore = totalRequired > 0 ? matchedIngredients.length / totalRequired : 1;
      const optionalScore = totalOptional > 0 ? optionalMatched.length / totalOptional : 0;
      const score = (requiredScore * 0.8) + (optionalScore * 0.2);
      
      return {
        ...recipe,
        matchedIngredients,
        optionalMatched,
        score,
        matchPercentage: Math.round(requiredScore * 100),
      };
    }).filter(r => r.matchedIngredients.length > 0 || r.optionalMatched.length > 0)
      .sort((a, b) => b.score - a.score);
  }, [gardenPlantIds]);
  
  // Filter by category
  const filteredRecipes = useMemo(() => {
    if (categoryFilter === 'all') return scoredRecipes;
    return scoredRecipes.filter(r => r.category === categoryFilter);
  }, [scoredRecipes, categoryFilter]);
  
  // Get emoji for difficulty
  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '✅';
      case 'Medium': return '⚠️';
      case 'Hard': return '🔥';
      default: return '❓';
    }
  };
  
  // Get category emoji
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'salad': return '🥗';
      case 'soup': return '🍲';
      case 'main': return '🍽️';
      case 'side': return '🥘';
      case 'sauce': return '🥫';
      case 'dessert': return '🍰';
      case 'drink': return '🍹';
      default: return '🍴';
    }
  };
  
  if (placedPlants.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
        <span>👩‍🍳</span> Recipe Ideas
      </h3>
      <p className="text-xs text-gray-500 mb-3">
        Based on what's in your garden
      </p>
      
      {/* Category filter */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-2 py-1 text-xs rounded-full transition-colors ${
            categoryFilter === 'all'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {['salad', 'soup', 'main', 'side', 'sauce', 'dessert'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2 py-1 text-xs rounded-full transition-colors ${
              categoryFilter === cat
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {getCategoryEmoji(cat)} {cat}
          </button>
        ))}
      </div>
      
      {/* Recipe list */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filteredRecipes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Add more plants to see recipe ideas!
          </p>
        ) : (
          filteredRecipes.slice(0, 8).map(recipe => (
            <div
              key={recipe.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <span>{recipe.emoji}</span>
                      <span className="truncate">{recipe.name}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{recipe.time}</span>
                      <span>{getDifficultyEmoji(recipe.difficulty)} {recipe.difficulty}</span>
                      <span className="text-green-600 font-medium">{recipe.matchPercentage}% match</span>
                    </div>
                  </div>
                  <span className="text-gray-400">{expandedRecipe === recipe.id ? '▲' : '▼'}</span>
                </div>
              </button>
              
              {/* Expanded details */}
              {expandedRecipe === recipe.id && (
                <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-600">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{recipe.description}</p>
                  
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Required from garden:</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recipe.ingredients.map(ing => {
                      const inGarden = gardenPlantIds.includes(ing);
                      const plant = getPlantById(ing);
                      return (
                        <span
                          key={ing}
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            inGarden
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {plant?.emoji || '❓'} {plant?.name || ing}
                        </span>
                      );
                    })}
                  </div>
                  
                  {recipe.optionalMatched.length > 0 && (
                    <>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Optional from garden:</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.optionalIngredients.map(ing => {
                          const inGarden = gardenPlantIds.includes(ing);
                          const plant = getPlantById(ing);
                          return (
                            <span
                              key={ing}
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                inGarden
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                              }`}
                            >
                              {plant?.emoji || '❓'} {plant?.name || ing}
                            </span>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {filteredRecipes.length > 8 && (
        <p className="text-xs text-gray-400 text-center mt-2">
          +{filteredRecipes.length - 8} more recipes
        </p>
      )}
    </div>
  );
}
