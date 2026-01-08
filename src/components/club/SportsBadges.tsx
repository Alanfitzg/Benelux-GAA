interface SportsBadgesProps {
  teamTypes: string[];
  size?: "sm" | "md" | "lg";
}

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
        const colors = defaultColor;
        return (
          <span
            key={sport}
            className={`
              ${colors.bg} ${colors.text}
              ${sizeClasses[size]}
              font-medium rounded-full inline-flex items-center gap-1.5
            `}
          >
            <SportIcon />
            {sport}
          </span>
        );
      })}
    </div>
  );
}

function SportIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}
