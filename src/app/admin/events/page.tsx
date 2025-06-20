import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import DeleteButton from '@/components/ui/DeleteButton';
import { MESSAGES, UI } from '@/lib/constants';
import { formatShortDate } from '@/lib/utils';

export const dynamic = "force-dynamic";

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
      <div className={`grid ${UI.GRID_LAYOUTS.RESPONSIVE} gap-4`}>
        {events.map(event => (
          <div key={event.id} className={UI.CARD_STYLES.DEFAULT}>
            <h2 className="text-lg font-semibold mb-1 text-green-800">{event.title}</h2>
            <p className="text-gray-700"><strong>Type:</strong> {event.eventType}</p>
            <p className="text-gray-700"><strong>Location:</strong> {event.location}</p>
            <p className="text-gray-700"><strong>Start Date:</strong> {formatShortDate(event.startDate)}</p>
            <div className="mt-2 space-x-2">
              <Link href={`/admin/events/${event.id}/edit`} className={UI.BUTTON_STYLES.INFO}>{MESSAGES.BUTTONS.EDIT}</Link>
              <DeleteButton id={event.id} onDelete={deleteEvent} itemType="event" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 