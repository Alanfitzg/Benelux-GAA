import ClubAvailabilityBadge from "./ClubAvailabilityBadge";

interface ClubAboutSectionProps {
  clubId: string;
  clubName: string;
  isOpenToVisitors?: boolean;
  preferredWeekends?: string[] | null;
  isMainlandEurope?: boolean;
}

export default function ClubAboutSection({
  clubId,
  clubName,
  isOpenToVisitors = true,
  preferredWeekends,
  isMainlandEurope = false,
}: ClubAboutSectionProps) {
  if (!isMainlandEurope) {
    return null;
  }

  return (
    <ClubAvailabilityBadge
      clubId={clubId}
      clubName={clubName}
      isOpenToVisitors={isOpenToVisitors}
      preferredWeekends={preferredWeekends}
    />
  );
}
