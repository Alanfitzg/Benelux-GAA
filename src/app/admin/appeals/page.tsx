import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { AppealsDashboard } from "./AppealsDashboard";

export const metadata: Metadata = {
  title: "Event Appeals | Admin | PlayAway",
  description: "Review and resolve event rejection appeals",
};

export default async function AppealsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const appeals = await prisma.event.findMany({
    where: {
      appealStatus: "PENDING",
    },
    include: {
      club: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      appealedAt: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Event Appeals</h1>
          <p className="text-gray-400">
            Review and resolve event rejection appeals from clubs
          </p>
        </div>
        <AppealsDashboard appeals={appeals} />
      </div>
    </div>
  );
}
