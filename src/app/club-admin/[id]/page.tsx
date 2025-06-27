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
  const isAuthorized = await prisma.club.findFirst({
    where: {
      id,
      OR: [
        {
          admins: {
            some: {
              id: session.user.id
            }
          }
        },
        {
          // Super admins can access any club dashboard
          id: session.user.role === 'SUPER_ADMIN' ? id : undefined
        }
      ]
    }
  });

  if (!isAuthorized) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ClubAdminDashboard clubId={id} />
    </div>
  );
}