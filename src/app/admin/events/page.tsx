import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import EventsManagementClient from '@/components/admin/EventsManagementClient';

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
      club: {
        select: {
          id: true,
          name: true,
          region: true,
          country: {
            select: {
              id: true,
              name: true,
            }
          },
          internationalUnit: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    }
  });

  return <EventsManagementClient initialEvents={events} deleteEvent={deleteEvent} />;
} 