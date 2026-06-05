import { NextRequest, NextResponse } from 'next/server';
import { getPartyByToken } from '@/lib/tokens';
import { writeRsvp } from '@/lib/sheets';
import type { RsvpSubmission } from '@/lib/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  const { token } = params;

  const party = await getPartyByToken(token);
  if (!party && token !== 'demo') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body: RsvpSubmission = await request.json();
  const { attending, guestResponses, childUnder3, notes } = body;

  if (token !== 'demo') {
    const row: string[] = [
      token,
      party!.partyName,
      party!.attendanceType,
      attending ? 'Yes' : 'No',
      guestResponses[0]?.name ?? '',
      guestResponses[0]?.dietary ?? '',
      guestResponses[1]?.name ?? '',
      guestResponses[1]?.dietary ?? '',
      childUnder3 ? 'Yes' : 'No',
      notes ?? '',
      new Date().toISOString(),
    ];
    await writeRsvp(row);
  }

  return NextResponse.json({ success: true });
}
