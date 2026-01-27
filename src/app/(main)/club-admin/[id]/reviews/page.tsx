import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ClubReviewsClient } from "./ClubReviewsClient";

export const metadata: Metadata = {
  title: "Club Reviews | PlayAway",
  description: "View reviews received for your club",
};

interface ClubReviewsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClubReviewsPage({
  params,
}: ClubReviewsPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const { id: clubId } = await params;

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      name: true,
      admins: {
        select: { id: true },
      },
    },
  });

  if (!club) {
    redirect("/");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const isClubAdmin = club.admins.some((admin) => admin.id === session.user.id);

  if (!isSuperAdmin && !isClubAdmin) {
    redirect("/");
  }

  const reviews = await prisma.eventReview.findMany({
    where: { targetClubId: clubId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          location: true,
          startDate: true,
        },
      },
      reviewerClub: {
        select: {
          id: true,
          name: true,
        },
      },
      conflict: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Reviews for {club.name}
          </h1>
          <p className="text-gray-400">
            View feedback received from other clubs
          </p>
        </div>
        <ClubReviewsClient reviews={reviews} />
      </div>
    </div>
  );
}
