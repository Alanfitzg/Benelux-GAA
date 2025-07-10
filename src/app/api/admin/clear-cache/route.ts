import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { revalidateTag } from 'next/cache';

export async function POST() {
  try {
    const authResult = await requireSuperAdmin();
    if (authResult instanceof NextResponse) return authResult;

    // Clear all club-related caches
    revalidateTag('clubs');
    revalidateTag('filters');
    
    console.log('Admin manually cleared club caches');
    
    return NextResponse.json({
      success: true,
      message: "Club caches cleared successfully",
      clearedTags: ['clubs', 'filters']
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}