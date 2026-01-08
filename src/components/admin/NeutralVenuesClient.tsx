"use client";

import { useState } from "react";
import Link from "next/link";

type NeutralVenue = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  numberOfPitches: number | null;
  surfaceType: string | null;
  pitchSize: string | null;
  hasFloodlights: boolean;
  changingRooms: string | null;
  parking: string | null;
  spectatorCapacity: number | null;
  cateringOnSite: boolean;
  accommodationNearby: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactRole: string | null;
  typicalCost: string | null;
  bookingNotes: string | null;
  bestTimeToContact: string | null;
  notes: string | null;
  lastContacted: Date | null;
  relationshipStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  initialVenues: NeutralVenue[];
  createVenue: (formData: FormData) => Promise<void>;
  updateVenue: (formData: FormData) => Promise<void>;
  deleteVenue: (formData: FormData) => Promise<void>;
};

const EUROPEAN_COUNTRIES = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Iceland",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Norway",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
].sort();

const RELATIONSHIP_STATUSES = [
  "Cold",
  "Initial contact",
  "In talks",
  "Good relationship",
  "Used before",
  "Preferred partner",
];

const SURFACE_TYPES = [
  "Grass",
  "Artificial",
  "Hybrid",
  "Sand-based",
  "3G",
  "4G",
];

const emptyVenue = {
  name: "",
  city: "",
  country: "",
  address: "",
  latitude: "",
  longitude: "",
  numberOfPitches: "",
  surfaceType: "",
  pitchSize: "",
  hasFloodlights: false,
  changingRooms: "",
  parking: "",
  spectatorCapacity: "",
  cateringOnSite: false,
  accommodationNearby: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contactRole: "",
  typicalCost: "",
  bookingNotes: "",
  bestTimeToContact: "",
  notes: "",
  relationshipStatus: "",
  lastContacted: "",
};

