import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DeleteButton from "./DeleteButton";
import type { Club } from "@/types";

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
    },
  });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-green-800">Manage Clubs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club: Club) => (
          <div key={club.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-1 text-green-800">
              {club.name}
            </h2>
            <p className="text-gray-700">
              <strong>Region:</strong> {club.region || "-"}
            </p>
            <p className="text-gray-700">
              <strong>Location:</strong> {club.location || "-"}
            </p>
            <div className="mt-2 space-x-2">
              <Link
                href={`/admin/clubs/${club.id}/edit`}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </Link>
              <DeleteButton id={club.id} onDelete={deleteClub} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
