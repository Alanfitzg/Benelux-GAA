import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-green-800">Admin Dashboard</h1>
      <div className="space-y-4">
        <Link href="/admin/events" className="block px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700">Manage Events</Link>
        <Link href="/admin/clubs" className="block px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700">Manage Clubs</Link>
      </div>
    </div>
  );
} 