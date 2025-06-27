import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, message, type } = body;

    // Validate required fields
    if (!name || !email || !type) {
      return NextResponse.json(
        { error: "Name, email, and type are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true,
        contactEmail: true,
        contactFirstName: true,
        contactLastName: true
      }
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found" },
        { status: 404 }
      );
    }

    // Store the contact/interest record
    await prisma.clubInterest.create({
      data: {
        clubId: id,
        name,
        email,
        message: message || null,
        type, // 'contact' or 'interest'
      }
    });

    // TODO: Send email notification to club contact if they have email configured
    // This would be implemented with your email service (SendGrid, Postmark, etc.)

    return NextResponse.json({ 
      success: true, 
      message: type === 'contact' 
        ? "Your message has been sent to the club!" 
        : "Your interest has been recorded! The club will be notified."
    });

  } catch (error) {
    console.error("Error processing club contact/interest:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
}