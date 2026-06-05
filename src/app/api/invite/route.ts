import { NextRequest, NextResponse } from 'next/server';
import { ensureTokens } from '@/lib/tokens';
import { sendInvite } from '@/lib/email';
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

  const parties = await ensureTokens();

  const targets: Party[] = targetToken
    ? parties.filter((p) => p.token === targetToken)
    : parties.filter((p) => p.primaryEmail && p.primaryEmail !== 'N/A');

  const results = await Promise.allSettled(
    targets.map(async (party) => {
      await sendInvite(party);
      return party.partyName;
    }),
  );

  const response = results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return { party: targets[i].partyName, status: 'sent' };
    } else {
      return {
        party: targets[i].partyName,
        status: 'error',
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      };
    }
  });

  return NextResponse.json({ results: response });
}
