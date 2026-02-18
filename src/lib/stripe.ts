import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY not set - payments disabled');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    })
  : null;

export const PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'prod_U0FqUEKEZX2zSS',
  lifetime: process.env.NEXT_PUBLIC_STRIPE_PRO_LIFETIME_PRICE_ID || 'prod_U0DgHO1hpqRD70',
};
