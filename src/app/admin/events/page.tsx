import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import DeleteButton from './DeleteButton';

export default async function AdminEventsPage() {
  async function deleteEvent(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await prisma.event.delete({ where: { id } });
    revalidatePath('/admin/events');
  }

  const events = await prisma.event.findMany({ orderBy: { startDate: 'asc' } });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-green-800">Manage Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <div key={event.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-1 text-green-800">{event.title}</h2>
            <p className="text-gray-700"><strong>Type:</strong> {event.eventType}</p>
            <p className="text-gray-700"><strong>Location:</strong> {event.location}</p>
            <p className="text-gray-700"><strong>Start Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
            <div className="mt-2 space-x-2">
              <Link href={`/admin/events/${event.id}/edit`} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</Link>
              <DeleteButton id={event.id} onDelete={deleteEvent} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 