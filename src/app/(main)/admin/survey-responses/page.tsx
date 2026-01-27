import { prisma } from "@/lib/prisma";
import SurveyResponsesClient from "@/components/admin/SurveyResponsesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trip Requests | Admin Dashboard",
  description:
    "View and analyze custom trip requests for GAA travel preferences and insights.",
};

async function getSurveyResponses() {
  try {
    const responses = await prisma.surveyResponse.findMany({
      orderBy: { submittedAt: "desc" },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
          },
        },
      },
    });
    return responses;
  } catch (error) {
    console.error("Failed to fetch survey responses:", error);
    return [];
  }
}

async function getSurveyStats() {
  try {
    const [total, byRole, byCountry, budgetRanges] = await Promise.all([
      prisma.surveyResponse.count(),
      prisma.surveyResponse.groupBy({
        by: ["role"],
        _count: { role: true },
        orderBy: { _count: { role: "desc" } },
      }),
      prisma.surveyResponse.groupBy({
        by: ["country"],
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
      }),
      prisma.surveyResponse.groupBy({
        by: ["budgetPerPerson"],
        _count: { budgetPerPerson: true },
        orderBy: { _count: { budgetPerPerson: "desc" } },
      }),
    ]);

    return { total, byRole, byCountry, budgetRanges };
  } catch (error) {
    console.error("Failed to fetch survey stats:", error);
    return { total: 0, byRole: [], byCountry: [], budgetRanges: [] };
  }
}

export default async function SurveyResponsesPage() {
  const [responses, stats] = await Promise.all([
    getSurveyResponses(),
    getSurveyStats(),
  ]);

  return (
    <SurveyResponsesClient
      responses={JSON.parse(JSON.stringify(responses))}
      stats={stats}
    />
  );
}
