import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { UserRole, AccountStatus } from "@prisma/client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists and get their role
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting SUPER_ADMIN users for safety
    if (userToDelete.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Cannot delete super admin users" },
        { status: 403 }
      );
    }

    // Remove user from any club admin roles before deletion
    await prisma.user.update({
      where: { id },
      data: {
        adminOfClubs: {
          set: [], // This disconnects from all clubs
        },
      },
    });

    // Delete related records that don't have cascade delete
    await prisma.clubAdminRequest.deleteMany({ where: { userId: id } });
    await prisma.clubAdminRequest.updateMany({
      where: { reviewedBy: id },
      data: { reviewedBy: null },
    });
    await prisma.pitchRequest.deleteMany({ where: { userId: id } });
    await prisma.tournamentInterest.deleteMany({ where: { userId: id } });
    await prisma.testimonial.deleteMany({ where: { userId: id } });

    // Update testimonials that reference this user as approver (set to null)
    await prisma.testimonial.updateMany({
      where: { superAdminApprovedBy: id },
      data: { superAdminApprovedBy: null },
    });
    await prisma.testimonial.updateMany({
      where: { clubAdminApprovedBy: id },
      data: { clubAdminApprovedBy: null },
    });

    // Delete event reports created by this user
    await prisma.eventReport.deleteMany({ where: { createdBy: id } });

    // Delete pitch locations created by this user
    await prisma.pitchLocation.deleteMany({ where: { createdBy: id } });

    // Update clubs where this user is submitter/reviewer/verifier
    await prisma.club.updateMany({
      where: { submittedBy: id },
      data: { submittedBy: null },
    });
    await prisma.club.updateMany({
      where: { reviewedBy: id },
      data: { reviewedBy: null },
    });
    await prisma.club.updateMany({
      where: { verifiedBy: id },
      data: { verifiedBy: null },
    });

    // Delete user preferences
    await prisma.userPreferences.deleteMany({ where: { userId: id } });

    // Delete the user (sessions, accounts, password tokens will cascade)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      email,
      username,
      name,
      role,
      accountStatus,
      clubId,
      adminOfClubIds,
      newPassword,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for email/username conflicts with other users
    if (email !== existingUser.email || username !== existingUser.username) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [{ email: email }, { username: username }],
            },
          ],
        },
      });

      if (conflictUser) {
        return NextResponse.json(
          { error: "Email or username already exists" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: {
      email: string;
      username: string;
      name: string | null;
      role: UserRole;
      accountStatus: AccountStatus;
      clubId: string | null;
      password?: string;
    } = {
      email,
      username,
      name: name || null,
      role: role as UserRole,
      accountStatus: accountStatus as AccountStatus,
      clubId: clubId || null,
    };

    // Hash new password if provided
    if (newPassword) {
      updateData.password = await hash(newPassword, 12);
    }

    // Update the user
    const updatedUserRaw = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        clubId: true,
        password: true,
        club: {
          select: {
            id: true,
            name: true,
          },
        },
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    // Handle club admin assignments
    if (role === "CLUB_ADMIN" && Array.isArray(adminOfClubIds)) {
      // Remove from all clubs first
      await prisma.user.update({
        where: { id },
        data: {
          adminOfClubs: {
            set: [], // This disconnects from all clubs
          },
        },
      });

      // Assign to selected clubs
      if (adminOfClubIds.length > 0) {
        await prisma.user.update({
          where: { id },
          data: {
            adminOfClubs: {
              connect: adminOfClubIds.map((clubId) => ({ id: clubId })),
            },
          },
        });
      }
    } else if (role !== "CLUB_ADMIN") {
      // Remove from all clubs if not a club admin
      await prisma.user.update({
        where: { id },
        data: {
          adminOfClubs: {
            set: [], // This disconnects from all clubs
          },
        },
      });

      // Also delete any approved ClubAdminRequest records since user is no longer an admin
      await prisma.clubAdminRequest.deleteMany({
        where: {
          userId: id,
          status: "APPROVED",
        },
      });
    }

    // Get admin clubs for the updated user
    const adminOfClubsResult = await prisma.club.findMany({
      where: {
        admins: {
          some: { id },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const updatedUser = {
      id: updatedUserRaw.id,
      email: updatedUserRaw.email,
      username: updatedUserRaw.username,
      name: updatedUserRaw.name,
      role: updatedUserRaw.role,
      accountStatus: updatedUserRaw.accountStatus,
      createdAt: updatedUserRaw.createdAt,
      clubId: updatedUserRaw.clubId,
      hasPassword: !!updatedUserRaw.password,
      club: updatedUserRaw.club,
      adminOfClubs: adminOfClubsResult,
      accounts: updatedUserRaw.accounts,
    };

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update user";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
