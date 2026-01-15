import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import TestimonialAdminPanel from "./TestimonialAdminPanel";

export default async function AdminTestimonialsPage() {
  const session = await getServerSession();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const testimonials = await prisma.testimonial.findMany({
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

  const deletionRequests = await prisma.testimonial.findMany({
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

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8">
        Testimonial Management
      </h1>

      <TestimonialAdminPanel
        pendingTestimonials={testimonials.map((t) => ({
          ...t,
          deleteRequestedAt: t.deleteRequestedAt?.toISOString() || null,
          submittedAt: t.submittedAt.toISOString(),
        }))}
        deletionRequests={deletionRequests.map((t) => ({
          ...t,
          deleteRequestedAt: t.deleteRequestedAt?.toISOString() || null,
          submittedAt: t.submittedAt.toISOString(),
        }))}
      />
    </div>
  );
}
