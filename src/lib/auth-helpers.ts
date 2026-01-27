import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { UserRole, AccountStatus } from "@prisma/client";
import { getUserByUsername } from "@/lib/user";

export async function getServerSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return session;
}

export async function requireSuperAdmin() {
  return requireRole([UserRole.SUPER_ADMIN]);
}

export async function requireGuestAdmin() {
  return requireRole([UserRole.SUPER_ADMIN, UserRole.GUEST_ADMIN]);
}

export async function requireAnyAdmin() {
  return requireRole([
    UserRole.SUPER_ADMIN,
    UserRole.CLUB_ADMIN,
    UserRole.GUEST_ADMIN,
    UserRole.YOUTH_OFFICER,
  ]);
}

export async function requireYouthOfficer() {
  return requireRole([UserRole.SUPER_ADMIN, UserRole.YOUTH_OFFICER]);
}

export async function requireClubAdmin() {
  return requireRole([UserRole.SUPER_ADMIN, UserRole.CLUB_ADMIN]);
}

export async function requireApprovedUser() {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Get full user data to check account status
  const user = await getUserByUsername(session.user.username);

  if (!user || user.accountStatus !== AccountStatus.APPROVED) {
    const statusMessage =
      user?.accountStatus === AccountStatus.PENDING
        ? "Account pending approval"
        : user?.accountStatus === AccountStatus.REJECTED
          ? "Account has been rejected"
          : user?.accountStatus === AccountStatus.SUSPENDED
            ? "Account has been suspended"
            : "Account not approved";

    return NextResponse.json(
      {
        error: statusMessage,
        accountStatus: user?.accountStatus,
        rejectionReason: user?.rejectionReason,
      },
      { status: 403 }
    );
  }

  return session;
}

export async function requireApprovedRole(allowedRoles: UserRole[]) {
  const approvalResult = await requireApprovedUser();

  if (approvalResult instanceof NextResponse) {
    return approvalResult;
  }

  if (!allowedRoles.includes(approvalResult.user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return approvalResult;
}

export async function requireApprovedSuperAdmin() {
  return requireApprovedRole([UserRole.SUPER_ADMIN]);
}

export async function requireApprovedGuestAdmin() {
  return requireApprovedRole([UserRole.SUPER_ADMIN, UserRole.GUEST_ADMIN]);
}

export async function requireApprovedAnyAdmin() {
  return requireApprovedRole([
    UserRole.SUPER_ADMIN,
    UserRole.CLUB_ADMIN,
    UserRole.GUEST_ADMIN,
    UserRole.YOUTH_OFFICER,
  ]);
}

export async function requireApprovedYouthOfficer() {
  return requireApprovedRole([UserRole.SUPER_ADMIN, UserRole.YOUTH_OFFICER]);
}

export async function requireApprovedClubAdmin() {
  return requireApprovedRole([UserRole.SUPER_ADMIN, UserRole.CLUB_ADMIN]);
}
