import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_IDS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Payments not configured' },
      { status: 500 }
    );
  }

  try {
    const { priceId, successUrl, cancelUrl, trialDays = 7 } = await request.json();

    // Validate price ID
    const validPriceIds = [PRICE_IDS.monthly, PRICE_IDS.lifetime];
    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    const isSubscription = priceId === PRICE_IDS.monthly;

    // Create checkout session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_URL}/?payment=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_URL}/?payment=cancelled`,
    };

    // Add 7-day trial for monthly subscriptions
    if (isSubscription && trialDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
