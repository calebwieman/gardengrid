import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GardenGrid - Plan Your Perfect Garden",
  description: "Plan your perfect garden with companion planting intelligence, weather alerts, and AI-powered recommendations.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="font-bold text-xl text-green-800">GardenGrid</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-gray-600 hover:text-green-600 font-medium">
              Open App
            </Link>
            <Link 
              href="/app" 
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Plan Your <span className="text-green-600">Perfect Garden</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Design beautiful garden layouts with companion planting intelligence. 
            Get personalized planting schedules, weather alerts, and AI-powered advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/app" 
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-lg font-bold rounded-xl transition-colors shadow-lg"
            >
              Start Free
            </Link>
            <button className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 text-lg font-medium rounded-xl border-2 border-gray-200 transition-colors">
              Watch Demo
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            No account required • Works offline • Free forever
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Everything You Need to Grow
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              emoji="🗺️"
              title="Smart Grid Layout"
              description="Drag and drop plants onto an interactive grid. Choose from 4x4, 8x8, or 12x12 layouts."
            />
            <FeatureCard 
              emoji="🤝"
              title="Companion Planting"
              description="Our AI analyzes your layout and shows which plants grow well together - or which to avoid."
            />
            <FeatureCard 
              emoji="📅"
              title="Planting Calendar"
              description="Get personalized planting schedules based on your USDA zone and local frost dates."
            />
            <FeatureCard 
              emoji="🌦️"
              title="Weather Alerts"
              description="Real-time weather widget with frost warnings and planting recommendations."
            />
            <FeatureCard 
              emoji="📸"
              title="Photo Journal"
              description="Document your garden journey with photos, notes, and harvest records."
            />
            <FeatureCard 
              emoji="💰"
              title="Cost Tracking"
              description="Track seeds, supplies, and expenses. Get cost estimates before you buy."
            />
            <FeatureCard 
              emoji="🏆"
              title="Achievements"
              description="Gamify your gardening with achievements for planting, harvesting, and exploring."
            />
            <FeatureCard 
              emoji="🌙"
              title="Moon Phases"
              description="Follow lunar gardening traditions with our moon phase tracker."
            />
            <FeatureCard 
              emoji="🤖"
              title="AI Assistant"
              description="Chat with our AI garden expert for personalized advice anytime."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              title="Create Your Garden"
              description="Choose your grid size and give your garden a name. It's that simple."
            />
            <StepCard 
              number="2"
              title="Add Plants"
              description="Browse 60+ plants or use our pre-made themes like Pizza Garden or Salad Garden."
            />
            <StepCard 
              number="3"
              title="Grow & Harvest"
              description="Track growth stages, get weather alerts, and log your harvests."
            />
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Example Gardens
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Start with pre-designed themes or create your own
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ThemeCard 
              emoji="🍕"
              name="Pizza Garden"
              plants="Tomato, Basil, Oregano, Pepper"
            />
            <ThemeCard 
              emoji="🥗"
              name="Salad Garden"
              plants="Lettuce, Cucumber, Tomato, Radish"
            />
            <ThemeCard 
              emoji="🌿"
              name="Herb Spiral"
              plants="Basil, Rosemary, Thyme, Mint"
            />
            <ThemeCard 
              emoji="🌽"
              name="Three Sisters"
              plants="Corn, Beans, Squash"
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Free Forever
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            GardenGrid is free to use with all core features. 
            No hidden fees, no ads, no account required.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Free</h3>
              <p className="text-3xl font-bold text-green-600 mb-4">$0</p>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✓ Unlimited gardens</li>
                <li>✓ 60+ plants</li>
                <li>✓ All planning tools</li>
                <li>✓ Works offline</li>
                <li>✓ Export to PNG</li>
              </ul>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
              <h3 className="font-bold text-lg mb-4">Pro (Coming Soon)</h3>
              <p className="text-3xl font-bold mb-4">$4.99</p>
              <ul className="text-left space-y-2 opacity-90">
                <li>✓ Cloud backup</li>
                <li>✓ Sync across devices</li>
                <li>✓ AI Assistant</li>
                <li>✓ Priority support</li>
                <li>✓ Early access to features</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Get In Touch
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Have questions? Want to share your garden? We'd love to hear from you.
          </p>
          <form className="space-y-4">
            <input 
              type="email" 
              placeholder="Your email" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500"
            />
            <textarea 
              placeholder="Your message" 
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500"
            />
            <button 
              type="submit"
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="font-bold">GardenGrid</span>
          </div>
          <div className="flex gap-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 GardenGrid
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <span className="text-4xl mb-4 block">{emoji}</span>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ThemeCard({ emoji, name, plants }: { emoji: string; name: string; plants: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <div className="text-4xl mb-3 text-center">{emoji}</div>
      <h3 className="font-bold text-gray-800 mb-1">{name}</h3>
      <p className="text-xs text-gray-500">{plants}</p>
    </div>
  );
}
