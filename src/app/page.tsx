import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-gray-900">GAA Trips</h1>
      <div className="flex space-x-4 mb-4">
        <Link href="/map" className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700">Map View</Link>
        <Link href="/events" className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700">Event Grid View</Link>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2 text-green-800">Event Grid View</h2>
        <p className="text-gray-700">Event cards will be displayed here.</p>
      </div>
    </div>
  );
}
