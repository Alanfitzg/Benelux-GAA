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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary to-slate-800 relative">
      {/* Background pattern for entire page */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary rounded-full blur-3xl opacity-50"></div>
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8">
        <ClubAdminDashboard
          clubId={id}
          isMainlandEurope={club.isMainlandEurope}
        />
      </div>
    </div>
  );
}
