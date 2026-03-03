import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Email sending is not available on this site" },
    { status: 403 }
  );
}
