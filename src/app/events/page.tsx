import React from 'react';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

async function getEvents() {
  const events = await prisma.event.findMany();
  return events;
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Event Grid View</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event: { id: string; title: string; eventType: string; location: string; startDate: Date; cost: number }) => (
          <div key={event.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2 text-green-800">{event.title}</h2>
            <p className="text-gray-700"><strong>Type:</strong> {event.eventType}</p>
            <p className="text-gray-700"><strong>Location:</strong> {event.location}</p>
            <p className="text-gray-700"><strong>Start Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
            <p className="text-gray-700"><strong>Cost:</strong> ${event.cost}</p>
            <Link href={`/events/${event.id}`} className="mt-2 inline-block px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700">View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
} 