import { NextRequest, NextResponse } from 'next/server';
import { getAllParties } from '@/lib/tokens';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parties = await getAllParties();
  return NextResponse.json(parties);
}
