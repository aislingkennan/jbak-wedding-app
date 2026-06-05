import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fdfaf5' }}>
      <div className="text-center px-6">
        <h1 className="font-serif text-4xl text-gray-800 mb-4">Jack &amp; Aisling</h1>
        <div className="w-16 h-px mx-auto mb-6" style={{ backgroundColor: '#C9A84C' }} />
        <p className="text-gray-600 text-lg mb-2">This link doesn&apos;t appear to be valid.</p>
        <p className="text-gray-500 text-sm">
          If you believe this is an error, please reach out to the couple directly.
        </p>
      </div>
    </main>
  );
}
