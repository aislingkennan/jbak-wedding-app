import { getAllParties } from '@/lib/tokens';
import { getRsvpResponses } from '@/lib/sheets';
import type { Party } from '@/lib/types';
import GuestTable, { type GuestRow as GuestTableRow } from './_components/GuestTable';

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
    const anyYes = rsvp.guest1Attending === 'Yes' || (rsvp.guest2Name && rsvp.guest2Attending === 'Yes');
    const allNo = rsvp.guest1Attending !== 'Yes' && (!rsvp.guest2Name || rsvp.guest2Attending !== 'Yes');
    if (anyYes) return 'accepted';
    if (allNo) return 'declined';
    return 'pending';
  }

  const ceremonyParties = parties.filter((p) => p.attendanceType === 'Ceremony + Dinner');
  const dinnerParties = parties.filter((p) => p.attendanceType === 'Dinner');

  function counts(subset: Party[]) {
    let acceptedGuests = 0, acceptedParties = 0;
    let declinedGuests = 0, declinedParties = 0;
    let pendingGuests = 0, pendingParties = 0;

    for (const party of subset) {
      const rsvp = rsvpMap.get(party.token);
      if (!rsvp) {
        pendingGuests += party.guests.length;
        pendingParties++;
      } else {
        const g1yes = rsvp.guest1Attending === 'Yes';
        const g2yes = rsvp.guest2Name ? rsvp.guest2Attending === 'Yes' : null;

        if (g1yes) acceptedGuests++; else declinedGuests++;
        if (g2yes === true) acceptedGuests++;
        if (g2yes === false) declinedGuests++;

        const anyYes = g1yes || g2yes === true;
        const allNo = !g1yes && g2yes !== true;
        if (anyYes) acceptedParties++;
        else if (allNo) declinedParties++;
      }
    }

    return {
      totalGuests: subset.reduce((s, p) => s + p.guests.length, 0),
      totalParties: subset.length,
      acceptedGuests, acceptedParties,
      declinedGuests, declinedParties,
      pendingGuests, pendingParties,
    };
  }

  const all = counts(parties);
  const ceremony = counts(ceremonyParties);
  const dinner = counts(dinnerParties);

  const dietaryItems: { guestName: string; partyName: string; dietary: string }[] = [];
  const childrenParties: { displayName: string; token: string }[] = [];
  const notesItems: { partyName: string; notes: string }[] = [];

  for (const [token, r] of rsvpMap) {
    if (r.guest1Dietary && r.guest1Attending === 'Yes') {
      dietaryItems.push({ guestName: r.guest1Name, partyName: r.partyName, dietary: r.guest1Dietary });
    }
    if (r.guest2Dietary && r.guest2Attending === 'Yes') {
      dietaryItems.push({ guestName: r.guest2Name, partyName: r.partyName, dietary: r.guest2Dietary });
    }
    if (r.childUnder3 === 'Yes') {
      childrenParties.push({ displayName: r.partyName, token });
    }
    if (r.notes) {
      notesItems.push({ partyName: r.partyName, notes: r.notes });
    }
  }

  const pendingParties = parties
    .filter((p) => getStatus(p) === 'pending')
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const inviteSent = parties.filter((p) => p.inviteSentAt);
  const inviteNotSent = parties.filter((p) => !p.inviteSentAt && p.primaryEmail);

  const guestTableRows: GuestTableRow[] = parties.map((p) => {
    const rsvp = rsvpMap.get(p.token);
    const status = getStatus(p);
    const g1yes = rsvp?.guest1Attending === 'Yes';
    const g2yes = rsvp?.guest2Name ? rsvp.guest2Attending === 'Yes' : null;
    let response: GuestTableRow['response'] = p.inviteSentAt ? 'Pending' : 'Invite not sent';
    if (rsvp) {
      if (g1yes && g2yes !== false) response = 'Accepted';
      else if (!g1yes && g2yes !== true) response = 'Declined';
      else response = 'Partial';
    }
    return {
      token: p.token,
      displayName: p.displayName,
      attendanceType: p.attendanceType,
      guestOf: p.guestOf,
      inviteSentAt: p.inviteSentAt,
      response,
      guest1Name: rsvp?.guest1Name ?? '',
      guest1Attending: rsvp?.guest1Attending ?? '',
      guest2Name: rsvp?.guest2Name ?? '',
      guest2Attending: rsvp?.guest2Name ? (rsvp?.guest2Attending ?? '') : '',
      notes: rsvp?.notes ?? '',
    };
  });

  const recentResponses = [...rsvpMap.values()]
    .filter((r) => r.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const today = new Date().toLocaleDateString('en-IE', { dateStyle: 'long' });

  const thCls = 'text-left text-xs uppercase tracking-wider text-slate-500 px-3 py-2 font-medium';
  const tdCls = 'px-3 py-2 text-sm text-slate-700';

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-10 py-10 px-4">

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

        {recentResponses.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Recent responses</h2>
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
              {recentResponses.map((r) => {
                const g1yes = r.guest1Attending === 'Yes';
                const g2yes = r.guest2Name ? r.guest2Attending === 'Yes' : null;
                const label = g1yes && g2yes !== false ? 'Accepted' : !g1yes && g2yes !== true ? 'Declined' : 'Partial';
                const color = label === 'Accepted' ? '#16a34a' : label === 'Declined' ? '#dc2626' : '#d97706';
                const ts = new Date(r.timestamp);
                const timeStr = ts.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
                const dateStr = ts.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
                return (
                  <div key={r.token} className="px-4 py-3 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{r.partyName}</span>
                      <span className="ml-2 text-xs font-medium" style={{ color }}>{label}</span>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{dateStr} · {timeStr}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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

          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mt-6 mb-3">Notes</h3>
          {notesItems.length === 0 ? (
            <p className="text-sm text-slate-400">No notes yet.</p>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
              {notesItems.map((item, i) => (
                <div key={i} className="px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium">{item.partyName}</span>
                  {' — '}
                  {item.notes}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">All guests</h2>
          <GuestTable rows={guestTableRows} />
        </section>

      </div>
    </main>

  );
}
