'use client';

import { useState, useRef, useEffect } from 'react';
import { useGardenStore } from '@/stores/gardenStore';
import { getPlantById, plants } from '@/lib/plants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  { id: '1', text: "What should I plant now?", icon: '🌱' },
  { id: '2', text: "Help with pests", icon: '🐛' },
  { id: '3', text: "Companion plants?", icon: '🤝' },
  { id: '4', text: "Harvest tips?", icon: '🧺' },
];

export default function GardenAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your Garden AI Assistant. I can help with planting advice, pest control, companion planting, harvest tips, and more. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { placedPlants, gardens, activeGardenId, zone } = useGardenStore();
  
  const currentGarden = gardens.find(g => g.id === activeGardenId);
  
  // Get zone - either from store or default
  const gardenZone = zone;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Get current season and date info
    const now = new Date();
    const month = now.getMonth();
    const season = month >= 2 && month <= 4 ? 'spring' : month >= 5 && month <= 7 ? 'summer' : month >= 8 && month <= 10 ? 'fall' : 'winter';
    
    // Get plants in garden
    const gardenPlants = placedPlants.map(p => {
      const plant = getPlantById(p.plantId);
      return plant ? { ...p, plant } : null;
    }).filter(Boolean);
    
    // Build context about the user's garden
    const gardenContext = currentGarden ? `
Current Garden: ${currentGarden.name}
Grid Size: ${currentGarden.gridSize}x${currentGarden.gridSize}
USDA Zone: ${zone || 'Not set'}
Plants in garden: ${gardenPlants.length > 0 ? gardenPlants.map(p => p!.plant.name).join(', ') : 'None yet'}
` : 'No garden created yet.';

    // Analyze user question and provide contextual response
    const lowerMessage = userMessage.toLowerCase();
    
    // Planting timing questions
    if (lowerMessage.includes('plant') && (lowerMessage.includes('when') || lowerMessage.includes('now') || lowerMessage.includes('time') || lowerMessage.includes('season'))) {
      const springPlants = plants.filter(p => p.plantingSeason?.includes('spring')).slice(0, 5);
      const summerPlants = plants.filter(p => p.plantingSeason?.includes('summer')).slice(0, 5);
      
      let response = `📅 **Planting Guide for ${season.charAt(0).toUpperCase() + season.slice(1)}**\n\n`;
      
      if (season === 'spring') {
        response += `Great timing! It's perfect planting weather. Here are some ideal crops to start now:\n\n`;
        response += springPlants.map(p => `🌱 ${p.name} - ${p.daysToMaturity} days`).join('\n');
        response += `\n\n💡 Tip: Start tomatoes and peppers indoors 6-8 weeks before last frost, then transplant outside.`;
      } else if (season === 'summer') {
        response += `Summer is in full swing! Consider succession planting for continuous harvest:\n\n`;
        response += summerPlants.map(p => `🌱 ${p.name} - ${p.daysToMaturity} days`).join('\n');
        response += `\n\n💡 Tip: Water deeply in early morning to reduce evaporation.`;
      } else if (season === 'fall') {
        response += `Fall is perfect for cool-season crops:\n\n`;
        response += `🥬 Lettuce, 🥕 Carrots, 🥒 Broccoli, 🧅 Spinach, 🧄 Kale\n\n`;
        response += `💡 Tip: Plant garlic now for next year's harvest!`;
      } else {
        response += `It's winter! Time to plan next year's garden and order seeds.\n\n`;
        response += `💡 Tip: Review your garden notes and plan crop rotation.`;
      }
      
      return response;
    }
    
    // Pest questions
    if (lowerMessage.includes('pest') || lowerMessage.includes('bug') || lowerMessage.includes('insect') || lowerMessage.includes('disease')) {
      let response = `🐛 **Pest Management Tips**\n\n`;
      
      // Check if user has specific plants that have pest issues
      const plantNames = gardenPlants.map(p => p!.plant.name.toLowerCase());
      
      if (plantNames.some(n => n.includes('tomato'))) {
        response += `🍅 For Tomatoes: Watch for hornworms - handpick or use BT spray. Also watch for aphids.\n\n`;
      }
      if (plantNames.some(n => n.includes('pepper'))) {
        response += `🫑 For Peppers: Protect from aphids and flea beetles. Use row covers early in season.\n\n`;
      }
      if (plantNames.some(n => n.includes('cabbage') || n.includes('broccoli'))) {
        response += `🥦 For Brassicas: Watch for cabbage worms - use row covers or organic BT spray.\n\n`;
      }
      
      response += `**General Organic Pest Control:**\n`;
      response += `🧼 Spray aphids off with water\n`;
      response += `🐞 Introduce ladybugs (natural predators)\n`;
      response += `🌿 Use neem oil for soft-bodied insects\n`;
      response += `🏕️ Row covers to prevent insect damage\n`;
      response += `🔄 Crop rotation to break pest cycles\n`;
      
      return response;
    }
    
    // Companion planting questions
    if (lowerMessage.includes('companion') || lowerMessage.includes('good together') || lowerMessage.includes('bad together')) {
      let response = `🤝 **Companion Planting Guide**\n\n`;
      
      // Check user's garden for specific advice
      if (gardenPlants.length > 0) {
        response += `Based on your garden:\n\n`;
        
        gardenPlants.forEach(p => {
          if (p!.plant.companions.length > 0) {
            const companions = p!.plant.companions.slice(0, 3).map(id => getPlantById(id)?.name).join(', ');
            response += `✅ ${p!.plant.name} grows well with: ${companions}\n`;
          }
          if (p!.plant.antagonists.length > 0) {
            const antagonists = p!.plant.antagonists.slice(0, 2).map(id => getPlantById(id)?.name).join(', ');
            response += `❌ ${p!.plant.name} should avoid: ${antagonists}\n`;
          }
        });
      } else {
        response += `**Classic Companion Combinations:**\n\n`;
        response += `✅ Tomatoes + Basil = Better flavor, pest deterrent\n`;
        response += `✅ Carrots + Onions = Natural pest control\n`;
        response += `✅ Corn + Beans + Squash = Three Sisters method\n`;
        response += `✅ Lettuce + Strawberries = Space-saving companions\n`;
        response += `❌ Tomatoes + Cabbage = stunt growth\n`;
        response += `❌ Onions + Beans = reduce bean yield\n`;
      }
      
      return response;
    }
    
    // Harvest questions
    if (lowerMessage.includes('harvest') || lowerMessage.includes('ready') || lowerMessage.includes('when to pick')) {
      let response = `🧺 **Harvest Timing Guide**\n\n`;
      
      if (gardenPlants.length > 0) {
        response += `Your plants:\n\n`;
        
        gardenPlants.forEach(p => {
          if (p!.plant.daysToMaturity) {
            response += `${p!.plant.emoji} ${p!.plant.name}: ${p!.plant.daysToMaturity} days to maturity\n`;
          }
        });
        
        response += `\n💡 General harvest tips:\n`;
        response += `• Harvest in morning for best flavor\n`;
        response += `• Pick regularly to encourage more production\n`;
        response += `• Use clean, sharp scissors to avoid plant damage\n`;
      } else {
        response += `**Quick Harvest Tips:**\n\n`;
        response += `🍅 Tomatoes: Pick when fully colored but still firm\n`;
        response += `🥒 Cucumbers: Harvest young (6-8") for best texture\n`;
        response += `🥬 Leafy greens: Cut outer leaves, let center grow\n`;
        response += `🫑 Peppers: Green = early, Red/Yellow = sweeter\n`;
        response += `🥕 Carrots: Tops visible, about 1" diameter\n`;
      }
      
      return response;
    }
    
    // Water/irrigation questions
    if (lowerMessage.includes('water') || lowerMessage.includes('irrigat') || lowerMessage.includes('drought')) {
      let response = `💧 **Watering Guide**\n\n`;
      
      response += `**General Guidelines:**\n`;
      response += `• Most gardens need 1-2 inches of water per week\n`;
      response += `• Water deeply but less frequently to encourage deep roots\n`;
      response += `• Water in morning to reduce fungal disease\n`;
      response += `• Avoid wetting leaves - water at soil level\n\n`;
      
      if (gardenPlants.length > 0) {
        response += `**Your Plants' Needs:**\n`;
        
        const waterNeeds = gardenPlants.filter(p => p!.plant.waterNeeds === 'high');
        const lowWater = gardenPlants.filter(p => p!.plant.waterNeeds === 'low');
        
        if (waterNeeds.length > 0) {
          response += `💦 High water needs: ${waterNeeds.map(p => p!.plant.name).join(', ')}\n`;
        }
        if (lowWater.length > 0) {
          response += `🌵 Drought tolerant: ${lowWater.map(p => p!.plant.name).join(', ')}\n`;
        }
      }
      
      response += `\n💡 **Water-Saving Tips:**\n`;
      response += `• Mulch around plants to retain moisture\n`;
      response += `• Use drip irrigation or soaker hoses\n`;
      response += `• Collect rainwater for garden use\n`;
      response += `• Group plants with similar water needs together\n`;
      
      return response;
    }
    
    // Sun/light questions
    if (lowerMessage.includes('sun') || lowerMessage.includes('light') || lowerMessage.includes('shade')) {
      let response = `☀️ **Sun Requirements Guide**\n\n`;
      
      response += `**Understanding Light Needs:**\n`;
      response += `• Full Sun: 6+ hours direct sunlight\n`;
      response += `• Part Sun: 4-6 hours direct sunlight\n`;
      response += `• Part Shade: 2-4 hours direct sunlight\n`;
      response += `• Shade: Less than 2 hours direct sunlight\n\n`;
      
      if (gardenPlants.length > 0) {
        response += `**Your Plants:**\n`;
        
        const fullSun = gardenPlants.filter(p => p!.plant.sunNeeds === 'full-sun');
        const partSun = gardenPlants.filter(p => p!.plant.sunNeeds === 'part-sun');
        
        if (fullSun.length > 0) {
          response += `☀️ Full Sun: ${fullSun.map(p => p!.plant.name).join(', ')}\n`;
        }
        if (partSun.length > 0) {
          response += `⛅ Part Sun: ${partSun.map(p => p!.plant.name).join(', ')}\n`;
        }
      }
      
      return response;
    }
    
    // Soil/fertilizer questions
    if (lowerMessage.includes('soil') || lowerMessage.includes('fertil') || lowerMessage.includes('compost') || lowerMessage.includes('nutrient')) {
      let response = `🌍 **Soil & Fertilizer Guide**\n\n`;
      
      response += `**Soil Health Basics:**\n`;
      response += `• Test your soil pH (ideal: 6.0-7.0 for most vegetables)\n`;
      response += `• Add compost annually to improve soil structure\n`;
      response += `• Use organic fertilizers for slow-release nutrients\n`;
      response += `• Rotate crops to prevent nutrient depletion\n\n`;
      
      response += `**Quick Fertilizer Tips:**\n`;
      response += `🥚 Eggshells: Add calcium for tomatoes, peppers\n`;
      response += `🧐 Epsom salt: Magnesium for leafy greens\n`;
      response += `☕ Coffee grounds: Nitrogen for acid-loving plants\n`;
      response += `🍌 Banana peels: Potassium boost for fruiting plants\n`;
      
      return response;
    }
    
    // General help or unclear questions
    if (lowerMessage.includes('help') || lowerMessage.includes('advice') || lowerMessage.includes('tip') || lowerMessage.length < 10) {
      return `🌻 **I'm here to help! Here's what I can do:**\n\n` +
        `🌱 **Planting** - When and what to plant this season\n` +
        `🐛 **Pests** - Natural pest control solutions\n` +
        `🤝 **Companions** - Good and bad plant combinations\n` +
        `🧺 **Harvest** - When and how to harvest\n` +
        `💧 **Water** - Irrigation and watering tips\n` +
        `☀️ **Sun** - Light requirements for plants\n` +
        `🌍 **Soil** - Soil health and fertilizer advice\n\n` +
        `Just ask me anything about your garden!`;
    }
    
    // Default contextual response
    return `🌻 **Garden Tip:** ${season.charAt(0).toUpperCase() + season.slice(1)} is a great time to be in the garden!\n\n` +
      `${gardenPlants.length > 0 ? `I see you have ${gardenPlants.length} plants in your garden. Would you like specific advice about any of them?` : `You've started a ${currentGarden?.gridSize || 4}x${currentGarden?.gridSize || 4} garden. Add some plants and I can give personalized advice!`}\n\n` +
      `Feel free to ask about planting, pests, companion plants, watering, or any other gardening questions!`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Simulate AI response with contextual gardening advice
      const response = await generateResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process your request. Please try again!",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h2 className="font-bold text-lg">Garden Assistant</h2>
            <p className="text-xs text-white/80">AI-powered gardening help</p>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-md'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-white/70' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Questions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
        {quickQuestions.map((q) => (
          <button
            key={q.id}
            onClick={() => handleQuickQuestion(q.text)}
            className="flex-shrink-0 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900 text-xs rounded-full transition-colors flex items-center gap-1"
          >
            <span>{q.icon}</span>
            <span>{q.text}</span>
          </button>
        ))}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about gardening..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
