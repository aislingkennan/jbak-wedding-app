import { randomBytes } from 'crypto';
import { getAllGuests, writeToken, getRsvpResponses } from './sheets';
import type { AttendanceType, GuestRow, Party, RsvpRecord } from './types';

export function parseRows(rows: string[][]): GuestRow[] {
  return rows.map((row, index) => ({
    firstName: row[0] ?? '',
    lastName: row[1] ?? '',
    email: row[2] ?? '',
    party: row[5] ?? '',
    attendanceType: (row[6] as AttendanceType) ?? 'Dinner',
    guestOf: row[7] ?? '',
    token: row[8] ?? '',
    rowIndex: index,
    inviteSentAt: row[9] ?? '',
  }));
}

export function groupIntoParties(guests: GuestRow[]): Party[] {
  const map = new Map<string, GuestRow[]>();

  for (const guest of guests) {
    const key = guest.party?.trim() || `${guest.firstName} ${guest.lastName}`;
    const existing = map.get(key) ?? [];
    existing.push(guest);
    map.set(key, existing);
  }

  const parties: Party[] = [];

  for (const [partyName, partyGuests] of map) {
    const token = partyGuests.find((g) => g.token)?.token ?? '';

    const uniqueFirstNames = [...new Set(partyGuests.map((g) => g.firstName).filter(Boolean))];
    let displayName: string;
    if (uniqueFirstNames.length >= 2) {
      displayName = `${uniqueFirstNames[0]} & ${uniqueFirstNames[1]}`;
    } else {
      const g = partyGuests[0];
      displayName = `${g.firstName} ${g.lastName}`.trim();
    }

    const attendanceType = partyGuests[0].attendanceType;

    const allEmails = partyGuests.map((g) => g.email).filter((e) => e && e !== 'N/A');
    const emails = [...new Set(allEmails)];
    const primaryEmail = emails[0] ?? '';

    const inviteSentAt = partyGuests.find((g) => g.inviteSentAt)?.inviteSentAt ?? '';
    const guestOf = partyGuests[0].guestOf ?? '';
    parties.push({ token, partyName, displayName, attendanceType, guestOf, guests: partyGuests, primaryEmail, emails, inviteSentAt });
  }

  return parties;
}

export async function getAllParties(): Promise<Party[]> {
  const rows = await getAllGuests();
  const guests = parseRows(rows);
  return groupIntoParties(guests);
}

export async function getPartyByToken(token: string): Promise<Party | null> {
  const parties = await getAllParties();
  return parties.find((p) => p.token === token) ?? null;
}

export async function getRsvpByToken(token: string): Promise<RsvpRecord | null> {
  const rows = await getRsvpResponses();
  const matches = rows.filter((row) => row[0] === token);
  if (matches.length === 0) return null;

  // Later rows are more recent submissions for this token; take the last one.
  const row = matches[matches.length - 1];
  const guestResponses: RsvpRecord['guestResponses'] = [];

  const guest1Name = row[4] ?? '';
  if (guest1Name) {
    guestResponses.push({ name: guest1Name, attending: row[5] === 'Yes', dietary: row[6] ?? '' });
  }
  const guest2Name = row[7] ?? '';
  if (guest2Name) {
    guestResponses.push({ name: guest2Name, attending: row[8] === 'Yes', dietary: row[9] ?? '' });
  }

  return {
    guestResponses,
    childUnder3: row[10] === 'Yes',
    notes: row[11] ?? '',
    timestamp: row[12] ?? '',
  };
}

export async function ensureTokens(): Promise<Party[]> {
  const rows = await getAllGuests();
  const guests = parseRows(rows);
  const parties = groupIntoParties(guests);

  for (const party of parties) {
    if (!party.token) {
      const newToken = randomBytes(6).toString('hex');
      party.token = newToken;
      for (const guest of party.guests) {
        guest.token = newToken;
        await writeToken(guest.rowIndex, newToken);
      }
    }
  }

  return parties;
}
