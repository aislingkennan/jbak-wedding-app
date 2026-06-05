import { notFound } from 'next/navigation';
import { getPartyByToken } from '@/lib/tokens';
import RSVPTabs from '../_components/RSVPTabs';

export default async function RsvpPage({ params }: { params: { token: string } }) {
  const party = await getPartyByToken(params.token);
  if (!party) notFound();

  return (
    <main
      className="min-h-screen py-12 px-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/photos/door.jpg')", backgroundPosition: '5% center' }}
    >
      <div className="min-h-screen absolute inset-0 bg-black/40" />
      <div className="relative max-w-lg ml-auto mr-8 lg:mr-[22rem]">
        <header className="text-center mb-8">
          <p className="text-xs uppercase tracking-[4px] mb-2 text-white/70">
            5th September 2026
          </p>
          <h1 className="font-serif text-5xl font-light text-white mb-2">Jack &amp; Aisling</h1>
          <p className="text-sm text-white/60 tracking-wide">Dublin, Ireland</p>
        </header>

        <div className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
          <RSVPTabs party={party} />
        </div>

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
