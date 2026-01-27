import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClubEditForm from "@/components/club/ClubEditForm";

export default async function ClubEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/signin");
  }

  // Check if user is authorized to edit this club
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
          // Super admins can edit any club
          id: session.user.role === "SUPER_ADMIN" ? id : undefined,
        },
      ],
    },
    include: {
      admins: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      internationalUnit: {
        select: {
          name: true,
        },
      },
      country: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!club) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Club Details
          </h1>
          <p className="text-gray-600">
            Update your club&apos;s information to keep members and visitors
            informed
          </p>
        </div>

        <ClubEditForm club={club} />
      </div>
    </div>
  );
}
