import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import ClubsManagementClient from "@/components/admin/ClubsManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  async function deleteClub(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.club.delete({ where: { id } });
    revalidatePath("/admin/clubs");
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
