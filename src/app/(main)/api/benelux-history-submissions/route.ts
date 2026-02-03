import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export interface HistorySubmission {
  id: string;
  title: string;
  year: string;
  month?: string;
  description: string;
  sourceUrl?: string;
  sourceName?: string;
  submitterName: string;
  submitterEmail: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

// In-memory storage for demo purposes
const submissions: HistorySubmission[] = [];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function GET() {
  // Return all submissions for admin review
  return NextResponse.json(submissions);
}

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Check honeypot field - if filled, it's a bot
    if (body.website && body.website.length > 0) {
      // Silently reject but return success to not alert the bot
      return NextResponse.json({ id: "success" }, { status: 201 });
    }

    const newSubmission: HistorySubmission = {
      id: generateId(),
      title: body.title || "",
      year: body.year || "",
      month: body.month || "",
      description: body.description || "",
      sourceUrl: body.sourceUrl || "",
      sourceName: body.sourceName || "",
      submitterName: body.submitterName || "",
      submitterEmail: body.submitterEmail || "",
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    submissions.unshift(newSubmission);

    return NextResponse.json(newSubmission, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit" }, { status: 400 });
  }
}

export const POST = withRateLimit(RATE_LIMITS.FORMS, postHandler);

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      );
    }

    const index = submissions.findIndex((s) => s.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    submissions[index] = {
      ...submissions[index],
      status: body.status ?? submissions[index].status,
    };

    return NextResponse.json(submissions[index]);
  } catch {
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      );
    }

    const index = submissions.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    submissions.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete submission" },
      { status: 400 }
    );
  }
}
