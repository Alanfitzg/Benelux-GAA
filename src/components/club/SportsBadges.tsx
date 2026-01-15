interface SportsBadgesProps {
  teamTypes: string[];
  size?: "sm" | "md" | "lg";
}

const sportDisplayNames: Record<string, string> = {
  "Mens Gaelic Football": "GAA",
};

const getDisplayName = (sport: string): string => {
  return sportDisplayNames[sport] || sport;
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2 py-0.5 text-xs gap-1 sm:px-2.5 sm:py-1 sm:text-xs sm:gap-1.5",
  lg: "px-3 py-1 text-sm gap-1.5",
};

const iconSizes = {
  sm: "w-2.5 h-2.5",
  md: "w-2.5 h-2.5 sm:w-3 sm:h-3",
  lg: "w-3.5 h-3.5",
};

export default function SportsBadges({
  teamTypes,
  size = "md",
}: SportsBadgesProps) {
  if (!teamTypes || teamTypes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
      {teamTypes.map((sport) => (
        <span
          key={sport}
          className={`
            bg-gray-100 text-gray-700 border border-gray-200
            ${sizeClasses[size]}
            font-medium rounded-full inline-flex items-center
          `}
        >
          <SportIcon size={size} />
          {getDisplayName(sport)}
        </span>
      ))}
    </div>
  );
}

function SportIcon({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <svg className={iconSizes[size]} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

export function SportsBadgesHeader({ teamTypes }: { teamTypes: string[] }) {
  if (!teamTypes || teamTypes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {teamTypes.map((sport) => (
        <span
          key={sport}
          className="bg-white/15 text-white/90 border border-white/20 px-2 py-0.5 text-[11px] sm:text-xs font-medium rounded-full inline-flex items-center gap-1"
        >
          <svg
            className="w-2 h-2 sm:w-2.5 sm:h-2.5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="8" />
          </svg>
          {getDisplayName(sport)}
        </span>
      ))}
    </div>
  );
}
