import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const GUEST_SHEET = 'WithJoy Import';
const RSVP_SHEET = 'RSVP Data';

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function getAllGuests(): Promise<string[][]> {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${GUEST_SHEET}'!A2:J300`,
  });
  return (res.data.values as string[][]) ?? [];
}

export async function writeInviteSent(rowIndices: number[]): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const timestamp = new Date().toISOString();
  await Promise.all(
    rowIndices.map((rowIndex) =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${GUEST_SHEET}'!J${rowIndex + 2}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[timestamp]] },
      })
    )
  );
}

export async function writeToken(rowIndex: number, token: string): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const row = rowIndex + 2;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${GUEST_SHEET}'!I${row}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[token]] },
  });
}

export async function getRsvpResponses(): Promise<string[][]> {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${RSVP_SHEET}'!A2:M500`,
  });
  return (res.data.values as string[][]) ?? [];
}

export async function writeRsvp(row: string[]): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${RSVP_SHEET}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

export async function getAfterPartyRsvps(): Promise<string[][]> {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'After Party'!A2:F500`,
  });
  return (res.data.values as string[][]) ?? [];
}

export async function writeAfterPartyRsvp(row: string[]): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth: getAuth() });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'After Party'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}
