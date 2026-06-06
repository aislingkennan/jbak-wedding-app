import { NextRequest, NextResponse } from 'next/server';
import { getAllParties } from '@/lib/tokens';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const GUEST_SHEET = 'WithJoy Import';

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

const ACCIDENTALLY_SENT = [
  'mitch-thompson-andrea-rothschild',
  'kill-mcmanus-hannah-gibson',
  'enrico-macari',
  'alex-keating-ana-clara-maciel',
  'ines-delpy',
  'william-bamber-rebecca-smylie',
];

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parties = await getAllParties();
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });

  const toClear = parties.filter(
    (p) => p.attendanceType === 'Dinner' && !ACCIDENTALLY_SENT.includes(p.token)
  );

  await Promise.all(
    toClear.flatMap((p) =>
      p.guests.map((g) =>
        sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${GUEST_SHEET}'!J${g.rowIndex + 2}`,
          valueInputOption: 'RAW',
          requestBody: { values: [['']] },
        })
      )
    )
  );

  return NextResponse.json({ ok: true, cleared: toClear.map((p) => p.partyName) });
}
