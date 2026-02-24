import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface Subscriber {
  email: string;
  subscribedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, website, phone_number, _timestamp } = body;

    if (website || phone_number) {
      return NextResponse.json({ success: true });
    }

    if (_timestamp && Date.now() - Number(_timestamp) < 2000) {
      return NextResponse.json({ success: true });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.siteData.findUnique({
      where: { key: "newsletter_subscribers" },
    });

    const subscribers: Subscriber[] = existing?.data
      ? (existing.data as unknown as Subscriber[])
      : [];

    if (subscribers.some((s) => s.email === cleanEmail)) {
      return NextResponse.json({ success: true });
    }

    subscribers.push({
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
    });

    await prisma.siteData.upsert({
      where: { key: "newsletter_subscribers" },
      update: { data: subscribers as unknown as Prisma.InputJsonValue },
      create: {
        key: "newsletter_subscribers",
        data: subscribers as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = await prisma.siteData.findUnique({
      where: { key: "newsletter_subscribers" },
    });

    const subscribers: Subscriber[] = data?.data
      ? (data.data as unknown as Subscriber[])
      : [];

    return NextResponse.json({ subscribers, count: subscribers.length });
  } catch {
    return NextResponse.json({ subscribers: [], count: 0 });
  }
}
