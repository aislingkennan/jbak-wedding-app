import { sendInvite } from '@/lib/email';
import type { Party } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get('to') ?? process.env.GMAIL_USER ?? '';
  const testParty: Party = {
    token: 'test',
    partyName: 'Test',
    displayName: 'Aisling',
    attendanceType: 'Ceremony + Dinner',
    guestOf: '',
    guests: [{ firstName: 'Aisling', lastName: 'Kennan', email: to, party: 'Test', attendanceType: 'Ceremony + Dinner', guestOf: '', token: 'test', rowIndex: 0, inviteSentAt: '' }],
    primaryEmail: to,
    emails: [to],
    inviteSentAt: '',
  };

  await sendInvite(testParty);
  return Response.json({ ok: true, message: `Test email sent to ${to}` });
}
