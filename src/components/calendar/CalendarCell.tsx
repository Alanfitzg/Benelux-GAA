"use client";

import { format, isWeekend, isToday, isPast } from "date-fns";
import { Users, Globe, Flag, Lock } from "lucide-react";
import { CalendarEvent, Holiday, PriorityWeekend, EventSource, FixtureType } from "@prisma/client";
import { CalendarPermissions } from "@/lib/calendar/permissions";

interface CalendarCellProps {
  date: Date;
  events: CalendarEvent[];
  interestCount: number;
  uniqueUsers: number;
  holidays: Holiday[];
  isBlocked: boolean;
  priorityWeekend: PriorityWeekend | null;
  filters: {
    showFixtures: boolean;
    showEvents: boolean;
    showInterest: boolean;
    showHolidays: boolean;
  };
  permissions: CalendarPermissions;
  onClick: () => void;
}

export default function CalendarCell({
  date,
  events,
  interestCount,
  uniqueUsers,
  holidays,
  isBlocked,
  priorityWeekend,
  filters,
  permissions,
  onClick,
}: CalendarCellProps) {
  const isWeekendDay = isWeekend(date);
  const isTodayDate = isToday(date);
  const isPastDate = isPast(date) && !isTodayDate;

  // Calculate interest gradient intensity (0-100%)
  const interestIntensity = Math.min(100, interestCount * 10);
  const shouldShowInterest = filters.showInterest && interestCount > 0 && (permissions.canViewInterestIdentities !== false);

  // Separate fixtures from other events
  const fixtures = events.filter(e => e.eventSource === EventSource.FIXTURE);
  const clubEvents = events.filter(e => e.eventSource !== EventSource.FIXTURE);

  // Determine which crest to show
  const getCrestDisplay = () => {
    const competitiveFixture = fixtures.find(f => f.fixtureType === FixtureType.COMPETITIVE);
    if (competitiveFixture) {
      return { type: "europe", show: filters.showFixtures };
    }

    const invitationalEvent = clubEvents.find(e => e.eventType === "TOURNAMENT");
    if (invitationalEvent) {
      return { type: "club", show: filters.showEvents };
    }

    return null;
  };

  const crestDisplay = getCrestDisplay();

  return (
    <div
      onClick={onClick}
      className={`
        relative h-28 p-2 border rounded-lg cursor-pointer transition-all
        ${isWeekendDay ? "bg-gray-50" : "bg-white"}
        ${isTodayDate ? "ring-2 ring-green-500" : ""}
        ${isBlocked ? "bg-red-50 border-red-300" : "border-gray-200"}
        ${priorityWeekend ? "ring-2 ring-yellow-400" : ""}
        ${isPastDate && !permissions.canEditAllEvents ? "opacity-60 cursor-default" : "hover:shadow-md"}
      `}
      style={{
        background: shouldShowInterest && !isBlocked
          ? `linear-gradient(135deg, rgba(34, 197, 94, ${interestIntensity / 100 * 0.3}) 0%, rgba(34, 197, 94, ${interestIntensity / 100 * 0.1}) 100%)`
          : undefined
      }}
    >
      {/* Date number */}
      <div className="absolute top-1 right-2">
        <span className={`text-sm font-medium ${isTodayDate ? "text-green-600" : "text-gray-700"}`}>
          {format(date, "d")}
        </span>
      </div>

      {/* Blocked indicator */}
      {isBlocked && (
        <div className="absolute top-1 left-1">
          <Lock className="w-3 h-3 text-red-500" />
        </div>
      )}

      {/* Priority weekend flag */}
      {priorityWeekend && (
        <div className="absolute top-1 left-1">
          <Flag className="w-3 h-3 text-yellow-500" />
        </div>
      )}

      {/* Crest display */}
      {crestDisplay?.show && (
        <div className="absolute bottom-2 left-2">
          {crestDisplay.type === "europe" ? (
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">EU</span>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Interest indicator */}
      {shouldShowInterest && permissions.canViewInterestIdentities !== false && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <Users className="w-3 h-3 text-green-600" />
          <span className="text-xs font-medium text-green-700">
            {uniqueUsers}
          </span>
        </div>
      )}

      {/* Event count badges */}
      {filters.showEvents && clubEvents.length > 0 && (
        <div className="absolute top-7 left-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
            {clubEvents.length} event{clubEvents.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Holiday labels */}
      {filters.showHolidays && holidays.length > 0 && (
        <div className="absolute bottom-7 left-2 right-2">
          <div className="text-xs text-gray-600 truncate">
            {holidays[0].name}
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      <div className="hidden group-hover:block absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-2 w-48">
        <div className="space-y-1">
          {fixtures.length > 0 && (
            <div>Fixtures: {fixtures.length}</div>
          )}
          {clubEvents.length > 0 && (
            <div>Events: {clubEvents.length}</div>
          )}
          {interestCount > 0 && (
            <div>Interest: {uniqueUsers} clubs ({interestCount} submissions)</div>
          )}
          {holidays.length > 0 && (
            <div>Holiday: {holidays.map(h => h.name).join(", ")}</div>
          )}
          {isBlocked && (
            <div className="text-red-300">Weekend Blocked</div>
          )}
          {priorityWeekend && (
            <div className="text-yellow-300">Priority: {priorityWeekend.message}</div>
          )}
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}