import { prisma } from "@/lib/prisma";
import ContactSubmissionsClient from "@/components/admin/ContactSubmissionsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Submissions | Admin Dashboard",
  description: "View and manage contact form submissions from the website.",
};

async function getContactSubmissions() {
  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });
    return submissions;
  } catch (error) {
    console.error("Failed to fetch contact submissions:", error);
    return [];
  }
}

async function getStats() {
  try {
    const [total, byStatus, recentCount] = await Promise.all([
      prisma.contactSubmission.count(),
      prisma.contactSubmission.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.contactSubmission.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return { total, byStatus, recentCount };
  } catch (error) {
    console.error("Failed to fetch contact stats:", error);
    return { total: 0, byStatus: [], recentCount: 0 };
  }
}

export default async function ContactSubmissionsPage() {
  const [submissions, stats] = await Promise.all([
    getContactSubmissions(),
    getStats(),
  ]);

  return (
    <ContactSubmissionsClient
      submissions={JSON.parse(JSON.stringify(submissions))}
      stats={stats}
    />
  );
}
