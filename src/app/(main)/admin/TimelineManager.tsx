"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Calendar,
  Landmark,
} from "lucide-react";

interface TimelineEvent {
  year: number;
  month?: string;
  title: string;
  description: string;
  category:
    | "founding"
    | "championship"
    | "milestone"
    | "award"
    | "international"
    | "sponsorship";
  sourceUrl?: string;
  sourceName?: string;
  clubCrests?: string[];
  imageUrl?: string;
  featured?: boolean;
}

interface TimelineManagerProps {
  events: TimelineEvent[];
  onSave: (events: TimelineEvent[]) => Promise<void>;
}

const categoryOptions: TimelineEvent["category"][] = [
  "founding",
  "championship",
  "milestone",
  "award",
  "international",
  "sponsorship",
];

const categoryBadgeColors: Record<TimelineEvent["category"], string> = {
  founding: "bg-blue-100 text-blue-700",
  championship: "bg-yellow-100 text-yellow-700",
  milestone: "bg-teal-100 text-teal-700",
  award: "bg-purple-100 text-purple-700",
  international: "bg-green-100 text-green-700",
  sponsorship: "bg-orange-100 text-orange-700",
};

const emptyEvent: TimelineEvent = {
  year: new Date().getFullYear(),
  month: "",
  title: "",
  description: "",
  category: "milestone",
  sourceUrl: "",
  sourceName: "",
  clubCrests: [],
  imageUrl: "",
  featured: false,
};

export default function TimelineManager({
  events: initialEvents,
  onSave,
}: TimelineManagerProps) {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TimelineEvent>(emptyEvent);
  const [crestsInput, setCrestsInput] = useState("");
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null
  );

  const sortedEvents = [...events].sort((a, b) => b.year - a.year);

  function openAddModal() {
    setEditIndex(null);
    setFormData({ ...emptyEvent });
    setCrestsInput("");
    setModalOpen(true);
  }

  function openEditModal(sortedIdx: number) {
    const event = sortedEvents[sortedIdx];
    const realIndex = events.indexOf(event);
    setEditIndex(realIndex);
    setFormData({ ...event });
    setCrestsInput((event.clubCrests || []).join(", "));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditIndex(null);
    setFormData({ ...emptyEvent });
    setCrestsInput("");
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eventToSave: TimelineEvent = {
      ...formData,
      clubCrests: crestsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (editIndex !== null) {
      const updated = [...events];
      updated[editIndex] = eventToSave;
      setEvents(updated);
    } else {
      setEvents([...events, eventToSave]);
    }
    closeModal();
  }

  function handleDelete(sortedIdx: number) {
    const event = sortedEvents[sortedIdx];
    const realIndex = events.indexOf(event);
    const updated = events.filter((_, i) => i !== realIndex);
    setEvents(updated);
    setDeleteConfirmIndex(null);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(events);
    } catch {
      console.error("Failed to save timeline events");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#1a3a4a] to-[#2B9EB3] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Landmark size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Timeline Manager
            </h3>
            <p className="text-white/70 text-sm">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save All"}
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#1a3a4a] rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            <Plus size={18} />
            Add Event
          </button>
        </div>
      </div>

      <div className="p-4">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No timeline events yet</p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B9EB3] text-white rounded-lg font-medium hover:bg-[#249DAD] transition-colors"
            >
              <Plus size={18} />
              Add your first event
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {sortedEvents.map((event, sortedIdx) => (
              <div
                key={`${event.year}-${event.title}-${sortedIdx}`}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-16 h-16 bg-[#1a3a4a] rounded-lg flex-shrink-0 flex flex-col items-center justify-center">
                  <span className="text-[#2B9EB3] font-bold text-lg leading-none">
                    {event.year}
                  </span>
                  {event.month && (
                    <span className="text-white/60 text-[10px] mt-0.5 uppercase">
                      {event.month}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {event.title}
                    </h4>
                    {event.featured && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold uppercase flex-shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mb-1.5">
                    {event.description}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${categoryBadgeColors[event.category]}`}
                  >
                    {event.category}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(sortedIdx)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil size={18} className="text-blue-500" />
                  </button>
                  {deleteConfirmIndex === sortedIdx ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(sortedIdx)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded font-medium hover:bg-red-700 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmIndex(null)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X size={16} className="text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmIndex(sortedIdx)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#1a3a4a] to-[#2B9EB3] px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg font-semibold text-white">
                {editIndex !== null ? "Edit Event" : "Add Event"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.month || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    placeholder="e.g. March"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Event title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe this timeline event..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as TimelineEvent["category"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source URL (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.sourceUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, sourceUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Name (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.sourceName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, sourceName: e.target.value })
                    }
                    placeholder="e.g. GAA.ie"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club Crests (optional, comma-separated paths)
                </label>
                <input
                  type="text"
                  value={crestsInput}
                  onChange={(e) => setCrestsInput(e.target.value)}
                  placeholder="/crests/club1.png, /crests/club2.png"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={formData.imageUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="/images/timeline/event.jpg"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured || false}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 text-[#2B9EB3] rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured event
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.title || !formData.description}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2B9EB3] text-white rounded-lg font-medium hover:bg-[#249DAD] transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {editIndex !== null ? "Update Event" : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