export default function NeutralVenuesClient({
  initialVenues,
  createVenue,
  updateVenue,
  deleteVenue,
}: Props) {
  const [venues] = useState(initialVenues);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<NeutralVenue | null>(null);
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null);
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredVenues = venues.filter((venue) => {
    if (filterCountry !== "all" && venue.country !== filterCountry)
      return false;
    if (filterStatus !== "all" && venue.relationshipStatus !== filterStatus)
      return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        venue.name.toLowerCase().includes(search) ||
        venue.city.toLowerCase().includes(search) ||
        venue.contactName?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const countriesInUse = [...new Set(venues.map((v) => v.country))].sort();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      if (editingVenue) {
        formData.append("id", editingVenue.id);
        await updateVenue(formData);
      } else {
        await createVenue(formData);
      }
      setShowForm(false);
      setEditingVenue(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this venue?")) return;
    const formData = new FormData();
    formData.append("id", id);
    await deleteVenue(formData);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Preferred partner":
        return "bg-green-100 text-green-800";
      case "Used before":
        return "bg-blue-100 text-blue-800";
      case "Good relationship":
        return "bg-emerald-100 text-emerald-800";
      case "In talks":
        return "bg-amber-100 text-amber-800";
      case "Initial contact":
        return "bg-yellow-100 text-yellow-800";
      case "Cold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formValues = editingVenue
    ? {
        name: editingVenue.name,
        city: editingVenue.city,
        country: editingVenue.country,
        address: editingVenue.address || "",
        latitude: editingVenue.latitude?.toString() || "",
        longitude: editingVenue.longitude?.toString() || "",
        numberOfPitches: editingVenue.numberOfPitches?.toString() || "",
        surfaceType: editingVenue.surfaceType || "",
        pitchSize: editingVenue.pitchSize || "",
        hasFloodlights: editingVenue.hasFloodlights,
        changingRooms: editingVenue.changingRooms || "",
        parking: editingVenue.parking || "",
        spectatorCapacity: editingVenue.spectatorCapacity?.toString() || "",
        cateringOnSite: editingVenue.cateringOnSite,
        accommodationNearby: editingVenue.accommodationNearby || "",
        contactName: editingVenue.contactName || "",
        contactEmail: editingVenue.contactEmail || "",
        contactPhone: editingVenue.contactPhone || "",
        contactRole: editingVenue.contactRole || "",
        typicalCost: editingVenue.typicalCost || "",
        bookingNotes: editingVenue.bookingNotes || "",
        bestTimeToContact: editingVenue.bestTimeToContact || "",
        notes: editingVenue.notes || "",
        relationshipStatus: editingVenue.relationshipStatus || "",
        lastContacted: editingVenue.lastContacted
          ? new Date(editingVenue.lastContacted).toISOString().split("T")[0]
          : "",
      }
    : emptyVenue;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Neutral Venues
          </h1>
          <p className="text-gray-600 mt-1">
            Private database of potential event locations across Europe
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setEditingVenue(null);
              setShowForm(true);
            }}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition shadow-sm"
          >
            Add Venue
          </button>
          <Link
            href="/admin"
            className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition text-center"
          >
            Back
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-primary">{venues.length}</div>
          <div className="text-sm text-gray-600">Total Venues</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {
              venues.filter(
                (v) =>
                  v.relationshipStatus === "Preferred partner" ||
                  v.relationshipStatus === "Used before"
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">Established</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-amber-600">
            {
              venues.filter(
                (v) =>
                  v.relationshipStatus === "In talks" ||
                  v.relationshipStatus === "Good relationship"
              ).length
            }
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {countriesInUse.length}
          </div>
          <div className="text-sm text-gray-600">Countries</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Name, city, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Countries</option>
              {countriesInUse.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              {RELATIONSHIP_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="px-4 py-2 bg-gray-100 rounded-lg w-full text-center">
              <span className="text-sm text-gray-600">
                {filteredVenues.length} of {venues.length} venues
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingVenue ? "Edit Venue" : "Add New Venue"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingVenue(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={formValues.name}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      name="country"
                      required
                      defaultValue={formValues.country}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select country...</option>
                      {EUROPEAN_COUNTRIES.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      defaultValue={formValues.city}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={formValues.address}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      defaultValue={formValues.latitude}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      defaultValue={formValues.longitude}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Pitch Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Pitch Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Pitches
                    </label>
                    <input
                      type="number"
                      name="numberOfPitches"
                      defaultValue={formValues.numberOfPitches}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surface Type
                    </label>
                    <select
                      name="surfaceType"
                      defaultValue={formValues.surfaceType}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select...</option>
                      {SURFACE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pitch Size
                    </label>
                    <input
                      type="text"
                      name="pitchSize"
                      placeholder="e.g., Full size, 3/4"
                      defaultValue={formValues.pitchSize}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasFloodlights"
                      name="hasFloodlights"
                      value="true"
                      defaultChecked={formValues.hasFloodlights}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="hasFloodlights"
                      className="text-sm text-gray-700"
                    >
                      Has Floodlights
                    </label>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Facilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Changing Rooms
                    </label>
                    <input
                      type="text"
                      name="changingRooms"
                      placeholder="e.g., 4 rooms, 20 capacity each"
                      defaultValue={formValues.changingRooms}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking
                    </label>
                    <input
                      type="text"
                      name="parking"
                      placeholder="e.g., 100 spaces on-site"
                      defaultValue={formValues.parking}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spectator Capacity
                    </label>
                    <input
                      type="number"
                      name="spectatorCapacity"
                      defaultValue={formValues.spectatorCapacity}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accommodation Nearby
                    </label>
                    <input
                      type="text"
                      name="accommodationNearby"
                      placeholder="e.g., Hotels within 5 mins"
                      defaultValue={formValues.accommodationNearby}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cateringOnSite"
                      name="cateringOnSite"
                      value="true"
                      defaultChecked={formValues.cateringOnSite}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor="cateringOnSite"
                      className="text-sm text-gray-700"
                    >
                      Catering On-Site
                    </label>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      defaultValue={formValues.contactName}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Role
                    </label>
                    <input
                      type="text"
                      name="contactRole"
                      placeholder="e.g., Facilities Manager"
                      defaultValue={formValues.contactRole}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      defaultValue={formValues.contactEmail}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      defaultValue={formValues.contactPhone}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Best Time to Contact
                    </label>
                    <input
                      type="text"
                      name="bestTimeToContact"
                      placeholder="e.g., Weekday mornings"
                      defaultValue={formValues.bestTimeToContact}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Booking & Status */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Booking & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Typical Cost
                    </label>
                    <input
                      type="text"
                      name="typicalCost"
                      placeholder="e.g., €500/day"
                      defaultValue={formValues.typicalCost}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship Status
                    </label>
                    <select
                      name="relationshipStatus"
                      defaultValue={formValues.relationshipStatus}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select...</option>
                      {RELATIONSHIP_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  {editingVenue && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Contacted
                      </label>
                      <input
                        type="date"
                        name="lastContacted"
                        defaultValue={formValues.lastContacted}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Notes
                    </label>
                    <textarea
                      name="bookingNotes"
                      rows={2}
                      placeholder="Any booking requirements or restrictions..."
                      defaultValue={formValues.bookingNotes}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Private Notes
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Internal notes about this venue..."
                      defaultValue={formValues.notes}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVenue(null);
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingVenue
                      ? "Update Venue"
                      : "Add Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Venues List */}
      <div className="space-y-4">
        {filteredVenues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="text-4xl mb-4">🏟️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Venues Found
            </h3>
            <p className="text-gray-500 mb-4">
              {venues.length === 0
                ? "Start by adding your first neutral venue."
                : "No venues match your current filters."}
            </p>
            {venues.length === 0 && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="text-primary hover:underline"
              >
                Add your first venue
              </button>
            )}
          </div>
        ) : (
          filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-xl shadow-sm border overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() =>
                  setExpandedVenue(expandedVenue === venue.id ? null : venue.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {venue.name}
                      </h3>
                      {venue.relationshipStatus && (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                            venue.relationshipStatus
                          )}`}
                        >
                          {venue.relationshipStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">
                      {venue.city}, {venue.country}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      {venue.numberOfPitches && (
                        <span>{venue.numberOfPitches} pitch(es)</span>
                      )}
                      {venue.surfaceType && <span>{venue.surfaceType}</span>}
                      {venue.hasFloodlights && <span>Floodlights</span>}
                      {venue.typicalCost && <span>{venue.typicalCost}</span>}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedVenue === venue.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {expandedVenue === venue.id && (
                <div className="border-t px-4 py-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Contact */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Contact
                      </h4>
                      <div className="text-sm space-y-1">
                        {venue.contactName && (
                          <p>
                            <span className="text-gray-500">Name:</span>{" "}
                            {venue.contactName}
                            {venue.contactRole && (
                              <span className="text-gray-400">
                                {" "}
                                ({venue.contactRole})
                              </span>
                            )}
                          </p>
                        )}
                        {venue.contactEmail && (
                          <p>
                            <span className="text-gray-500">Email:</span>{" "}
                            <a
                              href={`mailto:${venue.contactEmail}`}
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {venue.contactEmail}
                            </a>
                          </p>
                        )}
                        {venue.contactPhone && (
                          <p>
                            <span className="text-gray-500">Phone:</span>{" "}
                            {venue.contactPhone}
                          </p>
                        )}
                        {venue.bestTimeToContact && (
                          <p>
                            <span className="text-gray-500">Best time:</span>{" "}
                            {venue.bestTimeToContact}
                          </p>
                        )}
                        {venue.lastContacted && (
                          <p>
                            <span className="text-gray-500">
                              Last contacted:
                            </span>{" "}
                            {new Date(venue.lastContacted).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Facilities */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Facilities
                      </h4>
                      <div className="text-sm space-y-1">
                        {venue.changingRooms && (
                          <p>
                            <span className="text-gray-500">Changing:</span>{" "}
                            {venue.changingRooms}
                          </p>
                        )}
                        {venue.parking && (
                          <p>
                            <span className="text-gray-500">Parking:</span>{" "}
                            {venue.parking}
                          </p>
                        )}
                        {venue.spectatorCapacity && (
                          <p>
                            <span className="text-gray-500">Capacity:</span>{" "}
                            {venue.spectatorCapacity} spectators
                          </p>
                        )}
                        <p>
                          <span className="text-gray-500">Catering:</span>{" "}
                          {venue.cateringOnSite ? "Available" : "Not on-site"}
                        </p>
                        {venue.accommodationNearby && (
                          <p>
                            <span className="text-gray-500">
                              Accommodation:
                            </span>{" "}
                            {venue.accommodationNearby}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      <div className="text-sm space-y-2">
                        {venue.bookingNotes && (
                          <p className="text-gray-600">{venue.bookingNotes}</p>
                        )}
                        {venue.notes && (
                          <p className="text-gray-600 italic">{venue.notes}</p>
                        )}
                        {!venue.bookingNotes && !venue.notes && (
                          <p className="text-gray-400">No notes</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {venue.address && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm">
                        <span className="text-gray-500">Address:</span>{" "}
                        {venue.address}
                        {venue.latitude && venue.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View on map
                          </a>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVenue(venue);
                        setShowForm(true);
                      }}
                      className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(venue.id);
                      }}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
