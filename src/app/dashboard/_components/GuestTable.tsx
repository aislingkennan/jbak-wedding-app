'use client';

import { useState } from 'react';

export interface GuestRow {
  token: string;
  displayName: string;
  attendanceType: string;
  guestOf: string;
  inviteSentAt: string;
  response: 'Pending' | 'Accepted' | 'Declined' | 'Partial' | 'Invite not sent';
  guest1Name: string;
  guest1Attending: string;
  guest2Name: string;
  guest2Attending: string;
  notes: string;
}

export default function GuestTable({ rows }: { rows: GuestRow[] }) {
  const [attendanceFilter, setAttendanceFilter] = useState('All');
  const [guestOfFilter, setGuestOfFilter] = useState('All');
  const [inviteFilter, setInviteFilter] = useState('All');
  const [responseFilter, setResponseFilter] = useState('All');

  const filtered = rows.filter((r) => {
    if (attendanceFilter !== 'All' && r.attendanceType !== attendanceFilter) return false;
    if (guestOfFilter !== 'All' && r.guestOf !== guestOfFilter) return false;
    if (inviteFilter === 'Sent' && !r.inviteSentAt) return false;
    if (inviteFilter === 'Not sent' && r.inviteSentAt) return false;
    if (responseFilter !== 'All' && r.response !== responseFilter) return false;
    return true;
  });

  const selCls = 'text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600';
  const thCls = 'text-left text-xs uppercase tracking-wider text-slate-500 px-3 py-2 font-medium whitespace-nowrap';
  const tdCls = 'px-3 py-2 text-sm text-slate-700 whitespace-nowrap';

  const responseColor = (r: string) => {
    if (r === 'Accepted') return '#16a34a';
    if (r === 'Declined') return '#dc2626';
    if (r === 'Partial') return '#d97706';
    if (r === 'Invite not sent') return '#cbd5e1';
    return '#94a3b8';
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <select className={selCls} value={attendanceFilter} onChange={(e) => setAttendanceFilter(e.target.value)}>
          <option value="All">All types</option>
          <option value="Ceremony + Dinner">Ceremony + Dinner</option>
          <option value="Dinner">Dinner only</option>
        </select>
        <select className={selCls} value={guestOfFilter} onChange={(e) => setGuestOfFilter(e.target.value)}>
          <option value="All">Jack & Aisling</option>
          <option value="Jack">Jack's guests</option>
          <option value="Aisling">Aisling's guests</option>
        </select>
        <select className={selCls} value={inviteFilter} onChange={(e) => setInviteFilter(e.target.value)}>
          <option value="All">All invites</option>
          <option value="Sent">Invite sent</option>
          <option value="Not sent">Not yet sent</option>
        </select>
        <select className={selCls} value={responseFilter} onChange={(e) => setResponseFilter(e.target.value)}>
          <option value="All">All responses</option>
          <option value="Invite not sent">Invite not sent</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Declined">Declined</option>
          <option value="Partial">Partial</option>
        </select>
        <span className="text-xs text-slate-400 self-center ml-auto">{filtered.length} of {rows.length}</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Party', 'Guest of', 'Type', 'Invite sent', 'Response', 'Guest 1', 'Guest 2', 'Notes'].map((h) => (
                <th key={h} className={thCls}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.token} className="border-b border-slate-100 last:border-0">
                <td className={tdCls}>{r.displayName}</td>
                <td className={tdCls}>{r.guestOf}</td>
                <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">{r.attendanceType}</td>
                <td className={tdCls}>{r.inviteSentAt ? new Date(r.inviteSentAt).toLocaleDateString('en-IE') : <span className="text-slate-300">—</span>}</td>
                <td className="px-3 py-2 font-medium whitespace-nowrap" style={{ color: responseColor(r.response) }}>{r.response}</td>
                <td className={tdCls}>
                  {r.guest1Name && (
                    <span>{r.guest1Name} {r.guest1Attending && <span style={{ color: r.guest1Attending === 'Yes' ? '#16a34a' : '#dc2626' }}>({r.guest1Attending === 'Yes' ? '✓' : '✗'})</span>}</span>
                  )}
                </td>
                <td className={tdCls}>
                  {r.guest2Name && (
                    <span>{r.guest2Name} {r.guest2Attending && <span style={{ color: r.guest2Attending === 'Yes' ? '#16a34a' : '#dc2626' }}>({r.guest2Attending === 'Yes' ? '✓' : '✗'})</span>}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500 max-w-xs truncate">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
