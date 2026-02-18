import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for demo (use database in production)
const users = new Map<string, {
  _id: string;
  email: string;
  name?: string;
  subscriptionStatus: 'free' | 'pro_monthly' | 'pro_lifetime';
  createdAt: number;
}>();

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check if user exists
    let user = users.get(email);

    if (!user) {
      // Create new user
      user = {
        _id: generateId(),
        email,
        name,
        subscriptionStatus: 'free',
        createdAt: Date.now(),
      };
      users.set(email, user);
    }

    // Return user
    return NextResponse.json(user);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
