"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import LocationAutocomplete from "./LocationAutocomplete";
import ImageUpload from "../../components/ImageUpload";
import ClubSelectorOptional from "@/components/ClubSelectorOptional";
import EnhancedPitchSelector from "@/components/events/EnhancedPitchSelector";
import type { Event } from "@/types";
import { EVENT_TYPES } from "@/lib/constants/events";
import { TEAM_TYPES } from "@/lib/constants/teams";
import { URLS, MESSAGES } from "@/lib/constants";
import { validateEventDates } from "@/lib/validation/date-validation";
import { toast } from "react-hot-toast";

type EventFormData = Omit<Event, "id" | "club"> & {
  clubId?: string;
  acceptedTeamTypes?: string[];
  pitchLocationId?: string;
  pitchLocationIds?: string[];
};

export const dynamic = "force-dynamic";

export default function CreateEvent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");
  const [dateWarning, setDateWarning] = useState<string>("");
  const [gaaFixtureClash, setGaaFixtureClash] = useState<{
    hasClash: boolean;
    fixtures: Array<{ title: string; impact: string; date: string }>;
    message: string | null;
  } | null>(null);
  const [selectedPitches, setSelectedPitches] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Tournament-specific state
  const [eventType, setEventType] = useState<string>("");
  const [minTeams, setMinTeams] = useState<number | undefined>();
  const [maxTeams, setMaxTeams] = useState<number | undefined>();
  const [acceptedTeamTypes, setAcceptedTeamTypes] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [datesValid, setDatesValid] = useState<boolean>(false);

  // Admin clubs state
  const [adminClubs, setAdminClubs] = useState<{ id: string; name: string }[]>(
    []
  );
  const [loadingAdminClubs, setLoadingAdminClubs] = useState(true);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/signin");
    }
  }, [session, status, router]);

  // Fetch admin clubs on mount
  useEffect(() => {
    const fetchAdminClubs = async () => {
      if (!session?.user) return;

      // Super admins can create events for any club - don't pre-select
      if (session.user.role === "SUPER_ADMIN") {
        setLoadingAdminClubs(false);
        return;
      }

      try {
        const response = await fetch("/api/user/admin-clubs");
        if (response.ok) {
          const data = await response.json();
          setAdminClubs(data.clubs || []);

          // If user is admin of exactly one club, pre-select it
          if (data.clubs?.length === 1) {
            setSelectedClubId(data.clubs[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching admin clubs:", error);
      } finally {
        setLoadingAdminClubs(false);
      }
    };

    fetchAdminClubs();
  }, [session]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the form if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  // Check for GAA fixture clashes
  const checkGAAFixtureClash = async (start: string, end?: string) => {
    if (!start) {
      setGaaFixtureClash(null);
      return;
    }

    try {
      const params = new URLSearchParams({ date: start });
      if (end) params.append("endDate", end);

      const response = await fetch(
        `/api/admin/gaa-fixtures/check-clash?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setGaaFixtureClash(data);
      }
    } catch (error) {
      console.error("Error checking GAA fixture clash:", error);
    }
  };

  // Validate dates on change
  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setDateError(""); // Clear error on change
    setDateWarning(""); // Clear warning on change

    if (value) {
      const validation = validateEventDates(value, endDate, true); // Allow past dates
      if (!validation.isValid) {
        setDateError(validation.error || "");
        setDatesValid(false);
      } else {
        setDatesValid(true);
        if (validation.warning) {
          setDateWarning(validation.warning);
        }
      }
      // Check for GAA fixture clash
      checkGAAFixtureClash(value, endDate);
    } else {
      setGaaFixtureClash(null);
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setDateError(""); // Clear error on change
    setDateWarning(""); // Clear warning on change

    if (startDate) {
      const validation = validateEventDates(startDate, value, true); // Allow past dates
      if (!validation.isValid) {
        setDateError(validation.error || "");
        setDatesValid(false);
      } else {
        setDatesValid(true);
        if (validation.warning) {
          setDateWarning(validation.warning);
        }
      }
      // Check for GAA fixture clash
      checkGAAFixtureClash(startDate, value);
    }
  };

  // Get max date for inputs (2 years from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    return maxDate.toISOString().split("T")[0];
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setDateError("");
    setDateWarning("");
    setUploading(false);
    setImageUrl(null);
    const form = event.currentTarget;
    // Get form values
    const startDateValue =
      (form.elements.namedItem("startDate") as HTMLInputElement)?.value || "";
    const endDateValue =
      (form.elements.namedItem("endDate") as HTMLInputElement)?.value ||
      undefined;

    // Validate dates with past dates allowed
    const dateValidation = validateEventDates(
      startDateValue,
      endDateValue,
      true
    );
    if (!dateValidation.isValid) {
      setDateError(dateValidation.error || "Invalid dates");
      return;
    }

    const file = imageFile;
    let uploadedImageUrl = "";

    if (file && file.size > 0) {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("type", "event-image");
      const uploadRes = await fetch(URLS.API.UPLOAD, {
        method: "POST",
        body: uploadData,
      });
      setUploading(false);
      if (!uploadRes.ok) {
        const errorMsg = MESSAGES.ERROR.UPLOAD_FAILED;
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      const uploadJson = await uploadRes.json();
      uploadedImageUrl = uploadJson.url;
      setImageUrl(uploadedImageUrl);
      toast.success("Image uploaded successfully!");
    }

    // Club is required
    if (!selectedClubId) {
      const errorMsg = "Please select a club for this event";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const data: EventFormData = {
      title:
        (form.elements.namedItem("title") as HTMLInputElement)?.value || "",
      eventType: eventType,
      location,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      startDate:
        (form.elements.namedItem("startDate") as HTMLInputElement)?.value || "",
      endDate:
        (form.elements.namedItem("endDate") as HTMLInputElement)?.value ||
        undefined,
      cost:
        parseFloat(
          (form.elements.namedItem("cost") as HTMLInputElement)?.value
        ) || undefined,
      description:
        (form.elements.namedItem("description") as HTMLTextAreaElement)
          ?.value || undefined,
      imageUrl: uploadedImageUrl || undefined,
      clubId: selectedClubId || undefined,
      pitchLocationId:
        selectedPitches.length === 1 ? selectedPitches[0] : undefined,
      pitchLocationIds: selectedPitches,
      // Tournament-specific fields
      ...(eventType === "Tournament" && {
        minTeams: minTeams || undefined,
        maxTeams: maxTeams || undefined,
        acceptedTeamTypes:
          acceptedTeamTypes.length > 0 ? acceptedTeamTypes : undefined,
        visibility: visibility,
      }),
    };

    console.log("Submitting event data:", JSON.stringify(data, null, 2));

    const response = await fetch(URLS.API.EVENTS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Event creation response status:", response.status);
    console.log("Event creation response ok:", response.ok);

    if (response.ok) {
      try {
        const createdEvent = await response.json();
        console.log("✅ Event created successfully:", createdEvent);
        toast.success(`Event "${createdEvent.title}" submitted for approval!`);
        toast("Your event will be visible once approved by an administrator.", {
          icon: "ℹ️",
          duration: 5000,
        });
        router.push("/events");
      } catch (parseError) {
        console.error("Could not parse success response:", parseError);
        toast.success("Event submitted for approval!");
        router.push("/events");
      }
    } else {
      console.error(
        "Failed to create event:",
        response.status,
        response.statusText
      );
      try {
        const errorData = await response.json();
        console.error("Error details:", errorData);
        const errorMsg = errorData.error || MESSAGES.ERROR.GENERIC;
        setError(errorMsg);
        toast.error(`Failed to create event: ${errorMsg}`);
      } catch {
        console.error("Could not parse error response");
        const errorMsg = MESSAGES.ERROR.GENERIC;
        setError(errorMsg);
        toast.error(`Failed to create event: ${errorMsg}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-light to-secondary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">
              Create Your Event
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Share your Gaelic event with the global community and connect with
              passionate players worldwide.
            </p>
          </motion.div>
        </div>
        {/* Animated background shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Form Section */}
      <div className="relative -mt-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-professional-lg border border-gray-200/50 overflow-hidden">
            <div className="p-8 md:p-12">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3"
                >
                  <span className="text-red-500">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              {dateError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3"
                >
                  <span className="text-amber-500">📅</span>
                  <span>{dateError}</span>
                </motion.div>
              )}

              {datesValid && startDate && !dateError && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl mb-8 flex items-center space-x-3"
                >
                  <span className="text-green-500">✅</span>
                  <span>
                    Event dates are valid!
                    {endDate
                      ? ` Event runs from ${new Date(startDate).toLocaleDateString("en-IE")} to ${new Date(endDate).toLocaleDateString("en-IE")}`
                      : ` Event on ${new Date(startDate).toLocaleDateString("en-IE")}`}
                  </span>
                </motion.div>
              )}

              {gaaFixtureClash?.hasClash && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`px-6 py-4 rounded-xl mb-8 ${
                    gaaFixtureClash.fixtures.some(
                      (f) => f.impact === "CRITICAL"
                    )
                      ? "bg-red-50 border-2 border-red-300"
                      : gaaFixtureClash.fixtures.some(
                            (f) => f.impact === "HIGH"
                          )
                        ? "bg-orange-50 border-2 border-orange-300"
                        : "bg-amber-50 border-2 border-amber-300"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0">
                      {gaaFixtureClash.fixtures.some(
                        (f) => f.impact === "CRITICAL"
                      )
                        ? "🚨"
                        : "⚠️"}
                    </span>
                    <div className="flex-1">
                      <h4
                        className={`font-bold text-sm mb-1 ${
                          gaaFixtureClash.fixtures.some(
                            (f) => f.impact === "CRITICAL"
                          )
                            ? "text-red-800"
                            : gaaFixtureClash.fixtures.some(
                                  (f) => f.impact === "HIGH"
                                )
                              ? "text-orange-800"
                              : "text-amber-800"
                        }`}
                      >
                        GAA Fixture Clash Detected
                      </h4>
                      <p
                        className={`text-sm mb-3 ${
                          gaaFixtureClash.fixtures.some(
                            (f) => f.impact === "CRITICAL"
                          )
                            ? "text-red-700"
                            : gaaFixtureClash.fixtures.some(
                                  (f) => f.impact === "HIGH"
                                )
                              ? "text-orange-700"
                              : "text-amber-700"
                        }`}
                      >
                        {gaaFixtureClash.message}
                      </p>
                      <div className="space-y-2">
                        {gaaFixtureClash.fixtures.map((fixture, index) => (
                          <div
                            key={index}
                            className={`text-xs p-2 rounded-lg ${
                              fixture.impact === "CRITICAL"
                                ? "bg-red-100 text-red-800"
                                : fixture.impact === "HIGH"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            <span className="font-semibold">
                              {fixture.title}
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              {new Date(fixture.date).toLocaleDateString(
                                "en-IE",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span
                              className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                fixture.impact === "CRITICAL"
                                  ? "bg-red-200 text-red-900"
                                  : fixture.impact === "HIGH"
                                    ? "bg-orange-200 text-orange-900"
                                    : "bg-amber-200 text-amber-900"
                              }`}
                            >
                              {fixture.impact}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs mt-3 italic opacity-75">
                        You can still create the event, but be aware that Irish
                        teams are unlikely to travel during major GAA fixtures.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Event Title - Moved to first position */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter event title"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                      required
                    />
                  </motion.div>

                  {/* Event Type - Moved to second position */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-1"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Type
                    </label>
                    <select
                      name="eventType"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-sm font-medium"
                      required
                    >
                      <option value="" disabled>
                        Select Event Type
                      </option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Club Association - Required */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-1"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Club Association <span className="text-red-500">*</span>
                      </label>

                      {loadingAdminClubs ? (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-500">
                            Loading...
                          </span>
                        </div>
                      ) : adminClubs.length === 1 ? (
                        // User is admin of exactly one club - show it as fixed
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="font-medium text-gray-900">
                            {adminClubs[0].name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Your club
                          </p>
                        </div>
                      ) : adminClubs.length > 1 ? (
                        // User is admin of multiple clubs - show dropdown with only their clubs
                        <select
                          value={selectedClubId}
                          onChange={(e) => setSelectedClubId(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        >
                          <option value="">Select your club</option>
                          {adminClubs.map((club) => (
                            <option key={club.id} value={club.id}>
                              {club.name}
                            </option>
                          ))}
                        </select>
                      ) : session?.user?.role === "SUPER_ADMIN" ? (
                        // Super admin - show full club selector
                        <ClubSelectorOptional
                          value={selectedClubId}
                          onChange={setSelectedClubId}
                        />
                      ) : (
                        // Regular user with no admin clubs - they shouldn't be here
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-600">
                            You must be a club admin to create events.
                          </p>
                        </div>
                      )}

                      {!selectedClubId && adminClubs.length !== 1 && (
                        <p className="text-xs text-gray-500 mt-2">
                          All events must be associated with a club
                        </p>
                      )}
                    </div>
                  </motion.div>

                  {/* Location - Now fourth in order */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Location
                    </label>
                    <LocationAutocomplete
                      value={location}
                      onChange={setLocation}
                      onLocationSelect={(locationData) => {
                        setSelectedCity(locationData.city);
                        setCoordinates(locationData.coordinates);
                        setLocation(locationData.address || locationData.city);
                      }}
                    />
                  </motion.div>

                  {/* Pitch Location Selector - shows after location is selected */}
                  {selectedCity && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                      className="md:col-span-2"
                    >
                      <EnhancedPitchSelector
                        selectedPitches={selectedPitches}
                        onChange={(pitches) => {
                          setSelectedPitches(pitches);
                        }}
                        clubId={selectedClubId || undefined}
                        isTournament={eventType === "Tournament"}
                        allowCreate={true}
                      />
                    </motion.div>
                  )}

                  {/* Start Date - Now after location/pitch */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      max={getMaxDate()}
                      className={`w-full border-2 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:ring-4 transition-all duration-300 ${
                        dateError && startDate
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : dateWarning && startDate
                            ? "border-amber-400 focus:border-amber-500 focus:ring-amber-500/10"
                            : "border-gray-200 focus:border-primary focus:ring-primary/10"
                      }`}
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Select any date up to{" "}
                      {new Date(getMaxDate()).toLocaleDateString("en-IE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </motion.div>

                  {/* End Date */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      End Date <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      max={getMaxDate()}
                      className={`w-full border-2 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:ring-4 transition-all duration-300 ${
                        dateError && endDate
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                          : dateWarning && endDate
                            ? "border-amber-400 focus:border-amber-500 focus:ring-amber-500/10"
                            : "border-gray-200 focus:border-primary focus:ring-primary/10"
                      }`}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {startDate
                        ? "Must be after start date. Maximum event duration is 30 days."
                        : "Select a start date first"}
                    </p>
                  </motion.div>

                  {/* Cost - Now full width */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Cost per Person{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        €
                      </span>
                      <input
                        type="number"
                        name="cost"
                        placeholder="0.00"
                        step="0.01"
                        className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      A €5 platform fee will be added to the price shown to
                      participants
                    </p>
                  </motion.div>

                  {/* Tournament-specific fields */}
                  {eventType === "Tournament" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="md:col-span-2"
                    >
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-amber-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-bold text-amber-800">
                            Tournament Settings
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Tournament Visibility */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Tournament Visibility
                            </label>
                            <div className="flex space-x-4">
                              <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-primary/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                <input
                                  type="radio"
                                  name="visibility"
                                  value="PUBLIC"
                                  checked={visibility === "PUBLIC"}
                                  onChange={(e) =>
                                    setVisibility(
                                      e.target.value as "PUBLIC" | "PRIVATE"
                                    )
                                  }
                                  className="w-4 h-4 text-primary border-2 border-gray-300 focus:ring-primary focus:ring-2"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    🌍 Public Tournament
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Open to new team registrations
                                  </div>
                                </div>
                              </label>
                              <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-primary/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                <input
                                  type="radio"
                                  name="visibility"
                                  value="PRIVATE"
                                  checked={visibility === "PRIVATE"}
                                  onChange={(e) =>
                                    setVisibility(
                                      e.target.value as "PUBLIC" | "PRIVATE"
                                    )
                                  }
                                  className="w-4 h-4 text-primary border-2 border-gray-300 focus:ring-primary focus:ring-2"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    🔒 Private Tournament
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Official tournament, no new applications
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>

                          {/* Accepted Team Types */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Accepted Team Categories{" "}
                              <span className="text-gray-400">(Optional)</span>
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-white">
                              {TEAM_TYPES.map((type) => (
                                <label
                                  key={type}
                                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={acceptedTeamTypes.includes(type)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setAcceptedTeamTypes([
                                          ...acceptedTeamTypes,
                                          type,
                                        ]);
                                      } else {
                                        setAcceptedTeamTypes(
                                          acceptedTeamTypes.filter(
                                            (t) => t !== type
                                          )
                                        );
                                      }
                                    }}
                                    className="w-4 h-4 text-primary border-2 border-gray-300 rounded focus:ring-primary focus:ring-2"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {type}
                                  </span>
                                </label>
                              ))}
                            </div>
                            {acceptedTeamTypes.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600 mb-2">
                                  Selected categories:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {acceptedTeamTypes.map((type) => (
                                    <span
                                      key={type}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                    >
                                      {type}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setAcceptedTeamTypes(
                                            acceptedTeamTypes.filter(
                                              (t) => t !== type
                                            )
                                          )
                                        }
                                        className="ml-2 w-4 h-4 rounded-full hover:bg-primary/20 flex items-center justify-center"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Minimum Teams */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Minimum Teams{" "}
                              <span className="text-gray-400">(Optional)</span>
                            </label>
                            <input
                              type="number"
                              value={minTeams || ""}
                              onChange={(e) =>
                                setMinTeams(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                              placeholder="e.g., 4"
                              min="2"
                              max="64"
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                            />
                          </div>

                          {/* Maximum Teams */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Maximum Teams{" "}
                              <span className="text-gray-400">(Optional)</span>
                            </label>
                            <input
                              type="number"
                              value={maxTeams || ""}
                              onChange={(e) =>
                                setMaxTeams(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                              placeholder="e.g., 16"
                              min={minTeams || 2}
                              max="64"
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
                            />
                          </div>
                        </div>

                        {/* Tournament Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <svg
                              className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">
                                Tournament Information
                              </p>
                              <p>
                                All tournament settings are optional. Select
                                which team categories can participate, set
                                participation limits, or leave open to all.
                                Teams can register through the event page once
                                published.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: eventType === "Tournament" ? 0.9 : 0.85,
                    }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      name="description"
                      rows={5}
                      placeholder="Provide a detailed description of your event, including what participants can expect, skill level requirements, and any special information..."
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500 resize-none"
                    ></textarea>
                  </motion.div>

                  {/* Event Image */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: eventType === "Tournament" ? 0.95 : 0.9,
                    }}
                    className="md:col-span-2"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Image{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <ImageUpload
                      value={imageUrl}
                      onChange={(file) => setImageFile(file)}
                      uploading={uploading}
                      error={error}
                    />
                  </motion.div>
                </div>

                {/* Date Warning/Error Display */}
                {(dateWarning || dateError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 mt-4"
                  >
                    {dateError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-700 text-sm font-medium flex items-center gap-2">
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
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {dateError}
                        </p>
                      </div>
                    )}
                    {dateWarning && !dateError && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-amber-800 text-sm font-medium">
                          {dateWarning}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: eventType === "Tournament" ? 1.0 : 0.95,
                  }}
                  className="pt-8 border-t border-gray-200"
                >
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Event...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <span>Create Event</span>
                        <span>→</span>
                      </span>
                    )}
                  </button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
