import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { ClubVerificationStatus } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clubId } = await params;
    const userId = session.user.id;

    // Check if user is admin of this club
    const club = await prisma.club.findFirst({
      where: {
        id: clubId,
        admins: {
          some: {
            id: userId
          }
        }
      }
    });

    if (!club) {
      return NextResponse.json(
        { error: 'You are not authorized to verify this club' },
        { status: 403 }
      );
    }

    // Check verification requirements
    const verificationChecks = {
      hasTeamTypes: club.teamTypes.length > 0,
      hasContactInfo: !!(club.contactEmail && club.contactFirstName && club.contactLastName),
      hasLocation: !!(club.location && club.latitude && club.longitude),
      hasLogo: !!club.imageUrl,
      profileCompleteness: 0
    };

    // Calculate profile completeness (excluding social media)
    const fields = [
      club.name,
      club.location,
      club.teamTypes.length > 0,
      club.contactEmail,
      club.contactFirstName,
      club.contactLastName,
      club.contactPhone,
      club.imageUrl,
      club.codes || club.map
    ];
    
    const completedFields = fields.filter(Boolean).length;
    verificationChecks.profileCompleteness = Math.round((completedFields / fields.length) * 100 * 100) / 100;

    // Check if all requirements are met
    const canVerify = 
      verificationChecks.hasTeamTypes &&
      verificationChecks.hasContactInfo &&
      verificationChecks.hasLocation &&
      verificationChecks.profileCompleteness >= 80;

    if (!canVerify) {
      return NextResponse.json(
        { 
          error: 'Club does not meet verification requirements',
          requirements: verificationChecks
        },
        { status: 400 }
      );
    }

    // Update club verification status
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        verificationStatus: ClubVerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: userId,
        verificationDetails: {
          requirements: verificationChecks,
          verifiedByName: session.user.name || session.user.email,
          timestamp: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      message: 'Club verified successfully',
      club: updatedClub
    });

  } catch (error) {
    console.error('Error verifying club:', error);
    return NextResponse.json(
      { error: 'Failed to verify club' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: clubId } = await params;
    const userId = session.user.id;

    // Check if user is admin of this club
    const club = await prisma.club.findFirst({
      where: {
        id: clubId,
        admins: {
          some: {
            id: userId
          }
        }
      },
      select: {
        id: true,
        name: true,
        teamTypes: true,
        contactEmail: true,
        contactFirstName: true,
        contactLastName: true,
        contactPhone: true,
        location: true,
        latitude: true,
        longitude: true,
        imageUrl: true,
        facebook: true,
        instagram: true,
        website: true,
        codes: true,
        map: true,
        verificationStatus: true,
        verifiedAt: true,
        verificationDetails: true
      }
    });

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found or unauthorized' },
        { status: 404 }
      );
    }

    // Calculate verification requirements
    const verificationChecks = {
      hasTeamTypes: club.teamTypes.length > 0,
      hasContactInfo: !!(club.contactEmail && club.contactFirstName && club.contactLastName),
      hasLocation: !!(club.location && club.latitude && club.longitude),
      hasLogo: !!club.imageUrl,
      profileCompleteness: 0
    };

    // Calculate profile completeness (excluding social media)
    const fields = [
      club.name,
      club.location,
      club.teamTypes.length > 0,
      club.contactEmail,
      club.contactFirstName,
      club.contactLastName,
      club.contactPhone,
      club.imageUrl,
      club.codes || club.map
    ];
    
    const completedFields = fields.filter(Boolean).length;
    verificationChecks.profileCompleteness = Math.round((completedFields / fields.length) * 100 * 100) / 100;

    const canVerify = 
      verificationChecks.hasTeamTypes &&
      verificationChecks.hasContactInfo &&
      verificationChecks.hasLocation &&
      verificationChecks.profileCompleteness >= 80;

    return NextResponse.json({
      club,
      verificationChecks,
      canVerify
    });

  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}