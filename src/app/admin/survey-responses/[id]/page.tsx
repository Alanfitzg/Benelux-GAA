"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface SurveyResponse {
  id: string;
  eventId?: string | null;
  role: string;
  clubName?: string | null;
  country: string;
  city?: string | null;
  hasTraveledAbroad: string;
  travelFrequency?: string | null;
  destinationsVisited: string[];
  preferredTravelTime: string;
  teamSize: string;
  budgetPerPerson: string;
  biggestChallenge: string;
  interestedServices: string[];
  improvementSuggestion?: string | null;
  additionalFeedback?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  submittedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  event?: {
    id: string;
    title: string;
    location: string;
    startDate: string;
  } | null;
}

export default function SurveyResponseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [response, setResponse] = useState<SurveyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveyResponse = async () => {
    try {
      const res = await fetch(`/api/admin/survey-responses/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Survey response not found");
        } else {
          setError("Failed to fetch survey response");
        }
        return;
      }
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Failed to fetch survey response:", error);
      setError("Failed to fetch survey response");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSurveyResponse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-red-600">{error || "Survey response not found"}</p>
          <Link
            href="/admin/survey-responses"
            className="text-primary underline mt-4 inline-block"
          >
            Back to Survey Responses
          </Link>
        </div>
      </div>
    );
  }

  const generateResponseSummary = (response: SurveyResponse): string => {
    return `Custom Trip Request Summary

Contact: ${response.contactName} (${response.contactEmail})
Role: ${response.role}
Location: ${response.city ? `${response.city}, ` : ""}${response.country}
${response.clubName ? `Club: ${response.clubName}` : ""}

Travel History: ${response.hasTraveledAbroad}
${response.travelFrequency ? `Frequency: ${response.travelFrequency}` : ""}
Preferred Time: ${response.preferredTravelTime}
Destinations: ${response.destinationsVisited.join(", ")}

Team Size: ${response.teamSize}
Budget: ${response.budgetPerPerson}
Main Challenge: ${response.biggestChallenge}

Interested Services: ${response.interestedServices.join(", ")}

${response.improvementSuggestion ? `Improvement Suggestions: ${response.improvementSuggestion}` : ""}
${response.additionalFeedback ? `Additional Feedback: ${response.additionalFeedback}` : ""}

Submitted: ${new Date(response.submittedAt).toLocaleString()}
${response.event ? `Related Event: ${response.event.title}` : "General Trip Request"}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/admin/survey-responses"
            className="text-primary hover:text-primary/80 flex items-center gap-2"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Trip Requests
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trip Request Details
        </h1>
        <p className="text-gray-600">
          Submitted on {new Date(response.submittedAt).toLocaleDateString()} at{" "}
          {new Date(response.submittedAt).toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Respondent Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Respondent Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {response.contactName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {response.contactEmail}
                </p>
              </div>
              {response.contactPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {response.contactPhone}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <p className="mt-1 text-sm text-gray-900">{response.role}</p>
              </div>
              {response.clubName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Club
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {response.clubName}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {response.city ? `${response.city}, ` : ""}
                  {response.country}
                </p>
              </div>
            </div>
          </div>

          {/* Travel History & Intent */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                />
              </svg>
              Travel History & Intent
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Has Traveled Abroad
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {response.hasTraveledAbroad}
                </p>
              </div>
              {response.travelFrequency && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Travel Frequency
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {response.travelFrequency}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Travel Time
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {response.preferredTravelTime}
                </p>
              </div>
              {response.destinationsVisited.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Destinations Visited/Considering
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {response.destinationsVisited.map((destination, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {destination}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Budgets & Pain Points */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
              Budgets & Pain Points
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Team Size
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {response.teamSize}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Budget Per Person
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {response.budgetPerPerson}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Biggest Challenge
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {response.biggestChallenge}
                </p>
              </div>
            </div>
          </div>

          {/* Product Fit & Interest */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Product Fit & Interest
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Interested Services
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {response.interestedServices.map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Open-Ended Insights */}
          {(response.improvementSuggestion || response.additionalFeedback) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Insights & Feedback
              </h2>
              <div className="space-y-4">
                {response.improvementSuggestion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Improvement Suggestions
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                      {response.improvementSuggestion}
                    </p>
                  </div>
                )}
                {response.additionalFeedback && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Feedback
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                      {response.additionalFeedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Event Information */}
          {response.event && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Related Event
              </h3>
              <div className="space-y-2">
                <Link
                  href={`/events/${response.event.id}`}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  {response.event.title}
                </Link>
                <p className="text-sm text-gray-600">
                  {response.event.location}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(response.event.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Response Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Response Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Response ID:</span>
                <p className="text-gray-600 break-all">{response.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Submitted:</span>
                <p className="text-gray-600">
                  {new Date(response.submittedAt).toLocaleString()}
                </p>
              </div>
              {response.ipAddress && (
                <div>
                  <span className="font-medium text-gray-700">IP Address:</span>
                  <p className="text-gray-600">{response.ipAddress}</p>
                </div>
              )}
              {response.referrer && (
                <div>
                  <span className="font-medium text-gray-700">Referrer:</span>
                  <p className="text-gray-600 break-all">{response.referrer}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions
            </h3>
            <div className="space-y-3">
              <a
                href={`mailto:${response.contactEmail}?subject=Re: GAA Custom Trip Request`}
                className="block w-full bg-primary text-white text-center px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Requestor
              </a>
              <button
                onClick={() => {
                  const content = generateResponseSummary(response);
                  navigator.clipboard.writeText(content);
                  alert("Request summary copied to clipboard");
                }}
                className="block w-full bg-gray-100 text-gray-700 text-center px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Copy Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
