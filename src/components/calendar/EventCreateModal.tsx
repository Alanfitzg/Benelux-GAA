"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { CalendarEventType, EventSource, FixtureType } from "@prisma/client";
import { format } from "date-fns";

interface EventCreateModalProps {
  clubId: string;
  selectedDate: Date | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventCreateModal({ clubId, selectedDate, onClose, onSuccess }: EventCreateModalProps) {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    eventType: CalendarEventType;
    eventSource: EventSource;
    fixtureType: FixtureType | null;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    location: string;
    notes: string;
  }>({
    title: "",
    description: "",
    eventType: CalendarEventType.TOURNAMENT,
    eventSource: EventSource.CLUB,
    fixtureType: null,
    startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conflictWarning, setConflictWarning] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          clubId,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event");
      }

      if (data.conflictWarning) {
        setConflictWarning(data.conflictWarning);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create Calendar Event</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
              {error}
            </div>
          )}

          {conflictWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Conflict Detected</p>
                <p className="text-sm mt-1">{conflictWarning}</p>
                <p className="text-sm mt-2">
                  The event has been created, but superadmins have been notified of the conflict.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type *
            </label>
            <select
              required
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value as CalendarEventType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={CalendarEventType.FIXTURE}>Fixture</option>
              <option value={CalendarEventType.TOURNAMENT}>Tournament</option>
              <option value={CalendarEventType.TRAINING}>Training</option>
              <option value={CalendarEventType.SOCIAL}>Social</option>
            </select>
          </div>

          {formData.eventType === CalendarEventType.FIXTURE && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixture Type
              </label>
              <select
                value={formData.fixtureType || ""}
                onChange={(e) => setFormData({ ...formData, fixtureType: e.target.value as FixtureType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select type...</option>
                <option value={FixtureType.COMPETITIVE}>Competitive (Europe GAA)</option>
                <option value={FixtureType.INVITATIONAL}>Invitational</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Internal notes (not visible to users)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}