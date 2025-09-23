import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin, getServerSession } from '@/lib/auth-helpers';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  // Check if user is super admin
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, rejectionReason, adminNotes, editedData } = await req.json();
    const clubId = params.id;

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      status: 'APPROVED' | 'REJECTED';
      reviewedAt: Date;
      reviewedBy: string;
      rejectionReason: string | null;
      adminNotes: string | null;
      name?: string;
      location?: string;
      internationalUnitText?: string | null;
      region?: string | null;
      subRegion?: string | null;
      contactFirstName?: string | null;
      contactLastName?: string | null;
      contactEmail?: string | null;
      contactPhone?: string | null;
      facebook?: string | null;
      instagram?: string | null;
      website?: string | null;
      teamTypes?: string[];
    } = {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      rejectionReason: action === 'reject' ? rejectionReason : null,
      adminNotes: adminNotes || null
    };

    // If there's edited data, include it in the update
    if (editedData && action === 'approve') {
      // Validate and clean the edited data
      if (editedData.name && typeof editedData.name === 'string') {
        updateData.name = editedData.name.trim();
      }
      if (editedData.location && typeof editedData.location === 'string') {
        updateData.location = editedData.location.trim();
      }
      if (editedData.internationalUnitText !== undefined) {
        updateData.internationalUnitText = editedData.internationalUnitText ? editedData.internationalUnitText.trim() : null;
      }
      if (editedData.region !== undefined) {
        updateData.region = editedData.region ? editedData.region.trim() : null;
      }
      if (editedData.subRegion !== undefined) {
        updateData.subRegion = editedData.subRegion ? editedData.subRegion.trim() : null;
      }
      if (editedData.contactFirstName !== undefined) {
        updateData.contactFirstName = editedData.contactFirstName ? editedData.contactFirstName.trim() : null;
      }
      if (editedData.contactLastName !== undefined) {
        updateData.contactLastName = editedData.contactLastName ? editedData.contactLastName.trim() : null;
      }
      if (editedData.contactEmail !== undefined) {
        updateData.contactEmail = editedData.contactEmail ? editedData.contactEmail.trim() : null;
      }
      if (editedData.contactPhone !== undefined) {
        updateData.contactPhone = editedData.contactPhone ? editedData.contactPhone.trim() : null;
      }
      if (editedData.facebook !== undefined) {
        updateData.facebook = editedData.facebook ? editedData.facebook.trim() : null;
      }
      if (editedData.instagram !== undefined) {
        updateData.instagram = editedData.instagram ? editedData.instagram.trim() : null;
      }
      if (editedData.website !== undefined) {
        updateData.website = editedData.website ? editedData.website.trim() : null;
      }
      if (editedData.teamTypes && Array.isArray(editedData.teamTypes)) {
        updateData.teamTypes = editedData.teamTypes.filter((type: unknown): type is string => {
          return type != null && typeof type === 'string';
        }).map((type: string) => type.trim());
      }
    }

    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      club: updatedClub,
      message: editedData && action === 'approve' ? 'Club updated and approved successfully' : 'Club status updated successfully'
    });
  } catch (error) {
    console.error('Error updating club status:', error);
    return NextResponse.json(
      { error: 'Failed to update club status' },
      { status: 500 }
    );
  }
}