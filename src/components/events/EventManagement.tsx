"use client";

import React, { useState } from "react";
import { Event, TournamentTeam } from "@/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface EventManagementProps {
  event: Event;
  teams: TournamentTeam[];
  isClubAdmin: boolean;
}

export default function EventManagement({
  event,
  teams,
  isClubAdmin,
}: EventManagementProps) {
  const [isGeneratingBracket, setIsGeneratingBracket] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const router = useRouter();

  if (!isClubAdmin) {
    return null;
  }

  const handleGenerateBracket = async () => {
    if (teams.length < 2) {
      toast.error("Need at least 2 teams to generate a bracket");
      return;
    }

    if (event.bracketType && !confirm("This will regenerate the bracket. Existing bracket data will be lost. Continue?")) {
      return;
    }

    setIsGeneratingBracket(true);
    try {
      const response = await fetch(`/api/tournaments/${event.id}/bracket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bracketType: "SINGLE_ELIMINATION",
        }),
      });

      if (response.ok) {
        toast.success("Bracket generated successfully!", {
          icon: "🏆",
          duration: 4000,
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(`Failed to generate bracket: ${error.error}`);
      }
    } catch (error) {
      console.error("Error generating bracket:", error);
      toast.error("Failed to generate bracket");
    } finally {
      setIsGeneratingBracket(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (newStatus === "CLOSED" && !event.report) {
      toast.error("Cannot close event without a report. Please create an event report first.");
      return;
    }

    if (!confirm(`Are you sure you want to change the event status to ${newStatus}?`)) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/events/${event.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Event status updated to ${newStatus}`, {
          icon: newStatus === "ACTIVE" ? "🚀" : newStatus === "CLOSED" ? "🏁" : "📋",
          duration: 4000,
        });
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(`Failed to update status: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update event status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-100 text-blue-800";
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Event Management
      </h3>

      <div className="space-y-4">
        {/* Event Status */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(event.status)}`}>
              {event.status || "UPCOMING"}
            </span>
          </div>
          
          <div className="flex gap-2">
            {event.status !== "ACTIVE" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("ACTIVE")}
                disabled={isUpdatingStatus}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Start Event
              </button>
            )}
            {event.status === "ACTIVE" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("CLOSED")}
                disabled={isUpdatingStatus || !event.report}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Close Event
              </button>
            )}
          </div>
        </div>

        {/* Tournament Bracket Generation */}
        {event.eventType === "Tournament" && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tournament Bracket</p>
                <p className="text-xs text-gray-600">
                  {event.bracketType 
                    ? `${event.bracketType.replace(/_/g, " ")} bracket generated`
                    : "No bracket generated yet"}
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleGenerateBracket}
                disabled={isGeneratingBracket || teams.length < 2}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {isGeneratingBracket ? "Generating..." : event.bracketType ? "Regenerate Bracket" : "Generate Bracket"}
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push(`/admin/events/${event.id}/edit`)}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Edit Event
            </button>
            {!event.report && (
              <button
                type="button"
                onClick={() => router.push(`/events/${event.id}/report`)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Create Report
              </button>
            )}
            {event.eventType === "Tournament" && (
              <button
                type="button"
                onClick={() => router.push(`/api/tournaments/${event.id}/matches`)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Manage Matches
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}