import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/ui/DeleteButton";
import GeocodeClubsButton from "@/components/admin/GeocodeClubsButton";

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
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Clubs</h1>
        <div className="flex items-center space-x-3">
          <GeocodeClubsButton />
          <Link 
            href="/clubs/register" 
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm hover:shadow-md"
          >
            Register Club
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Types</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clubs.map((club: ClubListItem) => (
                <tr key={club.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {club.imageUrl && (
                        <Image 
                          src={club.imageUrl} 
                          alt={club.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-contain bg-gray-100 mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">{club.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    📍 {club.location || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {club.region || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-1">
                      {club.teamTypes.length > 0 ? 
                        club.teamTypes.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {type}
                          </span>
                        )) : "-"
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Link 
                      href={`/admin/clubs/${club.id}/edit`} 
                      className="text-primary hover:text-primary/80 transition"
                    >
                      Edit
                    </Link>
                    <span className="text-gray-300">|</span>
                    <DeleteButton id={club.id} onDelete={deleteClub} itemType="club" />
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
