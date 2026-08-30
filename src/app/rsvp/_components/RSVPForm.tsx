'use client';

import { useState } from 'react';
import type { Party, RsvpRecord } from '@/lib/types';

const MOLI_MAP_URL = 'https://maps.app.goo.gl/bEBgrE7wXk3KShL69';
const ASHTONS_MAP_URL = 'https://maps.app.goo.gl/wL1E8ryfJKzpjCG36';

interface Props {
  party: Party;
  isDemo?: boolean;
  existingRsvp?: RsvpRecord | null;
}

const RSVP_CLOSED = true;

export default function RSVPForm({ party, isDemo, existingRsvp }: Props) {
  const [attending, setAttending] = useState<(boolean | null)[]>(party.guests.map(() => null));
  const [dietaries, setDietaries] = useState<string[]>(party.guests.map(() => ''));
  const [childUnder3, setChildUnder3] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFull = party.attendanceType === 'Ceremony + Dinner';

  if (RSVP_CLOSED && !isDemo) {
    if (!existingRsvp) {
      return (
        <div className="text-center py-8 px-6">
          <p className="font-serif text-2xl text-gray-800 mb-3">RSVPs are now closed</p>
          <div className="w-12 h-px mx-auto mb-5" style={{ backgroundColor: '#C9A84C' }} />
          <p className="text-gray-600 leading-relaxed">
            We don&apos;t have a response on file for you, {party.displayName}. If you&apos;d still like to let us know, please email us.
          </p>
        </div>
      );
    }

    return (
      <div className="py-6 px-6">
        <p className="font-serif text-2xl text-gray-800 mb-3 text-center">Thanks for submitting your RSVP</p>
        <div className="w-12 h-px mx-auto mb-6" style={{ backgroundColor: '#C9A84C' }} />
        <p className="text-sm text-gray-600 mb-5 text-center">Here&apos;s what you told us, {party.displayName}:</p>

        <div className="space-y-4 mb-6">
          {existingRsvp.guestResponses.map((guest, i) => (
            <div key={i} className="border-l-2 pl-4" style={{ borderColor: '#C9A84C' }}>
              <p className="text-sm font-medium text-gray-700">{guest.name}</p>
              <p className="text-sm" style={{ color: guest.attending ? '#7a9a5c' : '#8a7a6a' }}>
                {guest.attending ? 'Joyfully accepted' : 'Regretfully declined'}
              </p>
              {guest.attending && guest.dietary && (
                <p className="text-xs text-gray-500 mt-1">Dietary requirements: {guest.dietary}</p>
              )}
            </div>
          ))}
        </div>

        {existingRsvp.childUnder3 && (
          <p className="text-sm text-gray-600 mb-2">Bringing our little infant.</p>
        )}
        {existingRsvp.notes && (
          <p className="text-sm text-gray-600 mb-2">Notes: {existingRsvp.notes}</p>
        )}

        <p className="text-xs text-gray-400 mt-4 text-center">Need to make a change? Please email us.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (attending.some((a) => a === null)) return;
    setLoading(true);
    setError('');

    const guestResponses = party.guests.map((g, i) => ({
      name: `${g.firstName} ${g.lastName}`.trim(),
      dietary: dietaries[i] ?? '',
      attending: attending[i] === true,
    }));

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/rsvp/${party.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestResponses, childUnder3, notes }),
      });
      if (!res.ok) throw new Error('Something went wrong. Please try again.');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    const anyAttending = attending.some((a) => a === true);
    const allDeclined = attending.every((a) => a === false);
    return (
      <div className="text-center py-8 px-6">
        <p className="font-serif text-2xl text-gray-800 mb-3">
          {allDeclined ? "We'll miss you" : "We're so glad you can make it!"}
        </p>
        <div className="w-12 h-px mx-auto mb-5" style={{ backgroundColor: '#C9A84C' }} />
        <p className="text-gray-600 leading-relaxed">
          {allDeclined
            ? `Thank you for letting us know, ${party.displayName}. We hope to celebrate with you another time.`
            : anyAttending && attending.some((a) => a === false)
            ? `Thank you, ${party.displayName}. We're sorry not everyone can make it, but we can't wait to celebrate with those who can!`
            : `Thank you, ${party.displayName}. We can't wait to celebrate with you on the 5th of September.`}
        </p>
        <p className="text-xs text-gray-400 mt-4">Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="">
      <div className="mb-6">
        <p className="font-serif text-xl text-gray-800 mb-3">Dear {party.displayName},</p>
        {isFull ? (
          <div className="text-sm text-gray-600 leading-relaxed space-y-1 border-l-2 pl-4" style={{ borderColor: '#C9A84C' }}>
            <p><span className="font-medium">Ceremony</span> — <a href={MOLI_MAP_URL} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#C9A84C' }}>MoLI</a> at 2:00pm</p>
            <p><span className="font-medium">Dinner &amp; Dancing</span> — <a href={ASHTONS_MAP_URL} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#C9A84C' }}>Ashton&apos;s Pub</a> from 4:45pm</p>
          </div>
        ) : (
          <div className="text-sm text-gray-600 leading-relaxed border-l-2 pl-4" style={{ borderColor: '#C9A84C' }}>
            <p><span className="font-medium">Dinner &amp; Dancing</span> — <a href={ASHTONS_MAP_URL} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#C9A84C' }}>Ashton&apos;s Pub</a> from 4:45pm</p>
          </div>
        )}
      </div>

      <div className="space-y-5 mb-6">
        {party.guests.map((guest, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-gray-700 mb-2">{guest.firstName} {guest.lastName}</p>
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => { const next = [...attending]; next[i] = true; setAttending(next); }}
                className="flex-1 py-2 px-3 text-xs tracking-wider border transition-colors"
                style={{
                  backgroundColor: attending[i] === true ? '#C9A84C' : 'transparent',
                  color: attending[i] === true ? '#fff' : '#6b5e4e',
                  borderColor: attending[i] === true ? '#C9A84C' : '#d4c4a8',
                }}
              >
                Joyfully accepts
              </button>
              <button
                type="button"
                onClick={() => { const next = [...attending]; next[i] = false; setAttending(next); }}
                className="flex-1 py-2 px-3 text-xs tracking-wider border transition-colors"
                style={{
                  backgroundColor: attending[i] === false ? '#8a7a6a' : 'transparent',
                  color: attending[i] === false ? '#fff' : '#6b5e4e',
                  borderColor: attending[i] === false ? '#8a7a6a' : '#d4c4a8',
                }}
              >
                Regretfully declines
              </button>
            </div>
            {attending[i] === true && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                  Dietary requirements
                </label>
                <input
                  type="text"
                  value={dietaries[i]}
                  onChange={(e) => {
                    const next = [...dietaries];
                    next[i] = e.target.value;
                    setDietaries(next);
                  }}
                  placeholder="None"
                  className="w-full border px-3 py-2 text-sm text-gray-800 outline-none focus:ring-1"
                  style={{ borderColor: '#d4c4a8', backgroundColor: '#fdfaf5' }}
                />
              </div>
            )}
          </div>
        ))}

        {attending.some((a) => a === true) && (
          <>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="childUnder3"
                checked={childUnder3}
                onChange={(e) => setChildUnder3(e.target.checked)}
                className="w-4 h-4 accent-amber-600"
              />
              <label htmlFor="childUnder3" className="text-sm text-gray-600">
                We'll bring our little infant
              </label>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything you'd like us to know…"
                className="w-full border px-3 py-2 text-sm text-gray-800 outline-none focus:ring-1 resize-none"
                style={{ borderColor: '#d4c4a8', backgroundColor: '#fdfaf5' }}
              />
            </div>
          </>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {attending.every((a) => a !== null) && (
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-xs uppercase tracking-widest text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#C9A84C' }}
        >
          {loading ? 'Sending…' : 'Confirm RSVP'}
        </button>
      )}
    </form>
  );
}
