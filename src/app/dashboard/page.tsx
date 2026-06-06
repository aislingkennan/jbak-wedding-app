import { getAllParties } from '@/lib/tokens';
import { getRsvpResponses } from '@/lib/sheets';
import type { Party } from '@/lib/types';

interface RsvpRow {
  token: string;
  partyName: string;
  attendanceType: string;
  attending: string;
  guest1Name: string;
  guest1Attending: string;
  guest1Dietary: string;
  guest2Name: string;
  guest2Attending: string;
  guest2Dietary: string;
  childUnder3: string;
  notes: string;
  timestamp: string;
}

function parseRsvpRow(row: string[]): RsvpRow {
  return {
    token: row[0] ?? '',
    partyName: row[1] ?? '',
    attendanceType: row[2] ?? '',
    attending: row[3] ?? '',
    guest1Name: row[4] ?? '',
    guest1Attending: row[5] ?? '',
    guest1Dietary: row[6] ?? '',
    guest2Name: row[7] ?? '',
    guest2Attending: row[8] ?? '',
    guest2Dietary: row[9] ?? '',
    childUnder3: row[10] ?? '',
    notes: row[11] ?? '',
    timestamp: row[12] ?? '',
  };
}

function StatCard({ label, guests, parties }: { label: string; guests: number; parties: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-semibold text-slate-800">{guests}</p>
      <p className="text-xs text-slate-400 mt-1">{parties} {parties === 1 ? 'party' : 'parties'}</p>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { secret?: string };
}) {
  if (searchParams.secret !== process.env.ADMIN_SECRET) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Access denied.</p>
      </main>
    );
  }

  const [allParties, rsvpRows] = await Promise.all([getAllParties(), getRsvpResponses()]);

  const parties = allParties.filter(
    (p) => p.primaryEmail && p.primaryEmail !== 'N/A',
  );

  const rsvpMap = new Map<string, RsvpRow>();
  for (const row of rsvpRows) {
    const parsed = parseRsvpRow(row);
    if (!parsed.token) continue;
    const existing = rsvpMap.get(parsed.token);
    if (existing) {
      const combinedNotes = [existing.notes, parsed.notes].filter(Boolean).join(' | ');
      rsvpMap.set(parsed.token, { ...parsed, notes: combinedNotes });
    } else {
      rsvpMap.set(parsed.token, parsed);
    }
  }

  type Status = 'accepted' | 'declined' | 'pending';

  function getStatus(party: Party): Status {
    const rsvp = rsvpMap.get(party.token);
    if (!rsvp) return 'pending';
    return rsvp.attending === 'Yes' ? 'accepted' : 'declined';
  }

  const ceremonyParties = parties.filter((p) => p.attendanceType === 'Ceremony + Dinner');
  const dinnerParties = parties.filter((p) => p.attendanceType === 'Dinner');

  function counts(subset: Party[]) {
    const accepted = subset.filter((p) => getStatus(p) === 'accepted');
    const declined = subset.filter((p) => getStatus(p) === 'declined');
    const pending = subset.filter((p) => getStatus(p) === 'pending');
    return {
      totalGuests: subset.reduce((s, p) => s + p.guests.length, 0),
      totalParties: subset.length,
      acceptedGuests: accepted.reduce((s, p) => s + p.guests.length, 0),
      acceptedParties: accepted.length,
      declinedGuests: declined.reduce((s, p) => s + p.guests.length, 0),
      declinedParties: declined.length,
      pendingGuests: pending.reduce((s, p) => s + p.guests.length, 0),
      pendingParties: pending.length,
    };
  }

  const all = counts(parties);
  const ceremony = counts(ceremonyParties);
  const dinner = counts(dinnerParties);

  const dietaryItems: { guestName: string; partyName: string; dietary: string }[] = [];
  const childrenParties: { displayName: string; token: string }[] = [];

  for (const row of rsvpRows) {
    const r = parseRsvpRow(row);
    if (r.guest1Dietary && r.guest1Attending === 'Yes') {
      dietaryItems.push({ guestName: r.guest1Name, partyName: r.partyName, dietary: r.guest1Dietary });
    }
    if (r.guest2Dietary && r.guest2Attending === 'Yes') {
      dietaryItems.push({ guestName: r.guest2Name, partyName: r.partyName, dietary: r.guest2Dietary });
    }
    if (r.childUnder3 === 'Yes') {
      childrenParties.push({ displayName: r.partyName, token: r.token });
    }
  }

  const pendingParties = parties
    .filter((p) => getStatus(p) === 'pending')
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const inviteSent = parties.filter((p) => p.inviteSentAt);
  const inviteNotSent = parties.filter((p) => !p.inviteSentAt && p.primaryEmail);

  const today = new Date().toLocaleDateString('en-IE', { dateStyle: 'long' });

  const thCls = 'text-left text-xs uppercase tracking-wider text-slate-500 px-3 py-2 font-medium';
  const tdCls = 'px-3 py-2 text-sm text-slate-700';

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">

        <header>
          <h1 className="text-2xl font-semibold text-slate-800">Jack &amp; Aisling · RSVP Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">{today}</p>
        </header>

        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Invited" guests={all.totalGuests} parties={all.totalParties} />
            <StatCard label="Accepted" guests={all.acceptedGuests} parties={all.acceptedParties} />
            <StatCard label="Declined" guests={all.declinedGuests} parties={all.declinedParties} />
            <StatCard label="Pending" guests={all.pendingGuests} parties={all.pendingParties} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Breakdown by type</h2>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className={thCls}>Type</th>
                  <th className={thCls}>Invited</th>
                  <th className={thCls}>Accepted</th>
                  <th className={thCls}>Declined</th>
                  <th className={thCls}>Pending</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Ceremony + Dinner', c: ceremony },
                  { label: 'Dinner Only', c: dinner },
                ].map(({ label, c }) => (
                  <tr key={label} className="border-b border-slate-100 last:border-0">
                    <td className={tdCls}>{label}</td>
                    <td className={tdCls}>{c.totalGuests} <span className="text-slate-400">({c.totalParties})</span></td>
                    <td className={tdCls}>{c.acceptedGuests} <span className="text-slate-400">({c.acceptedParties})</span></td>
                    <td className={tdCls}>{c.declinedGuests} <span className="text-slate-400">({c.declinedParties})</span></td>
                    <td className={tdCls}>{c.pendingGuests} <span className="text-slate-400">({c.pendingParties})</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Dietary requirements</h2>
          {dietaryItems.length === 0 ? (
            <p className="text-sm text-slate-400">None noted yet.</p>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
              {dietaryItems.map((item, i) => (
                <div key={i} className="px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium">{item.guestName}</span>
                  <span className="text-slate-400"> ({item.partyName})</span>
                  {' — '}
                  {item.dietary}
                </div>
              ))}
            </div>
          )}

          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-6 mb-3">Children under 3</h3>
          {childrenParties.length === 0 ? (
            <p className="text-sm text-slate-400">None noted.</p>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
              {childrenParties.map((p) => (
                <div key={p.token} className="px-4 py-3 text-sm text-slate-700">{p.displayName}</div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">All responses</h2>
          {rsvpRows.length === 0 ? (
            <p className="text-sm text-slate-400">No responses yet.</p>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Party', 'Type', 'Guest 1', 'Att.', 'Dietary', 'Guest 2', 'Att.', 'Dietary', 'Child', 'Submitted'].map((h) => (
                      <th key={h} className="text-left text-xs uppercase tracking-wider text-slate-500 px-3 py-2 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rsvpRows.map((row, i) => {
                    const r = parseRsvpRow(row);
                    return (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{r.partyName}</td>
                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{r.attendanceType}</td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{r.guest1Name}</td>
                        <td className="px-3 py-2 font-medium whitespace-nowrap" style={{ color: r.guest1Attending === 'Yes' ? '#16a34a' : '#dc2626' }}>{r.guest1Attending}</td>
                        <td className="px-3 py-2 text-slate-500">{r.guest1Dietary}</td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{r.guest2Name}</td>
                        <td className="px-3 py-2 font-medium whitespace-nowrap" style={{ color: r.guest2Attending === 'Yes' ? '#16a34a' : '#dc2626' }}>{r.guest2Attending}</td>
                        <td className="px-3 py-2 text-slate-500">{r.guest2Dietary}</td>
                        <td className="px-3 py-2 text-slate-500">{r.childUnder3}</td>
                        <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{r.timestamp}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Invitations sent ({inviteSent.length} of {parties.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-green-50 border-b border-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700">Sent ({inviteSent.length})</p>
              </div>
              <div className="divide-y divide-slate-100">
                {inviteSent.map((p) => (
                  <div key={p.token} className="px-4 py-2 flex justify-between items-center">
                    <span className="text-sm text-slate-700">{p.displayName}</span>
                    <span className="text-xs text-slate-400">{new Date(p.inviteSentAt).toLocaleDateString('en-IE')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-amber-50 border-b border-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Not yet sent ({inviteNotSent.length})</p>
              </div>
              <div className="divide-y divide-slate-100">
                {inviteNotSent.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">All invites sent!</p>
                ) : (
                  inviteNotSent.map((p) => (
                    <div key={p.token} className="px-4 py-2 flex justify-between items-center">
                      <span className="text-sm text-slate-700">{p.displayName}</span>
                      <span className="text-xs text-slate-400">{p.primaryEmail}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
            Pending RSVPs ({pendingParties.length})
          </h2>
          {pendingParties.length === 0 ? (
            <p className="text-sm text-slate-400">Everyone has responded!</p>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
              {pendingParties.map((p) => (
                <div key={p.token} className="px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-medium text-slate-800">{p.displayName}</span>
                    <span className="ml-2 text-xs text-slate-400">{p.attendanceType}</span>
                  </div>
                  <span className="text-xs text-slate-500">{p.primaryEmail}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
