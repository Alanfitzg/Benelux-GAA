import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: {
        club: {
          include: {
            admins: true,
          },
        },
      },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    const isSuperAdmin = session.user.role === 'SUPER_ADMIN';
    const isClubAdmin = testimonial.club.admins.some(
      admin => admin.id === session.user.id
    );

    if (!isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to reject this testimonial' },
        { status: 403 }
      );
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        status: 'REJECTED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTestimonial);
  } catch (error) {
    console.error('Error rejecting testimonial:', error);
    return NextResponse.json(
      { error: 'Failed to reject testimonial' },
      { status: 500 }
    );
  }
}