import Link from 'next/link';
import TestOrders from '@/components/TestOrders';

export default function HomePage() {
  return (
    <main className="p-10 max-w-5xl mx-auto space-y-10">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">📊 Welcome to the Portal</h1>
        <p className="text-gray-500 mt-2">Manage operations seamlessly with real-time insights.</p>
      </header>

      <section className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Live Order Feed</h2>
        <TestOrders />
      </section>

      <div className="text-center">
        <Link href="/rolecheck" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          🔍 Check My Role
        </Link>
      </div>
    </main>
  );
}