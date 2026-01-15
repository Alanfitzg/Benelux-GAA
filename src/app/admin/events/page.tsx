import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import EventsManagementClient from "@/components/admin/EventsManagementClient";
import { sendEventRejectedEmail } from "@/lib/emails/event-rejected-email";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  async function deleteEvent(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.event.delete({ where: { id } });
    revalidatePath("/admin/events");
  }

  async function approveEvent(formData: FormData) {
    "use server";
    const session = await auth();
    const id = formData.get("id") as string;
    await prisma.event.update({
      where: { id },
      data: {
        approvalStatus: "APPROVED",
        approvedAt: new Date(),
        approvedBy: session?.user?.id,
      },
    });
    revalidatePath("/admin/events");
  }

  async function rejectEvent(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const reason = formData.get("reason") as string;

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        title: true,
        club: {
          select: {
            admins: {
              select: {
                email: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    await prisma.event.update({
      where: { id },
      data: {
        approvalStatus: "REJECTED",
        rejectionReason: reason || "No reason provided",
      },
    });

    if (event?.club?.admins && event.club.admins.length > 0) {
      try {
        for (const admin of event.club.admins) {
          await sendEventRejectedEmail({
            to: admin.email,
            userName: admin.name || admin.username,
            eventTitle: event.title,
            rejectionReason: reason || "No reason provided",
            eventId: id,
          });
        }
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }
    }

    revalidatePath("/admin/events");
  }

  const events = await prisma.event.findMany({
    orderBy: [
      { approvalStatus: "asc" }, // PENDING first
      { startDate: "asc" },
    ],
    select: {
      id: true,
      title: true,
      eventType: true,
      location: true,
      startDate: true,
      visibility: true,
      acceptedTeamTypes: true,
      approvalStatus: true,
      rejectionReason: true,
      cost: true,
      platformFee: true,
      club: {
        select: {
          id: true,
          name: true,
          region: true,
          country: {
            select: {
              id: true,
              name: true,
            },
          },
          internationalUnit: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <EventsManagementClient
      initialEvents={events}
      deleteEvent={deleteEvent}
      approveEvent={approveEvent}
      rejectEvent={rejectEvent}
    />
  );
}
