import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reorderSchema = z.object({
  clubId: z.string(),
  testimonialIds: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clubId, testimonialIds } = reorderSchema.parse(body);

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        admins: true,
      },
    });

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    const isSuperAdmin = session.user.role === 'SUPER_ADMIN';
    const isClubAdmin = club.admins.some(admin => admin.id === session.user.id);

    if (!isSuperAdmin && !isClubAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to reorder testimonials for this club' },
        { status: 403 }
      );
    }

    const existingTestimonials = await prisma.testimonial.findMany({
      where: {
        clubId,
        id: { in: testimonialIds },
        status: 'APPROVED',
      },
      select: { id: true },
    });

    if (existingTestimonials.length !== testimonialIds.length) {
      return NextResponse.json(
        { error: 'Some testimonials were not found or are not approved' },
        { status: 400 }
      );
    }

    const updatePromises = testimonialIds.map((id, index) =>
      prisma.testimonial.update({
        where: { id },
        data: { displayOrder: index },
      })
    );

    await prisma.$transaction(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error reordering testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to reorder testimonials' },
      { status: 500 }
    );
  }
}