import RSVPTabs from '../_components/RSVPTabs';
import CollapsibleCard from '../_components/CollapsibleCard';
import type { Party } from '@/lib/types';

const demoParty: Party = {
  token: 'demo',
  partyName: 'Smith',
  displayName: 'Jane & John',
  attendanceType: 'Ceremony + Dinner',
  guests: [
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      party: 'Smith',
      attendanceType: 'Ceremony + Dinner',
      guestOf: '',
      token: 'demo',
      rowIndex: 0,
      inviteSentAt: '',
    },
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      party: 'Smith',
      attendanceType: 'Ceremony + Dinner',
      guestOf: '',
      token: 'demo',
      rowIndex: 1,
      inviteSentAt: '',
    },
  ],
  primaryEmail: 'jane@example.com',
  emails: ['jane@example.com', 'john@example.com'],
  inviteSentAt: '',
  guestOf: '',
};

export default function DemoPage() {
  return (
    <main
      className="min-h-screen py-12 px-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/photos/door.jpg')", backgroundPosition: '5% center' }}
    >
      <div className="min-h-screen absolute inset-0 bg-black/40" />
      <div className="relative max-w-lg mx-4 sm:mx-auto lg:ml-auto lg:mr-[22rem]">
        <div className="mb-4 px-4 py-2 text-xs text-center text-amber-900 bg-amber-100/90 border border-amber-300">
          <strong>Demo mode</strong> — no data will be saved
        </div>

        <header className="text-center mb-8">
          <p className="text-xs uppercase tracking-[4px] mb-2 text-white/70">
            5th September 2026
          </p>
          <h1 className="font-serif text-5xl font-light text-white mb-2">Jack &amp; Aisling</h1>
          <p className="text-sm text-white/60 tracking-wide">Dublin, Ireland</p>
        </header>

        <CollapsibleCard>
          <RSVPTabs party={demoParty} isDemo />
        </CollapsibleCard>

        <footer className="text-center mt-6">
          <p className="text-xs text-white/50">
            Questions? Email{' '}
            <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="underline text-white/70">
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
