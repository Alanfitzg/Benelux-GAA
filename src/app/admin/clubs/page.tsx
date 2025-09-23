import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import ClubsManagementClient from "@/components/admin/ClubsManagementClient";
import { getServerSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }
  async function deleteClub(formData: FormData) {
    "use server";

    // Re-check authentication in server action
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized");
    }

    const id = formData.get("id") as string;

    try {
      // First check if the club exists
      const existingClub = await prisma.club.findUnique({ where: { id } });
      if (!existingClub) {
        throw new Error("Club not found or already deleted");
      }

      // Delete all related records first in a transaction
      await prisma.$transaction(async (tx) => {
        // Delete related testimonials
        await tx.testimonial.deleteMany({ where: { clubId: id } });

        // Delete related pitch locations
        await tx.pitchLocation.deleteMany({ where: { clubId: id } });

        // Delete related tournament teams
        await tx.tournamentTeam.deleteMany({ where: { clubId: id } });

        // Delete related tournament interests
        await tx.tournamentInterest.deleteMany({ where: { clubId: id } });

        // Delete related hosting packages
        await tx.hostingPackage.deleteMany({ where: { clubId: id } });

        // Delete related events
        await tx.event.deleteMany({ where: { clubId: id } });

        // Delete related club interests
        await tx.clubInterest.deleteMany({ where: { clubId: id } });

        // Delete related club admin requests
        await tx.clubAdminRequest.deleteMany({ where: { clubId: id } });

        // Delete related bookings
        await tx.booking.deleteMany({ where: { clubId: id } });

        // Delete related availability slots
        await tx.availabilitySlot.deleteMany({ where: { clubId: id } });

        // Delete related calendar events
        await tx.calendarEvent.deleteMany({ where: { clubId: id } });

        // Finally delete the club itself
        await tx.club.delete({ where: { id } });
      });

      revalidatePath("/admin/clubs");
    } catch (error) {
      console.error("Error deleting club:", error);
      if (error instanceof Error && error.message === "Club not found or already deleted") {
        // If club doesn't exist, just revalidate and return success
        revalidatePath("/admin/clubs");
        return;
      }
      throw new Error("Failed to delete club and its related data");
    }
  }

  const clubs = await prisma.club.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      map: true,
      imageUrl: true,
      region: true,
      subRegion: true,
      location: true,
      facebook: true,
      instagram: true,
      website: true,
      codes: true,
      teamTypes: true,
      country: {
        select: {
          name: true,
        }
      },
      internationalUnit: {
        select: {
          name: true,
        }
      },
      regionRecord: {
        select: {
          name: true,
        }
      }
    },
  });

  return <ClubsManagementClient initialClubs={clubs} deleteClub={deleteClub} />;
}
