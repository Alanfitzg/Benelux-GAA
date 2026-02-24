"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Save, X, Calendar } from "lucide-react";
import type { Fixture } from "../data/fixtures";

const emptyFixture: Fixture = {
  id: "",
  date: "",
  time: "",
  competition: "",
  code: "",
  venue: "",
  homeTeam: "",
  awayTeam: "",
  round: "",
  notes: "",
  tbc: false,
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface FixturesManagerProps {
  fixtures: Fixture[];
  onSave: (fixtures: Fixture[]) => Promise<void>;
}

export default function FixturesManager({
  fixtures: initialFixtures,
  onSave,
}: FixturesManagerProps) {
  const [fixtures, setFixtures] = useState<Fixture[]>(initialFixtures);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState<Fixture>(emptyFixture);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sorted = [...fixtures].sort((a, b) => a.date.localeCompare(b.date));

  function getNextId(): string {
    const maxId = fixtures.reduce((max, f) => {
      const num = parseInt(f.id, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return String(maxId + 1);
  }

  function openAdd() {
    setEditingFixture({ ...emptyFixture, id: getNextId() });
    setIsEditing(false);
    setModalOpen(true);
  }

  function openEdit(fixture: Fixture) {
    setEditingFixture({ ...fixture });
    setIsEditing(true);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingFixture(emptyFixture);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setEditingFixture((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setEditingFixture((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEditing) {
      setFixtures((prev) =>
        prev.map((f) => (f.id === editingFixture.id ? editingFixture : f))
      );
    } else {
      setFixtures((prev) => [...prev, editingFixture]);
    }
    closeModal();
  }

  function handleDelete(id: string) {
    setFixtures((prev) => prev.filter((f) => f.id !== id));
    setDeleteConfirmId(null);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(fixtures);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-[#2B9EB3]" />
          <h2 className="text-xl font-bold text-[#1a3a4a]">Fixtures Manager</h2>
          <span className="rounded-full bg-[#2B9EB3]/10 px-3 py-1 text-sm font-medium text-[#2B9EB3]">
            {fixtures.length} fixtures
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-[#2B9EB3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2B9EB3]/90"
          >
            <Plus className="h-4 w-4" />
            Add Fixture
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[#1a3a4a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a3a4a]/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#1a3a4a]">
            <tr>
              {[
                "Date",
                "Time",
                "Competition",
                "Code",
                "Venue",
                "Round",
                "Teams",
                "Notes",
                "TBC",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {sorted.map((fixture) => (
              <tr
                key={fixture.id}
                className="transition-colors hover:bg-[#2B9EB3]/5"
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-[#1a3a4a]">
                  {formatDate(fixture.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {fixture.time || "-"}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-sm text-gray-900">
                  {fixture.competition}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <span className="rounded-full bg-[#1a3a4a]/10 px-2 py-0.5 text-xs font-medium text-[#1a3a4a]">
                    {fixture.code}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {fixture.venue}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {fixture.round || "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {fixture.homeTeam && fixture.awayTeam
                    ? `${fixture.homeTeam} v ${fixture.awayTeam}`
                    : fixture.homeTeam || fixture.awayTeam || "-"}
                </td>
                <td className="max-w-[150px] truncate px-4 py-3 text-sm text-gray-500">
                  {fixture.notes || "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  {fixture.tbc && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      TBC
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(fixture)}
                      className="rounded p-1 text-[#2B9EB3] transition-colors hover:bg-[#2B9EB3]/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {deleteConfirmId === fixture.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(fixture.id)}
                          className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(fixture.id)}
                        className="rounded p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-8 text-center text-sm text-gray-400"
                >
                  No fixtures added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a3a4a]">
                {isEditing ? "Edit Fixture" : "Add Fixture"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a3a4a]">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={editingFixture.date}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2B9EB3] focus:outline-none focus:ring-1 focus:ring-[#2B9EB3]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a3a4a]">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={editingFixture.time || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2B9EB3] focus:outline-none focus:ring-1 focus:ring-[#2B9EB3]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a3a4a]">
                  Competition *
                </label>
                <input
                  type="text"
                  name="competition"
                  required
                  value={editingFixture.competition}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2B9EB3] focus:outline-none focus:ring-1 focus:ring-[#2B9EB3]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a3a4a]">
                    Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    value={editingFixture.code}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2B9EB3] focus:outline-none focus:ring-1 focus:ring-[#2B9EB3]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a3a4a]">
                    Venue *
                  </label>
                  <input
                    type="text"
                    name="venue"
                    required
                    value={editingFixture.venue}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2B9EB3] focus:outline-none focus:ring-1 focus:ring-[#2B9EB3]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a3a4a]">
                  Round
                </label>
                <input
                  type="text"
                  name="round"
                  value={editingFixture.round || ""}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2B9EB3] focus:outline-none focus:ring-1 focus:ring-[#2B9EB3]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a3a4a]">
                    Home Team
                  </label>
                  <input
                    type="text"
                    name="homeTeam"
                    value={editingFixture.homeTeam || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2B9EB3] focus:outline-none focus:ring-1 focus:ring-[#2B9EB3]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#1a3a4a]">
                    Away Team
                  </label>
                  <input
                    type="text"
                    name="awayTeam"
                    value={editingFixture.awayTeam || ""}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2B9EB3] focus:outline-none focus:ring-1 focus:ring-[#2B9EB3]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a3a4a]">
                  Notes
                </label>
                <input
                  type="text"
                  name="notes"
                  value={editingFixture.notes || ""}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2B9EB3] focus:outline-none focus:ring-1 focus:ring-[#2B9EB3]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="tbc"
                  id="tbc"
                  checked={editingFixture.tbc || false}
                  onChange={handleFormChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#2B9EB3] focus:ring-[#2B9EB3]"
                />
                <label
                  htmlFor="tbc"
                  className="text-sm font-medium text-[#1a3a4a]"
                >
                  To Be Confirmed (TBC)
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#2B9EB3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2B9EB3]/90"
                >
                  {isEditing ? "Update Fixture" : "Add Fixture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
