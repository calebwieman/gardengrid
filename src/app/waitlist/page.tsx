'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    
    // Store in localStorage for now (would use DB in production)
    const waitlist = JSON.parse(localStorage.getItem('gardengrid_waitlist') || '[]');
    if (!waitlist.includes(email)) {
      waitlist.push(email);
      localStorage.setItem('gardengrid_waitlist', JSON.stringify(waitlist));
    }
    
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">You're on the list!</h1>
          <p className="text-gray-600 mb-6">
            We'll notify you when GardenGrid launches. As an early supporter, you'll get <strong>founder pricing</strong> - lock in Pro for life at a special rate.
          </p>
          <Link 
            href="/app" 
            className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg"
          >
            Try the App Now (Free)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <span className="font-bold text-xl text-green-800">GardenGrid</span>
          </div>
          <Link href="/app" className="text-green-600 hover:text-green-700 font-medium">
            Try Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-block px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
            🚀 Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Plan Your Perfect <span className="text-green-600">Garden</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The smartest garden planner with AI-powered advice, companion planting, and weather alerts.
          </p>
          
          {/* Waitlist Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Join the Waitlist
            </h2>
            <p className="text-gray-600 mb-6">
              Get early access and <strong>lock in founder pricing</strong> - 50% off Pro for life!
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-bold rounded-xl transition-colors text-lg"
              >
                {loading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
            
            <p className="mt-4 text-sm text-gray-500">
              No spam. Unsubscribe anytime. Already {">"}500 gardeners waiting.
            </p>
          </div>
          
          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-gray-500">
            <div>
              <div className="text-2xl font-bold text-gray-800">60+</div>
              <div className="text-sm">Plants</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">∞</div>
              <div className="text-sm">Gardens</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">100%</div>
              <div className="text-sm">Free to Start</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            What's Coming
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-bold text-gray-800 mb-2">AI Assistant</h3>
              <p className="text-gray-600 text-sm">Chat with our garden expert for personalized advice</p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">☁️</div>
              <h3 className="font-bold text-gray-800 mb-2">Cloud Sync</h3>
              <p className="text-gray-600 text-sm">Access your gardens from any device</p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🌦️</div>
              <h3 className="font-bold text-gray-800 mb-2">Weather Alerts</h3>
              <p className="text-gray-600 text-sm">Frost warnings and planting reminders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-800 text-white text-center">
        <p className="text-gray-400">© 2026 GardenGrid. All rights reserved.</p>
      </footer>
    </div>
  );
}
