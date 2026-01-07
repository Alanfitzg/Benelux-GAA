import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClubAdminDashboard from "@/components/ClubAdminDashboard";

export default async function ClubAdminPage({
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
          // Super admins can access any club dashboard
          id: session.user.role === "SUPER_ADMIN" ? id : undefined,
        },
      ],
    },
    select: {
      id: true,
      isMainlandEurope: true,
    },
  });

  if (!club) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <ClubAdminDashboard
          clubId={id}
          isMainlandEurope={club.isMainlandEurope}
        />
      </div>
    </div>
  );
}
