import { NextRequest, NextResponse } from 'next/server';
import { ensureTokens } from '@/lib/tokens';
import { sendInvite } from '@/lib/email';
import { writeInviteSent } from '@/lib/sheets';
import type { Party } from '@/lib/types';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parties = await ensureTokens();
  return NextResponse.json(
    parties.map((p) => ({ party: p.partyName, token: p.token, email: p.primaryEmail }))
  );
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const targetToken: string | undefined = body.token;
  const attendanceFilter: string | undefined = body.attendanceType;

  const parties = await ensureTokens();

  let targets: Party[] = targetToken
    ? parties.filter((p) => p.token === targetToken)
    : parties.filter((p) => p.primaryEmail && p.primaryEmail !== 'N/A');

  if (attendanceFilter) {
    targets = targets.filter((p) => p.attendanceType === attendanceFilter);
  }

  const results: { party: string; status: string; error?: string }[] = [];
  for (const party of targets) {
    try {
      await sendInvite(party);
      await writeInviteSent(party.guests.map((g) => g.rowIndex));
      results.push({ party: party.partyName, status: 'sent' });
    } catch (err) {
      results.push({
        party: party.partyName,
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      });
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  return NextResponse.json({ results });
}
