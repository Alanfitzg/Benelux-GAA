import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApprovedSuperAdmin } from '@/lib/auth-helpers';
import { withErrorHandler } from '@/lib/error-handlers';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';

const ReviewRequestSchema = z.object({
  requestId: z.string().cuid('Invalid request ID'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

async function clubAdminRequestsHandler(request: NextRequest) {
  const session = await requireApprovedSuperAdmin();
  
  if (session instanceof NextResponse) {
    return session;
  }

  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const clubId = searchParams.get('clubId');
    
    const where: { status?: 'PENDING' | 'APPROVED' | 'REJECTED'; clubId?: string } = {};
    if (status && status !== 'ALL') {
      where.status = status as 'PENDING' | 'APPROVED' | 'REJECTED';
    }
    if (clubId) {
      where.clubId = clubId;
    }

    const requests = await prisma.clubAdminRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            createdAt: true
          }
        },
        club: {
          select: {
            id: true,
            name: true,
            location: true,
            imageUrl: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      requests
    });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const { requestId, action, rejectionReason } = ReviewRequestSchema.parse(body);

    // Get the request
    const adminRequest = await prisma.clubAdminRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        },
        club: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      }
    });

    if (!adminRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (adminRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request has already been reviewed' }, { status: 400 });
    }

    // Update the request
    const updatedRequest = await prisma.clubAdminRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        rejectionReason: action === 'reject' ? rejectionReason : null
      }
    });

    // If approved, add user as club admin
    if (action === 'approve') {
      await prisma.club.update({
        where: { id: adminRequest.clubId },
        data: {
          admins: {
            connect: { id: adminRequest.userId }
          }
        }
      });

      // Update user role to CLUB_ADMIN if they're currently just USER
      const user = await prisma.user.findUnique({
        where: { id: adminRequest.userId },
        select: { role: true }
      });

      if (user?.role === 'USER') {
        await prisma.user.update({
          where: { id: adminRequest.userId },
          data: { role: 'CLUB_ADMIN' }
        });
      }
    }

    // Send notification email
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const clubUrl = `${baseUrl}/clubs/${adminRequest.clubId}`;
      
      const subject = action === 'approve' 
        ? `🎉 Club Admin Request Approved - ${adminRequest.club.name}`
        : `📋 Club Admin Request Update - ${adminRequest.club.name}`;

      const html = action === 'approve' 
        ? `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #1e40af;">Great news! Your club admin request has been approved</h2>
            <p>Hello ${adminRequest.user.name || adminRequest.user.username},</p>
            <p>Your request to become an administrator for <strong>${adminRequest.club.name}</strong> has been approved!</p>
            <p>You now have administrative access to manage this club's information, events, and calendar.</p>
            <p><a href="${clubUrl}" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Club Page</a></p>
            <p>Welcome to the club admin team!</p>
          </div>
        `
        : `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #dc2626;">Club Admin Request Update</h2>
            <p>Hello ${adminRequest.user.name || adminRequest.user.username},</p>
            <p>Your request to become an administrator for <strong>${adminRequest.club.name}</strong> has been reviewed.</p>
            <p>Unfortunately, your request was not approved at this time.</p>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
            <p>You can submit a new request in the future if your circumstances change.</p>
            <p><a href="${clubUrl}" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Club Page</a></p>
          </div>
        `;

      await sendEmail({
        to: adminRequest.user.email,
        subject,
        html,
        text: action === 'approve' 
          ? `Your club admin request for ${adminRequest.club.name} has been approved! You now have administrative access.`
          : `Your club admin request for ${adminRequest.club.name} was not approved. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`
      });
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      request: updatedRequest
    });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withErrorHandler(clubAdminRequestsHandler);
export const POST = withErrorHandler(clubAdminRequestsHandler);