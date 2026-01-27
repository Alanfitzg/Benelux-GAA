import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all events with approval-related fields
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        eventType: true,
        location: true,
        approvalStatus: true,
        rejectionReason: true,
        rejectionAppeal: true,
        appealStatus: true,
        appealedAt: true,
        appealResolvedAt: true,
        appealResolution: true,
        approvedAt: true,
        createdAt: true,
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate approval stats
    const totalSubmissions = events.length;
    const approved = events.filter(
      (e) => e.approvalStatus === "APPROVED"
    ).length;
    const rejected = events.filter(
      (e) => e.approvalStatus === "REJECTED"
    ).length;
    const pending = events.filter((e) => e.approvalStatus === "PENDING").length;

    const approvalRate =
      totalSubmissions > 0
        ? Math.round((approved / totalSubmissions) * 100)
        : 0;
    const rejectionRate =
      totalSubmissions > 0
        ? Math.round((rejected / totalSubmissions) * 100)
        : 0;

    // Appeal stats
    const eventsWithAppeals = events.filter((e) => e.rejectionAppeal);
    const totalAppeals = eventsWithAppeals.length;
    const pendingAppeals = events.filter(
      (e) => e.appealStatus === "PENDING"
    ).length;
    const deniedAppeals = events.filter(
      (e) => e.appealStatus === "DENIED"
    ).length;
    const approvedAppeals = events.filter(
      (e) => e.appealStatus === "APPROVED"
    ).length;
    const resolvedAppeals = deniedAppeals + approvedAppeals;

    const appealRate =
      rejected > 0 ? Math.round((totalAppeals / rejected) * 100) : 0;
    const appealSuccessRate =
      resolvedAppeals > 0
        ? Math.round((approvedAppeals / resolvedAppeals) * 100)
        : 0;

    // Monthly approval trends (last 12 months)
    const monthlyStats: Record<
      string,
      { approved: number; rejected: number; total: number }
    > = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyStats[key] = { approved: 0, rejected: 0, total: 0 };
    }

    events.forEach((e) => {
      const date = new Date(e.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyStats[key]) {
        monthlyStats[key].total++;
        if (e.approvalStatus === "APPROVED") {
          monthlyStats[key].approved++;
        } else if (e.approvalStatus === "REJECTED") {
          monthlyStats[key].rejected++;
        }
      }
    });

    // Rejection reasons breakdown
    const rejectionReasons: Record<string, number> = {};
    events
      .filter((e) => e.rejectionReason)
      .forEach((e) => {
        // Categorize rejection reasons (simplified)
        const reason = e.rejectionReason || "Unspecified";
        const key =
          reason.length > 50 ? reason.substring(0, 50) + "..." : reason;
        rejectionReasons[key] = (rejectionReasons[key] || 0) + 1;
      });

    // By event type
    const byEventType: Record<
      string,
      { approved: number; rejected: number; total: number }
    > = {};
    events.forEach((e) => {
      const type = e.eventType || "Unknown";
      if (!byEventType[type]) {
        byEventType[type] = { approved: 0, rejected: 0, total: 0 };
      }
      byEventType[type].total++;
      if (e.approvalStatus === "APPROVED") {
        byEventType[type].approved++;
      } else if (e.approvalStatus === "REJECTED") {
        byEventType[type].rejected++;
      }
    });

    // Average time to approval (for approved events)
    const approvedWithTimes = events.filter(
      (e) => e.approvalStatus === "APPROVED" && e.approvedAt
    );
    let avgApprovalTimeHours = 0;
    if (approvedWithTimes.length > 0) {
      const totalHours = approvedWithTimes.reduce((sum, e) => {
        const created = new Date(e.createdAt).getTime();
        const approved = new Date(e.approvedAt!).getTime();
        return sum + (approved - created) / (1000 * 60 * 60);
      }, 0);
      avgApprovalTimeHours = Math.round(totalHours / approvedWithTimes.length);
    }

    // Recent rejections (for review)
    const recentRejections = events
      .filter((e) => e.approvalStatus === "REJECTED")
      .slice(0, 10)
      .map((e) => ({
        title: e.title,
        eventType: e.eventType,
        clubName: e.club?.name || "Independent",
        reason: e.rejectionReason,
        hasAppeal: !!e.rejectionAppeal,
        appealStatus: e.appealStatus,
        createdAt: e.createdAt,
      }));

    // Recent appeals
    const recentAppeals = events
      .filter((e) => e.rejectionAppeal)
      .slice(0, 10)
      .map((e) => ({
        title: e.title,
        eventType: e.eventType,
        clubName: e.club?.name || "Independent",
        appealStatus: e.appealStatus || "PENDING",
        appealedAt: e.appealedAt,
        resolvedAt: e.appealResolvedAt,
        resolution: e.appealResolution,
      }));

    const report = {
      summary: {
        totalSubmissions,
        approved,
        rejected,
        pending,
        approvalRate,
        rejectionRate,
        avgApprovalTimeHours,
      },
      appeals: {
        totalAppeals,
        pendingAppeals,
        deniedAppeals,
        approvedAppeals,
        appealRate,
        appealSuccessRate,
      },
      // Marketing-friendly stat
      marketingHighlight: {
        message:
          rejectionRate <= 10
            ? `We approve ${approvalRate}% of all event applications!`
            : `Our approval rate is ${approvalRate}%`,
        approvalRate,
        rejectionRate,
      },
      monthlyTrends: Object.entries(monthlyStats).map(([month, stats]) => ({
        month,
        ...stats,
        approvalRate:
          stats.total > 0
            ? Math.round((stats.approved / stats.total) * 100)
            : 0,
      })),
      byEventType: Object.entries(byEventType)
        .map(([type, stats]) => ({
          type,
          ...stats,
          approvalRate:
            stats.total > 0
              ? Math.round((stats.approved / stats.total) * 100)
              : 0,
        }))
        .sort((a, b) => b.total - a.total),
      rejectionReasons: Object.entries(rejectionReasons)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      recentRejections,
      recentAppeals,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating event approvals report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
