"use client";

import { format, isWeekend, isToday, isPast } from "date-fns";
import { Users, Globe, Flag, Lock } from "lucide-react";
import {
  CalendarEvent,
  Holiday,
  PriorityWeekend,
  EventSource,
  FixtureType,
} from "@prisma/client";
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
    showPublic: boolean;
    showPrivate: boolean;
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
  const shouldShowInterest =
    filters.showInterest &&
    interestCount > 0 &&
    permissions.canViewInterestIdentities !== false;

  // Separate public (fixtures) from private (club) events
  const publicEvents = events.filter(
    (e) => e.eventSource === EventSource.FIXTURE
  );
  const privateEvents = events.filter(
    (e) => e.eventSource !== EventSource.FIXTURE
  );

  // Determine which crest to show - prioritize public events, then private
  const getCrestDisplay = () => {
    // Show public icon if there are any public events and filter is on
    if (publicEvents.length > 0 && filters.showPublic) {
      return { type: "public", show: true };
    }

    // Show private icon if there are any private events and filter is on
    if (privateEvents.length > 0 && filters.showPrivate) {
      return { type: "private", show: true };
    }

    return null;
  };

  const crestDisplay = getCrestDisplay();

  // Count visible events based on filters
  const visiblePublicCount = filters.showPublic ? publicEvents.length : 0;
  const visiblePrivateCount = filters.showPrivate ? privateEvents.length : 0;
  const hasEvents = visiblePublicCount > 0 || visiblePrivateCount > 0;

  // Subtle texture pattern for cells
  const texturePattern = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23264673' fill-opacity='0.02'%3E%3Cpath d='M20 20.5V18H18v2.5h-2.5v2H18V25h2v-2.5h2.5v-2H20zM0 20.5V18h2v2.5h2.5v2H2V25H0v-2.5zM40 20.5V18h-2v2.5h-2.5v2H38V25h2v-2.5zM20 0.5V-2h-2v2.5h-2.5v2H18V5h2V2.5h2.5v-2H20zM20 40.5V38h-2v2.5h-2.5v2H18V45h2v-2.5h2.5v-2H20z'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div
      onClick={onClick}
      className={`
        relative h-20 md:h-24 p-1.5 md:p-2 rounded-lg cursor-pointer transition-all group overflow-hidden
        ${isWeekendDay ? "bg-gray-50" : "bg-white"}
        ${isTodayDate ? "ring-2 ring-primary shadow-md" : ""}
        ${isBlocked ? "bg-red-50" : ""}
        ${priorityWeekend ? "ring-2 ring-yellow-400" : ""}
        ${isPastDate && !permissions.canEditAllEvents ? "opacity-80" : "hover:shadow-lg hover:scale-[1.02]"}
        ${hasEvents ? "shadow-sm" : ""}
      `}
      style={{
        backgroundImage: texturePattern,
        backgroundColor:
          shouldShowInterest && !isBlocked
            ? `rgba(38, 70, 115, ${0.05 + (interestIntensity / 100) * 0.1})`
            : undefined,
      }}
    >
      {/* Date number */}
      <div className="flex justify-end">
        <span
          className={`
            text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full
            ${isTodayDate ? "bg-primary text-white" : "text-gray-700"}
          `}
        >
          {format(date, "d")}
        </span>
      </div>

      {/* Status indicators - top left */}
      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
        {isBlocked && <Lock className="w-3 h-3 text-red-500" />}
        {priorityWeekend && <Flag className="w-3 h-3 text-yellow-500" />}
      </div>

      {/* Content area - centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 px-1">
        {/* Event indicator with title */}
        {crestDisplay?.show && (
          <>
            <div className="flex items-center gap-1 mb-0.5">
              {crestDisplay.type === "public" ? (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm flex-shrink-0">
                  <Globe className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary/80 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            {/* Event title - show first event title */}
            {(visiblePublicCount > 0 || visiblePrivateCount > 0) && (
              <span className="text-[9px] font-medium text-gray-700 text-center line-clamp-2 leading-tight max-w-full">
                {crestDisplay.type === "public" && publicEvents[0]
                  ? publicEvents[0].title
                  : privateEvents[0]?.title || ""}
              </span>
            )}
            {/* Show count if multiple events */}
            {visiblePublicCount + visiblePrivateCount > 1 && (
              <span className="text-[8px] text-gray-500 mt-0.5">
                +{visiblePublicCount + visiblePrivateCount - 1} more
              </span>
            )}
          </>
        )}

        {/* Holiday indicator */}
        {filters.showHolidays && holidays.length > 0 && (
          <div className="text-[10px] text-purple-600 font-medium truncate max-w-full px-1 mt-0.5">
            {holidays[0].name.length > 10
              ? holidays[0].name.slice(0, 10) + "..."
              : holidays[0].name}
          </div>
        )}
      </div>

      {/* Interest indicator - bottom right (admin only) */}
      {shouldShowInterest &&
        permissions.canViewInterestIdentities !== false && (
          <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 bg-primary/10 rounded px-1 py-0.5">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">
              {uniqueUsers}
            </span>
          </div>
        )}

      {/* Hover tooltip */}
      {(visiblePublicCount > 0 ||
        visiblePrivateCount > 0 ||
        holidays.length > 0 ||
        priorityWeekend) && (
        <div className="hidden group-hover:block absolute z-20 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-2.5 min-w-[140px] shadow-lg">
          <div className="space-y-1">
            {visiblePublicCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                <span>{visiblePublicCount} Public</span>
              </div>
            )}
            {visiblePrivateCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>{visiblePrivateCount} Private</span>
              </div>
            )}
            {interestCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                <span>{uniqueUsers} interested</span>
              </div>
            )}
            {holidays.length > 0 && (
              <div className="flex items-center gap-1.5 text-purple-300">
                <div className="w-2 h-2 rounded bg-purple-400"></div>
                <span>{holidays[0].name}</span>
              </div>
            )}
            {priorityWeekend && (
              <div className="flex items-center gap-1.5 text-yellow-300">
                <Flag className="w-3 h-3" />
                <span>Priority</span>
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
