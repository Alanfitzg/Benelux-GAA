import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkMainlandEuropeAccess } from "./geo-restrictions";

export interface CalendarPermissions {
  canViewCalendar: boolean;
  canCreateEvents: boolean;
  canEditAllEvents: boolean;
  canBlockWeekends: boolean;
  canFlagPriorityWeekends: boolean;
  canViewInterestIdentities: boolean;
  canSubmitInterest: boolean;
  canViewAllCalendars: boolean;
  canManageHolidays: boolean;
  canAccessDigest: boolean;
}

export async function getCalendarPermissions(
  userId: string | null,
  clubId: string | null
): Promise<CalendarPermissions> {
  if (!userId) {
    return {
      canViewCalendar: false,
      canCreateEvents: false,
      canEditAllEvents: false,
      canBlockWeekends: false,
      canFlagPriorityWeekends: false,
      canViewInterestIdentities: false,
      canSubmitInterest: false,
      canViewAllCalendars: false,
      canManageHolidays: false,
      canAccessDigest: false,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      clubId: true,
      adminOfClubs: {
        select: { id: true }
      }
    },
  });

  if (!user) {
    return getDefaultPermissions();
  }

  // Super admin has all permissions
  if (user.role === UserRole.SUPER_ADMIN) {
    return {
      canViewCalendar: true,
      canCreateEvents: true,
      canEditAllEvents: true,
      canBlockWeekends: true,
      canFlagPriorityWeekends: true,
      canViewInterestIdentities: true,
      canSubmitInterest: true,
      canViewAllCalendars: true,
      canManageHolidays: true,
      canAccessDigest: true,
    };
  }

  // Check if user is admin of the specific club
  const isClubAdmin = user.role === UserRole.CLUB_ADMIN &&
    (user.clubId === clubId ||
     user.adminOfClubs.some(club => club.id === clubId));

  // Check if club is in mainland Europe
  const hasGeoAccess = clubId ? await checkMainlandEuropeAccess(clubId) : false;

  if (isClubAdmin && hasGeoAccess) {
    return {
      canViewCalendar: true,
      canCreateEvents: true,
      canEditAllEvents: false,
      canBlockWeekends: true,
      canFlagPriorityWeekends: false,
      canViewInterestIdentities: false, // Anonymous for club admins
      canSubmitInterest: true,
      canViewAllCalendars: false,
      canManageHolidays: false,
      canAccessDigest: false,
    };
  }

  // Regular registered user
  return {
    canViewCalendar: hasGeoAccess,
    canCreateEvents: false,
    canEditAllEvents: false,
    canBlockWeekends: false,
    canFlagPriorityWeekends: false,
    canViewInterestIdentities: false,
    canSubmitInterest: true,
    canViewAllCalendars: false,
    canManageHolidays: false,
    canAccessDigest: false,
  };
}

function getDefaultPermissions(): CalendarPermissions {
  return {
    canViewCalendar: false,
    canCreateEvents: false,
    canEditAllEvents: false,
    canBlockWeekends: false,
    canFlagPriorityWeekends: false,
    canViewInterestIdentities: false,
    canSubmitInterest: false,
    canViewAllCalendars: false,
    canManageHolidays: false,
    canAccessDigest: false,
  };
}

export async function enforceCalendarAccess(
  userId: string | null,
  clubId: string,
  requiredPermission: keyof CalendarPermissions
): Promise<void> {
  const permissions = await getCalendarPermissions(userId, clubId);

  if (!permissions[requiredPermission]) {
    throw new Error(`Access denied: Missing permission ${requiredPermission}`);
  }
}