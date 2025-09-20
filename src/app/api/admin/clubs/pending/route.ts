import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  // Check if user is super admin
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';

    const clubs = await prisma.club.findMany({
      where: {
        status: status as 'PENDING' | 'APPROVED' | 'REJECTED'
      },
      include: {
        submitter: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true
          }
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const formattedClubs = clubs.map(club => ({
      id: club.id,
      name: club.name,
      location: club.location || '',
      imageUrl: club.imageUrl,
      teamTypes: club.teamTypes,
      contactFirstName: club.contactFirstName,
      contactLastName: club.contactLastName,
      contactEmail: club.contactEmail,
      contactPhone: club.contactPhone,
      isContactWilling: club.isContactWilling,
      status: club.status,
      createdAt: club.createdAt.toISOString(),
      submittedBy: club.submittedBy,
      submitter: club.submitter ? {
        id: club.submitter.id,
        email: club.submitter.email,
        username: club.submitter.username,
        name: club.submitter.name || club.submitter.username || club.submitter.email
      } : null,
      reviewedAt: club.reviewedAt?.toISOString() || null,
      reviewedBy: club.reviewedBy,
      reviewer: club.reviewer ? {
        id: club.reviewer.id,
        email: club.reviewer.email,
        username: club.reviewer.username,
        name: club.reviewer.name || club.reviewer.username || club.reviewer.email
      } : null,
      rejectionReason: club.rejectionReason,
      adminNotes: club.adminNotes,
      facebook: club.facebook,
      instagram: club.instagram,
      website: club.website,
      region: club.region,
      subRegion: club.subRegion
    }));

    return NextResponse.json({ clubs: formattedClubs });
  } catch (error) {
    console.error('Error fetching pending clubs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    );
  }
}