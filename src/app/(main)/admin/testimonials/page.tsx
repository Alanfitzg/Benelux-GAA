import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import TestimonialAdminPanel from "./TestimonialAdminPanel";

export default async function AdminTestimonialsPage() {
  const session = await getServerSession();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  // Fetch legacy testimonials (existing system)
  const legacyTestimonials = await prisma.testimonial.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
      club: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      submittedAt: "asc",
    },
  });

  const legacyDeletionRequests = await prisma.testimonial.findMany({
    where: {
      deleteRequested: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
      club: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      deleteRequestedAt: "asc",
    },
  });

  // Fetch new guest testimonials (travelling clubs reviewing hosts)
  const pendingGuestTestimonials = await prisma.guestTestimonial.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      guestClub: {
        select: { id: true, name: true, location: true },
      },
      hostClub: {
        select: { id: true, name: true, location: true },
      },
      guestUser: {
        select: { id: true, name: true, username: true, email: true },
      },
      event: {
        select: { id: true, title: true },
      },
    },
    orderBy: {
      submittedAt: "asc",
    },
  });

  const guestDeletionRequests = await prisma.guestTestimonial.findMany({
    where: {
      deleteRequested: true,
    },
    include: {
      guestClub: {
        select: { id: true, name: true, location: true },
      },
      hostClub: {
        select: { id: true, name: true, location: true },
      },
      guestUser: {
        select: { id: true, name: true, username: true, email: true },
      },
    },
    orderBy: {
      deleteRequestedAt: "asc",
    },
  });

  // Fetch new host testimonials (hosts reviewing travelling clubs)
  const pendingHostTestimonials = await prisma.hostTestimonial.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      hostClub: {
        select: { id: true, name: true, location: true },
      },
      guestClub: {
        select: { id: true, name: true, location: true },
      },
      hostUser: {
        select: { id: true, name: true, username: true, email: true },
      },
      event: {
        select: { id: true, title: true },
      },
    },
    orderBy: {
      submittedAt: "asc",
    },
  });

  const hostDeletionRequests = await prisma.hostTestimonial.findMany({
    where: {
      deleteRequested: true,
    },
    include: {
      hostClub: {
        select: { id: true, name: true, location: true },
      },
      guestClub: {
        select: { id: true, name: true, location: true },
      },
      hostUser: {
        select: { id: true, name: true, username: true, email: true },
      },
    },
    orderBy: {
      deleteRequestedAt: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
            Testimonial Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Review and manage club testimonials for the homepage
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <TestimonialAdminPanel
            legacyTestimonials={legacyTestimonials.map((t) => ({
              ...t,
              deleteRequestedAt: t.deleteRequestedAt?.toISOString() || null,
              submittedAt: t.submittedAt.toISOString(),
            }))}
            legacyDeletionRequests={legacyDeletionRequests.map((t) => ({
              ...t,
              deleteRequestedAt: t.deleteRequestedAt?.toISOString() || null,
              submittedAt: t.submittedAt.toISOString(),
            }))}
            guestTestimonials={pendingGuestTestimonials.map((t) => ({
              ...t,
              deleteRequestedAt: t.deleteRequestedAt?.toISOString() || null,
              submittedAt: t.submittedAt.toISOString(),
              approvedAt: t.approvedAt?.toISOString() || null,
            }))}
            guestDeletionRequests={guestDeletionRequests.map((t) => ({
              ...t,
              deleteRequestedAt: t.deleteRequestedAt?.toISOString() || null,
              submittedAt: t.submittedAt.toISOString(),
              approvedAt: t.approvedAt?.toISOString() || null,
            }))}
            hostTestimonials={pendingHostTestimonials.map((t) => ({
              ...t,
              deleteRequestedAt: t.deleteRequestedAt?.toISOString() || null,
              submittedAt: t.submittedAt.toISOString(),
              approvedAt: t.approvedAt?.toISOString() || null,
            }))}
            hostDeletionRequests={hostDeletionRequests.map((t) => ({
              ...t,
              deleteRequestedAt: t.deleteRequestedAt?.toISOString() || null,
              submittedAt: t.submittedAt.toISOString(),
              approvedAt: t.approvedAt?.toISOString() || null,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
