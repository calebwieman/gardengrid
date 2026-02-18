import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'garden123';

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  
  if (key === ADMIN_PASSWORD) {
    return NextResponse.json({ valid: true });
  } else {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
