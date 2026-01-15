import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClubInquiriesMailbox from "@/components/club/ClubInquiriesMailbox";

export default async function ClubInquiriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/signin");
  }

  // Check if user is authorized to view this club's admin page
  const club = await prisma.club.findFirst({
    where: {
      id,
      OR: [
        {
          admins: {
            some: {
              id: session.user.id,
            },
          },
        },
        {
          id: session.user.role === "SUPER_ADMIN" ? id : undefined,
        },
      ],
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!club) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/club-admin/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {club.name} - Inquiries
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage visitor interest and contact messages
          </p>
        </div>

        <ClubInquiriesMailbox clubId={club.id} clubName={club.name} />
      </div>
    </div>
  );
}
