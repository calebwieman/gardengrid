'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { PRICE_IDS } from '@/lib/stripe';

interface UpgradePromptProps {
  feature: string;
  description?: string;
}

export default function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  const { isPro } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (isPro) return null;

  const handleUpgrade = async (plan: 'monthly' | 'lifetime') => {
    setIsLoading(true);
    try {
      const priceId = plan === 'monthly' ? PRICE_IDS.monthly : PRICE_IDS.lifetime;
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url, error } = await response.json();
      if (error) alert(error);
      else if (url) window.location.href = url;
    } catch {
      alert('Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔒</span>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 dark:text-white">{feature} is a Pro Feature</h3>
          {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleUpgrade('monthly')}
              disabled={isLoading}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white text-sm font-medium rounded-lg"
            >
              $4.99/mo
            </button>
            <button
              onClick={() => handleUpgrade('lifetime')}
              disabled={isLoading}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white text-sm font-medium rounded-lg"
            >
              $49.99 lifetime
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
