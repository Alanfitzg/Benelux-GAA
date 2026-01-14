import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getServerSession } from "@/lib/auth-helpers";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { geocodeLocation } from "@/lib/utils/geocoding";
import { unstable_cache, revalidateTag } from "next/cache";
import { TEAM_TYPES } from "@/lib/constants/teams";

// Valid team types for filtering (excludes legacy/invalid values from database)
const VALID_TEAM_TYPES = new Set(TEAM_TYPES);

// Cached function for club filter options (countries and team types)
const getCachedFilterOptions = unstable_cache(
  async () => {
    console.log("Cache miss: Computing club filter options from database");
    const allClubs = await prisma.club.findMany({
      where: { status: "APPROVED" }, // Only include approved clubs in filter options
      select: { location: true, teamTypes: true },
    });

    const countries = Array.from(
      new Set(
        allClubs
          .map((club) => club.location?.split(",").pop()?.trim())
          .filter(Boolean)
      )
    ).sort() as string[];

    // Filter to only include valid team types (excludes legacy values like "Men's Football")
    const teamTypes = Array.from(
      new Set(allClubs.flatMap((club) => club.teamTypes))
    )
      .filter((type) =>
        VALID_TEAM_TYPES.has(type as (typeof TEAM_TYPES)[number])
      )
      .sort();

    return { countries, teamTypes };
  },
  ["club-filter-options"], // Cache key
  {
    revalidate: 21600, // 6 hours (filter options change rarely)
    tags: ["clubs", "filters"],
  }
);

async function createClubHandler(req: NextRequest) {
  try {
    // Change from requireClubAdmin to requireAuth - any authenticated user can create clubs
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Geocode location if provided
    let geocodeData: { latitude?: number | null; longitude?: number | null } =
      {};
    if (data.location) {
      const coords = await geocodeLocation(data.location);
      geocodeData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    }

    const club = await prisma.club.create({
      data: {
        name: data.name,
        internationalUnitText: data.internationalUnit || null,
        region: data.region || null,
        subRegion: data.subRegion || null,
        map: data.map || null,
        location: data.location || null,
        facebook: data.facebook || null,
        instagram: data.instagram || null,
        website: data.website || null,
        codes: data.codes || null,
        imageUrl: data.imageUrl || null,
        teamTypes: data.teamTypes || [],
        contactFirstName: data.contactFirstName || null,
        contactLastName: data.contactLastName || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        contactCountryCode: data.contactCountryCode || null,
        isContactWilling: data.isContactWilling || false,
        // New status fields - all new clubs start as PENDING
        status: "PENDING",
        submittedBy: authResult.user.id,
        ...geocodeData,
      },
    });

    // Invalidate club caches when a new club is created
    console.log("New club created, invalidating club caches");
    revalidateTag("clubs");
    revalidateTag("filters");

    return NextResponse.json({ club }, { status: 201 });
  } catch (error) {
    console.error("Error creating club:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function getClubsHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "";
    const teamType = searchParams.get("teamType") || "";
    const search = searchParams.get("search") || "";
    const clubType = searchParams.get("clubType") || "";

    // Check if user is admin (to show all clubs) or regular user (only approved clubs)
    const session = await getServerSession();
    const isAdmin =
      session?.user?.role === "SUPER_ADMIN" ||
      session?.user?.role === "GUEST_ADMIN";

    // Build filter conditions
    const where: {
      status?: "APPROVED" | "PENDING" | "REJECTED";
      location?: { contains: string; mode: "insensitive" };
      teamTypes?: { has: string };
      clubType?: "CLUB" | "UNIVERSITY" | "SCHOOL" | "COUNTY";
      OR?: Array<
        | { name: { contains: string; mode: "insensitive" } }
        | { location: { contains: string; mode: "insensitive" } }
      >;
    } = {};

    // Only show approved clubs to non-admin users
    if (!isAdmin) {
      where.status = "APPROVED";
    }

    if (country && country !== "") {
      where.location = { contains: country, mode: "insensitive" };
    }

    if (teamType && teamType !== "") {
      where.teamTypes = { has: teamType };
    }

    if (clubType && clubType !== "") {
      where.clubType = clubType as "CLUB" | "UNIVERSITY" | "SCHOOL" | "COUNTY";
    }

    if (search && search !== "") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get filtered clubs with retry logic
    let clubs;
    let retries = 3;
    while (retries > 0) {
      try {
        clubs = await prisma.club.findMany({
          where,
          orderBy: [{ location: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            imageUrl: true,
            region: true,
            subRegion: true,
            map: true,
            location: true,
            latitude: true,
            longitude: true,
            facebook: true,
            instagram: true,
            website: true,
            codes: true,
            teamTypes: true,
            clubType: true,
            status: true,
            verificationStatus: true,
            verifiedAt: true,
            createdAt: true,
            submittedBy: true,
            dayPassPrice: true,
            dayPassCurrency: true,
          },
        });
        break; // Success, exit retry loop
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error("Failed to fetch clubs after retries:", error);
          throw error;
        }
        console.warn(
          `Database connection failed, retrying... (${retries} attempts left)`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }

    // Get cached filter options (with manual cache invalidation after club status changes)
    let filterOptions;
    try {
      console.log("Clubs API: Getting filter options from cache");
      filterOptions = await getCachedFilterOptions();

      // Validate cache - if we have clubs but no countries, invalidate and rebuild
      if (clubs && clubs.length > 0 && filterOptions.countries.length === 0) {
        console.log(
          "Cache appears stale (clubs exist but no countries), rebuilding..."
        );
        revalidateTag("club-filter-options");
        revalidateTag("clubs");
        revalidateTag("filters");

        // Compute directly as fallback
        const approvedClubs = await prisma.club.findMany({
          where: { status: "APPROVED" },
          select: { location: true, teamTypes: true },
        });

        const countries = Array.from(
          new Set(
            approvedClubs
              .map((club) => club.location?.split(",").pop()?.trim())
              .filter(Boolean)
          )
        ).sort() as string[];

        // Filter to only include valid team types (excludes legacy values)
        const teamTypes = Array.from(
          new Set(approvedClubs.flatMap((club) => club.teamTypes))
        )
          .filter((type) =>
            VALID_TEAM_TYPES.has(type as (typeof TEAM_TYPES)[number])
          )
          .sort();

        filterOptions = { countries, teamTypes };
        console.log(
          `Rebuilt filter options: ${countries.length} countries, ${teamTypes.length} team types`
        );
      }
    } catch (error) {
      console.error("Failed to fetch club filters:", error);
      // Return clubs without filters if this fails
      return NextResponse.json({
        clubs,
        countries: [],
        teamTypes: [],
      });
    }

    return NextResponse.json({
      clubs,
      countries: filterOptions.countries,
      teamTypes: filterOptions.teamTypes,
    });
  } catch (error) {
    console.error("Error fetching clubs:", error);

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      error.message.includes("Can't reach database server")
    ) {
      console.warn("Database connection failed, returning empty data");
      // Return empty data structure to allow the app to function
      return NextResponse.json({
        clubs: [],
        countries: [],
        teamTypes: [],
      });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Apply rate limiting to endpoints
export const POST = withRateLimit(RATE_LIMITS.ADMIN, createClubHandler);
export const GET = withRateLimit(RATE_LIMITS.PUBLIC_API, getClubsHandler);
