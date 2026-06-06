import { sendInvite } from '@/lib/email';
import type { Party } from '@/lib/types';

export async function GET() {
  const to = process.env.GMAIL_USER ?? '';
  const testParty: Party = {
    token: 'test',
    partyName: 'Test',
    displayName: 'Aisling',
    attendanceType: 'Ceremony + Dinner',
    guests: [{ firstName: 'Aisling', lastName: 'Kennan', email: to, party: 'Test', attendanceType: 'Ceremony + Dinner', token: 'test', rowIndex: 0 }],
    primaryEmail: to,
    emails: [to],
  };

  await sendInvite(testParty);
  return Response.json({ ok: true, message: `Test email sent to ${to}` });
}
