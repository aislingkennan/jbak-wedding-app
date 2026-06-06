import { NextRequest, NextResponse } from 'next/server';
import { ensureTokens } from '@/lib/tokens';
import { writeInviteSent } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parties = await ensureTokens();
  const targets = parties.filter((p) => p.primaryEmail && p.primaryEmail !== 'N/A');

  for (const party of targets) {
    await writeInviteSent(party.guests.map((g) => g.rowIndex));
  }

  return NextResponse.json({ ok: true, marked: targets.map((p) => p.partyName) });
}
