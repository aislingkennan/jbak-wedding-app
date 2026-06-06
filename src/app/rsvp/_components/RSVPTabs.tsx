'use client';

import { useState } from 'react';
import type { Party } from '@/lib/types';
import RSVPForm from './RSVPForm';
import Schedule from './Schedule';
import FAQ from './FAQ';

const tabs = ['RSVP', 'The Day', 'FAQs'] as const;
type Tab = typeof tabs[number];

export default function RSVPTabs({ party, isDemo }: { party: Party; isDemo?: boolean }) {
  const [active, setActive] = useState<Tab>('RSVP');

  return (
    <div>
      <div className="flex border-b" style={{ borderColor: '#e8d9bf' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="flex-1 py-3 text-sm tracking-wide transition-colors"
            style={{
              color: active === tab ? '#c9a84c' : '#8b7355',
              borderBottom: active === tab ? '2px solid #c9a84c' : '2px solid transparent',
              marginBottom: '-1px',
              background: 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {active === 'RSVP' && <RSVPForm party={party} isDemo={isDemo} />}
        {active === 'The Day' && <Schedule attendanceType={party.attendanceType} />}
        {active === 'FAQs' && <FAQ attendanceType={party.attendanceType} />}
      </div>
    </div>
  );
}
