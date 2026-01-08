import Link from "next/link";

interface PreviousEvent {
  id: string;
  title: string;
  startDate: string;
  location: string;
  eventType: string;
  teamsCount?: number;
}

interface ClubPreviousEventsSectionProps {
  events: PreviousEvent[];
  maxDisplay?: number;
}

export default function ClubPreviousEventsSection({
  events,
  maxDisplay = 6,
}: ClubPreviousEventsSectionProps) {
  const now = new Date();
  const pastEvents = events
    .filter((event) => new Date(event.startDate) < now)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

  const displayEvents = pastEvents.slice(0, maxDisplay);

  if (displayEvents.length === 0) {
    return null;
  }
  const hasMore = pastEvents.length > maxDisplay;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "tournament":
        return "bg-blue-100 text-blue-800";
      case "friendly":
        return "bg-green-100 text-green-800";
      case "training":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="space-y-3">
        {displayEvents.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.eventType)}`}
                >
                  {event.eventType}
                </span>
                <span className="px-2 py-1 text-xs font-semibold text-white bg-amber-500 rounded-full">
                  Demo Date
                </span>
                {event.teamsCount !== undefined && event.teamsCount > 0 && (
                  <span className="text-xs text-gray-500">
                    {event.teamsCount} team{event.teamsCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-500">
            +{pastEvents.length - maxDisplay} more past tournaments
          </span>
        </div>
      )}
    </>
  );
}
