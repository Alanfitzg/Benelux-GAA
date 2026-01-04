interface SportsBadgesProps {
  teamTypes: string[];
  size?: "sm" | "md" | "lg";
}

const sportColors: Record<string, { bg: string; text: string }> = {
  Hurling: { bg: "bg-amber-100", text: "text-amber-800" },
  Football: { bg: "bg-green-100", text: "text-green-800" },
  Camogie: { bg: "bg-purple-100", text: "text-purple-800" },
  LGFA: { bg: "bg-pink-100", text: "text-pink-800" },
  Handball: { bg: "bg-blue-100", text: "text-blue-800" },
  Rounders: { bg: "bg-orange-100", text: "text-orange-800" },
  G4MO: { bg: "bg-teal-100", text: "text-teal-800" },
  Youth: { bg: "bg-indigo-100", text: "text-indigo-800" },
};

const defaultColor = { bg: "bg-gray-100", text: "text-gray-800" };

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export default function SportsBadges({
  teamTypes,
  size = "md",
}: SportsBadgesProps) {
  if (!teamTypes || teamTypes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {teamTypes.map((sport) => {
        const colors = sportColors[sport] || defaultColor;
        return (
          <span
            key={sport}
            className={`
              ${colors.bg} ${colors.text}
              ${sizeClasses[size]}
              font-medium rounded-full inline-flex items-center gap-1.5
            `}
          >
            <SportIcon sport={sport} />
            {sport}
          </span>
        );
      })}
    </div>
  );
}

function SportIcon({ sport }: { sport: string }) {
  const iconClass = "w-3.5 h-3.5";

  switch (sport) {
    case "Hurling":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      );
    case "Football":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "Camogie":
    case "LGFA":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
