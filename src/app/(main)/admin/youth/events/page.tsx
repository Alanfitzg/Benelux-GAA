"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

interface YouthEvent {
  id: string;
  title: string;
  sport: string;
  location: string;
  description: string;
  date: string;
  month: string;
  year: number;
  duration: string;
  imageUrl: string;
  region?: string;
  status: "draft" | "published" | "cancelled";
}

export default function YouthEventsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<YouthEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<YouthEvent | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "published" | "draft" | "cancelled"
  >("all");

  useEffect(() => {
    if (status === "loading") return;
    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" &&
        session.user.role !== "YOUTH_OFFICER")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      handleAddNew();
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "YOUTH_OFFICER")
  ) {
    return null;
  }

  const handleEdit = (event: YouthEvent) => {
    setEditingEvent({ ...event });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingEvent({
      id: `new-${Date.now()}`,
      title: "",
      sport: "FOOTBALL",
      location: "",
      description: "",
      date: "",
      month: "March",
      year: 2026,
      duration: "5 hours",
      imageUrl: "",
      status: "draft",
    });
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (!editingEvent) return;
    if (isAddingNew) {
      setEvents([...events, editingEvent]);
    } else {
      setEvents(
        events.map((e) => (e.id === editingEvent.id ? editingEvent : e))
      );
    }
    setEditingEvent(null);
    setIsAddingNew(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingEvent(null);
    setIsAddingNew(false);
  };

  const filteredEvents = events.filter(
    (e) => filter === "all" || e.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-300";
      case "draft":
        return "bg-amber-500/20 text-amber-300";
      case "cancelled":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/youth"
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Manage Events
                </h1>
                <p className="text-white/70 text-sm">
                  Create, edit, and manage youth events
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Event
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-6">
            {(["all", "published", "draft", "cancelled"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {f} (
                {f === "all"
                  ? events.length
                  : events.filter((e) => e.status === f).length}
                )
              </button>
            ))}
          </div>
        </div>

        {/* Edit Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  {isAddingNew ? "Add New Event" : "Edit Event"}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Sport
                    </label>
                    <select
                      value={editingEvent.sport}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          sport: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="FOOTBALL">Football</option>
                      <option value="HURLING">Hurling</option>
                      <option value="CAMOGIE">Camogie</option>
                      <option value="HANDBALL">Handball</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Status
                    </label>
                    <select
                      value={editingEvent.status}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          status: e.target.value as YouthEvent["status"],
                        })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingEvent.description}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      value={editingEvent.date}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          date: e.target.value,
                        })
                      }
                      placeholder="e.g., March 14th"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Month
                    </label>
                    <select
                      value={editingEvent.month}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          month: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    >
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Duration
                    </label>
                    <select
                      value={editingEvent.duration}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          duration: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="5 hours">5 hours</option>
                      <option value="24 hours">24 hours</option>
                      <option value="48 hours">48 hours</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Region (optional)
                  </label>
                  <input
                    type="text"
                    value={editingEvent.region || ""}
                    onChange={(e) =>
                      setEditingEvent({
                        ...editingEvent,
                        region: e.target.value || undefined,
                      })
                    }
                    placeholder="e.g., North/West"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {events.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Youth Events Yet
            </h3>
            <p className="text-white/60 mb-6">
              Create your first youth event to get started.
            </p>
            <button
              type="button"
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add First Event
            </button>
          </div>
        )}

        {/* Events Table */}
        {filteredEvents.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                            {event.imageUrl &&
                            (event.imageUrl.startsWith("/") ||
                              event.imageUrl.startsWith("http")) ? (
                              <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                                IMG
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {event.title}
                            </div>
                            <div className="text-sm text-white/50">
                              {event.sport}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/60">
                        {event.location}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/60">
                        {event.date}, {event.year}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(event.status)}`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(event)}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
