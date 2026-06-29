import { NextRequest, NextResponse } from 'next/server';
import { writeAfterPartyRsvp } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { name, attending, partnerName, partnerAttending, shuttle } = body;

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const timestamp = new Date().toISOString();
  await writeAfterPartyRsvp([
    name.trim(),
    attending === true ? 'Yes' : 'No',
    partnerName?.trim() ?? '',
    partnerAttending === true ? 'Yes' : partnerAttending === false ? 'No' : '',
    shuttle === true ? 'Yes' : 'No',
    timestamp,
  ]);

  return NextResponse.json({ ok: true });
}
