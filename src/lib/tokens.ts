import { randomBytes } from 'crypto';
import { getAllGuests, writeToken } from './sheets';
import type { AttendanceType, GuestRow, Party } from './types';

export function parseRows(rows: string[][]): GuestRow[] {
  return rows.map((row, index) => ({
    firstName: row[0] ?? '',
    lastName: row[1] ?? '',
    email: row[2] ?? '',
    party: row[5] ?? '',
    attendanceType: (row[6] as AttendanceType) ?? 'Dinner',
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
    parties.push({ token, partyName, displayName, attendanceType, guests: partyGuests, primaryEmail, emails, inviteSentAt });
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
