import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/ui/DeleteButton";
import { MESSAGES, UI } from "@/lib/constants";

type ClubListItem = {
  id: string;
  name: string;
  map: string | null;
  imageUrl: string | null;
  region: string | null;
  subRegion: string | null;
  location: string | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  codes: string | null;
  teamTypes: string[];
};

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
    },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-green-800">Manage Clubs</h1>
      <div className={`grid ${UI.GRID_LAYOUTS.RESPONSIVE} gap-4`}>
        {clubs.map((club: ClubListItem) => (
          <div key={club.id} className={UI.CARD_STYLES.DEFAULT}>
            <h2 className="text-lg font-semibold mb-1 text-green-800">
              {club.name}
            </h2>
            <p className="text-gray-700">
              <strong>Region:</strong> {club.region || MESSAGES.DEFAULTS.PLACEHOLDER}
            </p>
            <p className="text-gray-700">
              <strong>Location:</strong> {club.location || MESSAGES.DEFAULTS.PLACEHOLDER}
            </p>
            <p className="text-gray-700">
              <strong>Team Types:</strong> {club.teamTypes.length > 0 ? club.teamTypes.join(", ") : MESSAGES.DEFAULTS.PLACEHOLDER}
            </p>
            <div className="mt-2 space-x-2">
              <Link
                href={`/admin/clubs/${club.id}/edit`}
                className={UI.BUTTON_STYLES.INFO}
              >
                {MESSAGES.BUTTONS.EDIT}
              </Link>
              <DeleteButton id={club.id} onDelete={deleteClub} itemType="club" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
