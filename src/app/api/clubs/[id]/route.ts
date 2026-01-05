import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireClubAdmin, getServerSession } from "@/lib/auth-helpers";
import { geocodeLocation } from "@/lib/utils/geocoding";
import { revalidateTag } from "next/cache";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const club = await prisma.club.findUnique({ where: { id } });
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }
    return NextResponse.json(club);
  } catch {
    return NextResponse.json({ error: "Error fetching club" }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await requireClubAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { id } = await context.params;
  try {
    const data = await req.json();

    // Geocode location if it has changed
    let geocodeData: { latitude?: number | null; longitude?: number | null } =
      {};
    if (data.location) {
      const currentClub = await prisma.club.findUnique({
        where: { id },
        select: { location: true },
      });

      if (currentClub && currentClub.location !== data.location) {
        const coords = await geocodeLocation(data.location);
        geocodeData = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }
    }

    const club = await prisma.club.update({
      where: { id },
      data: {
        name: data.name,
        map: data.map,
        location: data.location,
        region: data.region,
        subRegion: data.subRegion,
        facebook: data.facebook,
        instagram: data.instagram,
        website: data.website,
        codes: data.codes,
        imageUrl: data.imageUrl,
        teamTypes: data.teamTypes || [],
        ...geocodeData,
      },
    });

    // Invalidate club caches when club is updated
    console.log("Club updated, invalidating club caches");
    revalidateTag("clubs");
    revalidateTag("filters");

    return NextResponse.json(club);
  } catch {
    return NextResponse.json({ error: "Error updating club" }, { status: 400 });
  }
}

// PATCH method for club admins to edit their own clubs
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // Check if user is admin of this club or super admin
    const club = await prisma.club.findFirst({
      where: {
        id,
        OR: [
          {
            admins: {
              some: {
                id: session.user.id,
              },
            },
          },
          {
            // Super admins can edit any club
            id: session.user.role === "SUPER_ADMIN" ? id : undefined,
          },
        ],
      },
    });

    if (!club) {
      return NextResponse.json(
        { error: "Club not found or unauthorized" },
        { status: 404 }
      );
    }

    const data = await req.json();

    // Geocode location if it has changed
    let geocodeData: { latitude?: number | null; longitude?: number | null } =
      {};
    if (data.location && data.location !== club.location) {
      const coords = await geocodeLocation(data.location);
      geocodeData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    }

    const updatedClub = await prisma.club.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        region: data.region,
        subRegion: data.subRegion,
        facebook: data.facebook,
        instagram: data.instagram,
        website: data.website,
        twitter: data.twitter,
        tiktok: data.tiktok,
        codes: data.codes,
        imageUrl: data.imageUrl,
        teamTypes: data.teamTypes || [],
        contactFirstName: data.contactFirstName,
        contactLastName: data.contactLastName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        contactCountryCode: data.contactCountryCode,
        isContactWilling: data.isContactWilling || false,
        foundedYear:
          data.foundedYear !== undefined ? data.foundedYear : undefined,
        bio: data.bio !== undefined ? data.bio : undefined,
        isOpenToVisitors:
          data.isOpenToVisitors !== undefined
            ? data.isOpenToVisitors
            : undefined,
        preferredWeekends:
          data.preferredWeekends !== undefined
            ? data.preferredWeekends
            : undefined,
        twinClubId: data.twinClubId !== undefined ? data.twinClubId : undefined,
        ...geocodeData,
      },
    });

    // Invalidate club caches when club is updated
    console.log("Club updated by admin, invalidating club caches");
    revalidateTag("clubs");
    revalidateTag("filters");

    return NextResponse.json(updatedClub);
  } catch (error) {
    console.error("Error updating club:", error);
    return NextResponse.json({ error: "Error updating club" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await requireClubAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { id } = await context.params;
  try {
    await prisma.club.delete({ where: { id } });

    // Invalidate club caches when club is deleted
    console.log("Club deleted, invalidating club caches");
    revalidateTag("clubs");
    revalidateTag("filters");

    return NextResponse.json({ message: "Club deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Error deleting club" }, { status: 400 });
  }
}
