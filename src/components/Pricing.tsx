'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { PRICE_IDS } from '@/lib/stripe';

type Plan = 'monthly' | 'lifetime';

export default function PricingSection() {
  const { user, isPro } = useAuth();
  const [loading, setLoading] = useState<Plan | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    setLoading(plan);
    
    try {
      const priceId = plan === 'monthly' ? PRICE_IDS.monthly : PRICE_IDS.lifetime;
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert(error);
      } else if (url) {
        window.location.href = url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="py-20 px-4 bg-gray-50" id="pricing">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Simple Pricing
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Start free, upgrade when you're ready. No hidden fees, no ads.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg text-gray-800 mb-2">Free</h3>
            <p className="text-3xl font-bold text-green-600 mb-4">$0</p>
            <ul className="text-left space-y-2 text-gray-600 text-sm mb-6">
              <li>✓ 1 garden</li>
              <li>✓ 60+ plants</li>
              <li>✓ Basic planning tools</li>
              <li>✓ Works offline</li>
              <li>✓ Export to PNG</li>
              <li className="text-gray-400">✗ Cloud sync</li>
              <li className="text-gray-400">✗ AI Assistant</li>
            </ul>
            <button className="w-full py-2 bg-gray-100 text-gray-600 font-medium rounded-lg cursor-default">
              {isPro ? 'Active' : 'Current Plan'}
            </button>
          </div>
          
          {/* Pro Monthly */}
          <div className="p-6 bg-white rounded-xl shadow-lg border-2 border-green-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-full">
              POPULAR
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">Pro Monthly</h3>
            <p className="text-3xl font-bold text-green-600 mb-1">$4.99</p>
            <p className="text-xs text-gray-500 mb-4">per month</p>
            <ul className="text-left space-y-2 text-gray-600 text-sm mb-6">
              <li>✓ Unlimited gardens</li>
              <li>✓ All 60+ plants</li>
              <li>✓ All planning tools</li>
              <li>✓ Works offline</li>
              <li>✓ Cloud backup</li>
              <li>✓ AI Assistant</li>
              <li>✓ Priority support</li>
            </ul>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading === 'monthly'}
              className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading === 'monthly' ? 'Loading...' : 'Subscribe'}
            </button>
          </div>
          
          {/* Lifetime */}
          <div className="p-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white">
            <h3 className="font-bold text-lg mb-2">Lifetime Pro</h3>
            <p className="text-3xl font-bold mb-1">$49.99</p>
            <p className="text-xs opacity-80 mb-4">one-time payment</p>
            <ul className="text-left space-y-2 opacity-90 text-sm mb-6">
              <li>✓ Everything in Pro</li>
              <li>✓ Lifetime updates</li>
              <li>✓ Early access</li>
              <li>✓ Support the dev</li>
            </ul>
            <button
              onClick={() => handleSubscribe('lifetime')}
              disabled={loading === 'lifetime'}
              className="w-full py-2 bg-white hover:bg-gray-100 disabled:bg-gray-200 text-amber-600 font-medium rounded-lg transition-colors"
            >
              {loading === 'lifetime' ? 'Loading...' : 'Get Lifetime'}
            </button>
          </div>
        </div>
        
        <p className="mt-6 text-sm text-gray-500">
          🔒 Secure payments via Stripe • Cancel anytime
        </p>
      </div>
    </section>
  );
}
