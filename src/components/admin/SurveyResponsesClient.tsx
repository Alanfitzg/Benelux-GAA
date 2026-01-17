"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  DollarSign,
  Plane,
  MessageSquare,
  ClipboardList,
  Eye,
} from "lucide-react";

interface SurveyResponse {
  id: string;
  eventId: string | null;
  role: string;
  clubName: string | null;
  country: string;
  city: string | null;
  sportCode: string | null;
  hasTraveledAbroad: string | null;
  travelFrequency: string | null;
  destinationsVisited: string[];
  preferredMonths: string[];
  specificDestination: string | null;
  preferredTravelTime: string | null;
  teamSize: string | null;
  budgetPerPerson: string | null;
  biggestChallenge: string | null;
  interestedServices: string[];
  improvementSuggestion: string | null;
  additionalFeedback: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  submittedAt: Date;
  event: {
    id: string;
    title: string;
    location: string;
    startDate: Date;
  } | null;
}

interface Stats {
  total: number;
  byRole: { role: string; _count: { role: number } }[];
  byCountry: { country: string; _count: { country: number } }[];
  budgetRanges: {
    budgetPerPerson: string | null;
    _count: { budgetPerPerson: number };
  }[];
}

interface SurveyResponsesClientProps {
  responses: SurveyResponse[];
  stats: Stats;
}

