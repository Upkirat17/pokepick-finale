import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Link
        href="/pokemon"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
      >
        Go to Pokemon Page
      </Link>
    </div>
  );
}
