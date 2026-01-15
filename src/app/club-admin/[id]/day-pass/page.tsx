import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import DayPassConfigClient from "./DayPassConfigClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DayPassConfigPage({ params }: PageProps) {
  const session = await auth();
  const { id: clubId } = await params;

  if (!session?.user) {
    redirect("/signin");
  }

  // Check if user is admin of this club or super admin
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      admins: {
        where: { id: session.user.id },
        select: { id: true },
      },
    },
  });

  if (!club) {
    notFound();
  }

  const isClubAdmin = club.admins.length > 0;
  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  if (!isClubAdmin && !isSuperAdmin) {
    redirect(`/clubs/${clubId}`);
  }

  return (
    <DayPassConfigClient
      clubId={clubId}
      clubName={club.name}
      initialPrice={club.dayPassPrice}
      initialCurrency={club.dayPassCurrency || "EUR"}
    />
  );
}