export default function SurveyResponsesClient({
  responses,
  stats,
}: SurveyResponsesClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedResponse =
    selectedIndex !== null ? responses[selectedIndex] : null;

  const openModal = (index: number) => {
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < responses.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowLeft") {
      goToPrevious();
    } else if (e.key === "ArrowRight") {
      goToNext();
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800"
      onKeyDown={selectedIndex !== null ? handleKeyDown : undefined}
      tabIndex={-1}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Custom Trip Requests
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                View and analyze custom trip requests and travel preferences
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
              Total Responses
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
              {stats.total}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
              Top Role
            </h3>
            <p className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {stats.byRole[0]?.role || "N/A"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {stats.byRole[0]?._count.role || 0} responses
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
              Popular Budget
            </h3>
            <p className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {stats.budgetRanges[0]?.budgetPerPerson || "N/A"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {stats.budgetRanges[0]?._count.budgetPerPerson || 0} responses
            </p>
          </div>
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Mobile Cards View */}
          <div className="sm:hidden divide-y divide-gray-100">
            {responses.map((response, index) => (
              <div key={response.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {response.contactName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {response.contactEmail}
                    </div>
                  </div>
                  <span className="ml-2 text-xs text-gray-400">
                    {new Date(response.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-gray-500">Role:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {response.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {response.country}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Budget:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {response.budgetPerPerson || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Team:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {response.teamSize || "N/A"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openModal(index)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Travel Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget & Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses.map((response, index) => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {response.contactName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {response.contactEmail}
                        </div>
                        {response.contactPhone && (
                          <div className="text-sm text-gray-500">
                            {response.contactPhone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {response.role}
                        </div>
                        <div className="text-sm text-gray-500">
                          {response.clubName && `${response.clubName}, `}
                          {response.city ? `${response.city}, ` : ""}
                          {response.country}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {response.preferredMonths?.length > 0
                            ? response.preferredMonths.join(", ")
                            : response.hasTraveledAbroad || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {response.specificDestination ||
                            response.preferredTravelTime ||
                            "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {response.budgetPerPerson || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Team: {response.teamSize || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {response.event ? (
                        <div>
                          <Link
                            href={`/events/${response.event.id}`}
                            className="text-sm font-medium text-primary hover:text-primary/80"
                          >
                            {response.event.title}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {response.event.location}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          General Request
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(response.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        type="button"
                        onClick={() => openModal(index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {responses.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No trip requests
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Custom trip requests will appear here once users start
                submitting them.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedResponse && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">
                  Trip Request Details
                </h3>
                <span className="text-sm text-white/70">
                  {selectedIndex! + 1} of {responses.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={selectedIndex === 0}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={selectedIndex === responses.length - 1}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
                  title="Close (Escape)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {selectedResponse.contactName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {selectedResponse.contactEmail}
                      </span>
                    </div>
                    {selectedResponse.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {selectedResponse.contactPhone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {new Date(
                          selectedResponse.submittedAt
                        ).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(
                          selectedResponse.submittedAt
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role & Location */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Role & Location
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Role:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {selectedResponse.role}
                      </span>
                    </div>
                    {selectedResponse.clubName && (
                      <div>
                        <span className="text-gray-500">Club:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedResponse.clubName}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Country:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {selectedResponse.country}
                      </span>
                    </div>
                    {selectedResponse.city && (
                      <div>
                        <span className="text-gray-500">City:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedResponse.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Travel Preferences */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-indigo-600" />
                    Travel Preferences
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {selectedResponse.sportCode && (
                      <div>
                        <span className="text-gray-500">Sport Code:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedResponse.sportCode}
                        </span>
                      </div>
                    )}
                    {selectedResponse.preferredMonths?.length > 0 && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">
                          Preferred Travel Months:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedResponse.preferredMonths.join(", ")}
                        </span>
                      </div>
                    )}
                    {selectedResponse.specificDestination && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">
                          Specific Destination:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedResponse.specificDestination}
                        </span>
                      </div>
                    )}
                    {selectedResponse.hasTraveledAbroad && (
                      <div>
                        <span className="text-gray-500">
                          Has Traveled Abroad:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedResponse.hasTraveledAbroad}
                        </span>
                      </div>
                    )}
                    {selectedResponse.travelFrequency && (
                      <div>
                        <span className="text-gray-500">Travel Frequency:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedResponse.travelFrequency}
                        </span>
                      </div>
                    )}
                    {selectedResponse.preferredTravelTime && (
                      <div>
                        <span className="text-gray-500">Preferred Time:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedResponse.preferredTravelTime}
                        </span>
                      </div>
                    )}
                    {selectedResponse.destinationsVisited.length > 0 && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">
                          Destinations Visited:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedResponse.destinationsVisited.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget & Team */}
                {(selectedResponse.budgetPerPerson ||
                  selectedResponse.teamSize ||
                  selectedResponse.biggestChallenge) && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-indigo-600" />
                      Budget & Team
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {selectedResponse.budgetPerPerson && (
                        <div>
                          <span className="text-gray-500">
                            Budget per Person:
                          </span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedResponse.budgetPerPerson}
                          </span>
                        </div>
                      )}
                      {selectedResponse.teamSize && (
                        <div>
                          <span className="text-gray-500">Team Size:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedResponse.teamSize}
                          </span>
                        </div>
                      )}
                      {selectedResponse.biggestChallenge && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">
                            Biggest Challenge:
                          </span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedResponse.biggestChallenge}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Interests */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Interests & Preferences
                  </h4>
                  <div className="space-y-3 text-sm">
                    {selectedResponse.interestedServices.length > 0 && (
                      <div>
                        <span className="text-gray-500">
                          Interested Services:
                        </span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedResponse.interestedServices.map(
                            (service, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                              >
                                {service}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Info */}
                {selectedResponse.event && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Associated Event
                    </h4>
                    <div className="text-sm">
                      <Link
                        href={`/events/${selectedResponse.event.id}`}
                        className="font-medium text-blue-700 hover:text-blue-800"
                      >
                        {selectedResponse.event.title}
                      </Link>
                      <p className="text-blue-600 mt-1">
                        {selectedResponse.event.location} -{" "}
                        {new Date(
                          selectedResponse.event.startDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Feedback - Most Important Section */}
                {(selectedResponse.improvementSuggestion ||
                  selectedResponse.additionalFeedback) && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-600" />
                      Feedback & Suggestions
                    </h4>
                    <div className="space-y-4">
                      {selectedResponse.improvementSuggestion && (
                        <div>
                          <span className="text-sm font-medium text-amber-800">
                            Improvement Suggestion:
                          </span>
                          <p className="mt-1 text-sm text-amber-900 bg-white/50 p-3 rounded-lg">
                            {selectedResponse.improvementSuggestion}
                          </p>
                        </div>
                      )}
                      {selectedResponse.additionalFeedback && (
                        <div>
                          <span className="text-sm font-medium text-amber-800">
                            Additional Feedback:
                          </span>
                          <p className="mt-1 text-sm text-amber-900 bg-white/50 p-3 rounded-lg whitespace-pre-wrap">
                            {selectedResponse.additionalFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200 flex-shrink-0">
              <p className="text-sm text-gray-500">
                Use arrow keys to navigate
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={selectedIndex === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={selectedIndex === responses.length - 1}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
