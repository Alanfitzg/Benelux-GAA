import SportsBadges from "./SportsBadges";
import ClubAvailabilityBadge from "./ClubAvailabilityBadge";

interface ClubAboutSectionProps {
  clubId: string;
  clubName: string;
  bio?: string | null;
  foundedYear?: number | null;
  teamTypes: string[];
  isOpenToVisitors?: boolean;
  preferredWeekends?: string[] | null;
}

export default function ClubAboutSection({
  clubId,
  clubName,
  bio,
  foundedYear,
  teamTypes,
  isOpenToVisitors = true,
  preferredWeekends,
}: ClubAboutSectionProps) {
  const currentYear = new Date().getFullYear();
  const yearsActive = foundedYear ? currentYear - foundedYear : null;

  return (
    <section id="about" className="scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              About {clubName}
            </h2>

            {foundedYear && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Founded in <strong>{foundedYear}</strong>
                  {yearsActive && yearsActive > 0 && (
                    <span className="text-gray-500">
                      {" "}
                      ({yearsActive} years)
                    </span>
                  )}
                </span>
              </div>
            )}

            {bio ? (
              <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
                {bio}
              </p>
            ) : (
              <p className="text-gray-500 italic mb-6">
                No club description available yet.
              </p>
            )}

            {teamTypes && teamTypes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Sports Played
                </h3>
                <SportsBadges teamTypes={teamTypes} size="md" />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <ClubAvailabilityBadge
            clubId={clubId}
            clubName={clubName}
            isOpenToVisitors={isOpenToVisitors}
            preferredWeekends={preferredWeekends}
          />
        </div>
      </div>
    </section>
  );
}
