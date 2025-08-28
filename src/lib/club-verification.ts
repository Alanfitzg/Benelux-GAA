import { Club } from '@prisma/client';

export interface VerificationRequirements {
  hasTeamTypes: boolean;
  hasContactInfo: boolean;
  hasLocation: boolean;
  hasLogo: boolean;
  profileCompleteness: number;
}

export function checkVerificationRequirements(club: Partial<Club>): VerificationRequirements {
  const requirements: VerificationRequirements = {
    hasTeamTypes: (club.teamTypes?.length ?? 0) > 0,
    hasContactInfo: !!(club.contactEmail && club.contactFirstName && club.contactLastName),
    hasLocation: !!(club.location && club.latitude && club.longitude),
    hasLogo: !!club.imageUrl,
    profileCompleteness: 0
  };

  // Calculate profile completeness (excluding social media)
  const fields = [
    club.name,
    club.location,
    requirements.hasTeamTypes,
    club.contactEmail,
    club.contactFirstName,
    club.contactLastName,
    club.contactPhone,
    club.imageUrl,
    club.codes || club.map
  ];
  
  const completedFields = fields.filter(Boolean).length;
  requirements.profileCompleteness = Math.round((completedFields / fields.length) * 100 * 100) / 100;

  return requirements;
}

export function canVerifyClub(requirements: VerificationRequirements): boolean {
  return (
    requirements.hasTeamTypes &&
    requirements.hasContactInfo &&
    requirements.hasLogo
  );
}

export function getVerificationStatusDisplay(status: string): {
  label: string;
  color: string;
  icon: string;
} {
  switch (status) {
    case 'VERIFIED':
      return {
        label: 'Verified',
        color: 'text-green-600 bg-green-50',
        icon: '✓'
      };
    case 'PENDING_VERIFICATION':
      return {
        label: 'Pending Verification',
        color: 'text-yellow-600 bg-yellow-50',
        icon: '⏳'
      };
    case 'UNVERIFIED':
      return {
        label: 'Not Verified',
        color: 'text-gray-600 bg-gray-50',
        icon: '○'
      };
    case 'EXPIRED':
      return {
        label: 'Verification Expired',
        color: 'text-red-600 bg-red-50',
        icon: '⚠'
      };
    case 'DISPUTED':
      return {
        label: 'Disputed',
        color: 'text-orange-600 bg-orange-50',
        icon: '!'
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600 bg-gray-50',
        icon: '?'
      };
  }
}