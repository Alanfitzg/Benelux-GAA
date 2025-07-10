import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { getGeocodeStats, cleanupGeocodeCache } from "@/lib/utils/geocoding";

export async function GET() {
  try {
    const authResult = await requireSuperAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const stats = getGeocodeStats();
    
    return NextResponse.json({
      success: true,
      cache: {
        size: stats.cacheSize,
        entries: stats.cacheEntries,
        message: `Cache contains ${stats.cacheSize} geocoded locations`
      }
    });
  } catch (error) {
    console.error("Error fetching geocode cache stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const authResult = await requireSuperAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const removed = cleanupGeocodeCache();
    
    return NextResponse.json({
      success: true,
      message: `Removed ${removed} expired cache entries`,
      removedCount: removed
    });
  } catch (error) {
    console.error("Error cleaning geocode cache:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}