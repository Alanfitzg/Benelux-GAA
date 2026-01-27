import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import AdminDashboardClient from "./AdminDashboardClient";

async function getStats() {
  const [clubCount, countryCount, userCount, eventCount] = await Promise.all([
    prisma.club.count(),
    prisma.country.count(),
    prisma.user.count(),
    prisma.event.count({ where: { approvalStatus: "APPROVED" } }),
  ]);

  return { clubCount, countryCount, userCount, eventCount };
}

export default async function AdminDashboard() {
  const session = await getServerSession();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const stats = await getStats();

  return <AdminDashboardClient stats={stats} />;
}
