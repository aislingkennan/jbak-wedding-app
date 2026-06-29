'use client';

import { useState } from 'react';

export default function AftersForm() {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [partnerAttending, setPartnerAttending] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || attending === null) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/afters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), attending, partnerName: partnerName.trim(), partnerAttending }),
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
    return (
      <div className="text-center py-8 px-6">
        <p className="font-serif text-2xl text-gray-800 mb-3">See you on the night!</p>
        <div className="w-12 h-px mx-auto mb-5" style={{ backgroundColor: '#C9A84C' }} />
        <p className="text-gray-600 leading-relaxed">
          Thanks{name ? `, ${name}` : ''}. We&apos;ve noted your details and can&apos;t wait to celebrate with you.
        </p>
        <p className="text-xs text-gray-400 mt-4">Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6">
        <div className="text-sm text-gray-600 leading-relaxed border-l-2 pl-4" style={{ borderColor: '#C9A84C' }}>
          <p><span className="font-medium">Drinks &amp; Dancing</span> — Ashton&apos;s Pub, Clonskeagh Road, Rathmines, Dublin 6 from 8:30pm</p>
        </div>
      </div>

      <div className="space-y-5 mb-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
            Your name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full border px-3 py-2 text-sm text-gray-800 outline-none focus:ring-1 mb-2"
            style={{ borderColor: '#d4c4a8', backgroundColor: '#fdfaf5' }}
          />
          <p className="text-xs text-gray-500 mb-2">Will you attend our wedding after party on September 5th?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAttending(true)}
              className="flex-1 py-2 px-3 text-xs tracking-wider border transition-colors"
              style={{
                backgroundColor: attending === true ? '#C9A84C' : 'transparent',
                color: attending === true ? '#fff' : '#6b5e4e',
                borderColor: attending === true ? '#C9A84C' : '#d4c4a8',
              }}
            >
              Joyfully accepts
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              className="flex-1 py-2 px-3 text-xs tracking-wider border transition-colors"
              style={{
                backgroundColor: attending === false ? '#8a7a6a' : 'transparent',
                color: attending === false ? '#fff' : '#6b5e4e',
                borderColor: attending === false ? '#8a7a6a' : '#d4c4a8',
              }}
            >
              Regretfully declines
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">
            Partner&apos;s name <span className="text-gray-300">(optional)</span>
          </label>
          <input
            type="text"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            placeholder="Partner's name"
            className="w-full border px-3 py-2 text-sm text-gray-800 outline-none focus:ring-1 mb-2"
            style={{ borderColor: '#d4c4a8', backgroundColor: '#fdfaf5' }}
          />
          <p className="text-xs text-gray-500 mb-2">Will your partner attend our wedding after party on September 5th?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPartnerAttending(true)}
              className="flex-1 py-2 px-3 text-xs tracking-wider border transition-colors"
              style={{
                backgroundColor: partnerAttending === true ? '#C9A84C' : 'transparent',
                color: partnerAttending === true ? '#fff' : '#6b5e4e',
                borderColor: partnerAttending === true ? '#C9A84C' : '#d4c4a8',
              }}
            >
              Joyfully accepts
            </button>
            <button
              type="button"
              onClick={() => setPartnerAttending(false)}
              className="flex-1 py-2 px-3 text-xs tracking-wider border transition-colors"
              style={{
                backgroundColor: partnerAttending === false ? '#8a7a6a' : 'transparent',
                color: partnerAttending === false ? '#fff' : '#6b5e4e',
                borderColor: partnerAttending === false ? '#8a7a6a' : '#d4c4a8',
              }}
            >
              Regretfully declines
            </button>
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={!name.trim() || attending === null || loading}
        className="w-full py-3 text-xs uppercase tracking-widest text-white transition-opacity disabled:opacity-40"
        style={{ backgroundColor: '#C9A84C' }}
      >
        {loading ? 'Sending…' : 'Submit'}
      </button>
    </form>
  );
}
