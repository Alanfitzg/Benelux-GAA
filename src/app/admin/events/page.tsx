import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';
import { formatShortDate } from '@/lib/utils';

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  async function deleteEvent(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    await prisma.event.delete({ where: { id } });
    revalidatePath('/admin/events');
  }

  const events = await prisma.event.findMany({ 
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      title: true,
      eventType: true,
      location: true,
      startDate: true,
      visibility: true,
    }
  });
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
        <div className="space-x-3">
          <Link 
            href="/events/create" 
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md"
          >
            Create Event
          </Link>
          <Link 
            href="/admin" 
            className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary/10 text-secondary">
                      {event.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.eventType === 'Tournament' ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        event.visibility === 'PUBLIC' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.visibility === 'PUBLIC' ? '🌍 Public' : '🔒 Private'}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    📍 {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    📅 {formatShortDate(event.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link 
                      href={`/admin/events/${event.id}/edit`} 
                      className="text-primary hover:text-primary/80 transition"
                    >
                      Edit
                    </Link>
                    <span className="text-gray-300">|</span>
                    <DeleteButton id={event.id} onDelete={deleteEvent} itemType="event" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 