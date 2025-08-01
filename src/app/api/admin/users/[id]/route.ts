import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { UserRole } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        club: {
          select: {
            id: true,
            name: true
          }
        },
        adminOfClubs: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        password: undefined // Don't send password hash
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: userId } = await params
    const body = await request.json()
    const { 
      name, 
      email, 
      username, 
      role, 
      accountStatus, 
      clubId, 
      adminOfClubIds 
    } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role;
    if (accountStatus !== undefined) updateData.accountStatus = accountStatus;
    if (clubId !== undefined) updateData.clubId = clubId;

    // Handle admin club assignments
    if (adminOfClubIds !== undefined) {
      updateData.adminOfClubs = {
        set: adminOfClubIds.map((clubId: string) => ({ id: clubId }))
      };
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        club: {
          select: {
            id: true,
            name: true
          }
        },
        adminOfClubs: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      user: {
        ...updatedUser,
        password: undefined // Don't send password hash
      }
    });
  } catch (error: unknown) {
    const err = error as { code?: string; meta?: { target?: string[] } };
    console.error("Error updating user:", error);
    
    // Handle unique constraint violations
    if (err.code === 'P2002') {
      const field = err.meta?.target?.includes('email') ? 'email' : 'username';
      return NextResponse.json(
        { error: `This ${field} is already taken` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id: userId } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent deleting super admin users
    if (user.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Cannot delete super admin users" },
        { status: 403 }
      )
    }

    // Delete related records first to avoid foreign key constraint violations
    await prisma.$transaction(async (tx) => {
      // Delete user preferences if they exist
      await tx.userPreferences.deleteMany({
        where: { userId: userId }
      });

      // Delete club admin requests
      await tx.clubAdminRequest.deleteMany({
        where: { userId: userId }
      });

      // Delete password reset tokens
      await tx.passwordResetToken.deleteMany({
        where: { userId: userId }
      });

      // Delete OAuth accounts
      await tx.account.deleteMany({
        where: { userId: userId }
      });

      // Delete sessions
      await tx.session.deleteMany({
        where: { userId: userId }
      });

      // Note: Interest, SurveyResponse, and ClubInterest models don't have userId fields - they're for anonymous submissions

      await tx.tournamentInterest.deleteMany({
        where: { userId: userId }
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}