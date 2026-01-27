import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import ClubTestimonialManager from "@/components/testimonials/ClubTestimonialManager";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ClubTestimonialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      admins: {
        select: { id: true },
      },
    },
  });

  if (!club) {
    redirect("/clubs");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  const isClubAdmin = club.admins.some((admin) => admin.id === session.user.id);
  const canManage = isSuperAdmin || isClubAdmin;

  if (!canManage) {
    redirect(`/clubs/${id}`);
  }

  const testimonials = await prisma.testimonial.findMany({
    where: { clubId: id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { displayOrder: "asc" },
      { submittedAt: "desc" },
    ],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/club-admin/${id}`}
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Club Admin
        </Link>

        <h1 className="text-3xl font-bold">
          Manage Testimonials - {club.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Review and approve testimonials submitted for your club
        </p>
      </div>

      <ClubTestimonialManager
        clubId={id}
        testimonials={testimonials.map((t) => ({
          ...t,
          submittedAt: t.submittedAt.toISOString(),
          superAdminApprovedAt: t.superAdminApprovedAt?.toISOString() || null,
        }))}
        canManage={canManage}
      />
    </div>
  );
}
