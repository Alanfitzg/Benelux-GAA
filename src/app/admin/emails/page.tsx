"use client";

import { useState } from "react";
import Link from "next/link";

interface EmailStep {
  id: string;
  name: string;
  shortName: string;
  description: string;
  trigger: string;
  status: "configured" | "pending";
}

interface UserJourney {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  steps: EmailStep[];
}

const USER_JOURNEYS: UserJourney[] = [
  {
    id: "european-admin",
    name: "European Club Admin",
    icon: "🌍",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Journey for club admins in mainland Europe",
    steps: [
      {
        id: "welcome-european",
        name: "Welcome Email",
        shortName: "Welcome",
        description: "Sent when European club admin application is approved",
        trigger: "Admin approved",
        status: "configured",
      },
      {
        id: "european-event-nearby",
        name: "Event Nearby",
        shortName: "Event",
        description:
          "Notification when a tournament is happening near their club",
        trigger: "New event in region",
        status: "pending",
      },
      {
        id: "european-monthly",
        name: "Monthly Update",
        shortName: "Monthly",
        description: "Monthly digest of platform activity and opportunities",
        trigger: "1st of month",
        status: "pending",
      },
      {
        id: "european-year-review",
        name: "Year in Review",
        shortName: "Review",
        description: "Annual summary of hosting activity and earnings",
        trigger: "End of year",
        status: "pending",
      },
    ],
  },
  {
    id: "irish-admin",
    name: "Irish Club Admin",
    icon: "🇮🇪",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "Journey for club admins in Ireland (32 counties)",
    steps: [
      {
        id: "welcome-irish",
        name: "Welcome Email",
        shortName: "Welcome",
        description: "Sent when Irish club admin joins the platform",
        trigger: "Admin approved",
        status: "pending",
      },
      {
        id: "irish-fixtures",
        name: "Fixtures Alert",
        shortName: "Fixtures",
        description: "Upcoming GAA fixtures relevant to their county",
        trigger: "Weekly",
        status: "pending",
      },
      {
        id: "irish-county-news",
        name: "County News",
        shortName: "News",
        description: "Updates from clubs in their county",
        trigger: "Bi-weekly",
        status: "pending",
      },
      {
        id: "irish-year-review",
        name: "Year in Review",
        shortName: "Review",
        description: "Annual summary with county highlights",
        trigger: "End of year",
        status: "pending",
      },
    ],
  },
  {
    id: "british-admin",
    name: "British Club Admin",
    icon: "🇬🇧",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "Journey for club admins in Britain",
    steps: [
      {
        id: "welcome-british",
        name: "Welcome Email",
        shortName: "Welcome",
        description: "Sent when British club admin joins the platform",
        trigger: "Admin approved",
        status: "pending",
      },
      {
        id: "british-event-nearby",
        name: "Event Nearby",
        shortName: "Event",
        description: "Notification when a tournament is happening nearby",
        trigger: "New event in region",
        status: "pending",
      },
      {
        id: "british-monthly",
        name: "Monthly Update",
        shortName: "Monthly",
        description: "Monthly digest of GAA activity in Britain",
        trigger: "1st of month",
        status: "pending",
      },
      {
        id: "british-year-review",
        name: "Year in Review",
        shortName: "Review",
        description: "Annual summary of hosting activity",
        trigger: "End of year",
        status: "pending",
      },
    ],
  },
  {
    id: "travelling-team",
    name: "Travelling Team",
    icon: "✈️",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Journey for teams booking trips through the platform",
    steps: [
      {
        id: "booking-confirmation",
        name: "Booking Confirmation",
        shortName: "Booked",
        description: "Confirms their trip booking has been received",
        trigger: "Booking created",
        status: "pending",
      },
      {
        id: "trip-reminder",
        name: "Trip Reminder",
        shortName: "Reminder",
        description: "Reminder with trip details and preparation checklist",
        trigger: "7 days before",
        status: "pending",
      },
      {
        id: "pre-departure",
        name: "Pre-Departure Pack",
        shortName: "Depart",
        description: "Essential info: contacts, directions, schedule",
        trigger: "3 days before",
        status: "pending",
      },
      {
        id: "post-trip-feedback",
        name: "Feedback Request",
        shortName: "Feedback",
        description: "Request for review and testimonial",
        trigger: "1-2 days after",
        status: "pending",
      },
    ],
  },
  {
    id: "host-club",
    name: "Host Club",
    icon: "🏠",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "Journey for clubs hosting visiting teams",
    steps: [
      {
        id: "host-booking-alert",
        name: "New Booking Alert",
        shortName: "Alert",
        description: "Notification that a team wants to visit",
        trigger: "Booking request",
        status: "pending",
      },
      {
        id: "host-booking-confirmed",
        name: "Booking Confirmed",
        shortName: "Confirmed",
        description: "Confirmation with visitor details",
        trigger: "Booking accepted",
        status: "pending",
      },
      {
        id: "host-pre-event",
        name: "Pre-Event Reminder",
        shortName: "Remind",
        description: "Reminder with preparation checklist",
        trigger: "3 days before",
        status: "pending",
      },
      {
        id: "host-review-request",
        name: "Review Request",
        shortName: "Review",
        description: "Ask for feedback on the visiting team",
        trigger: "1 day after",
        status: "pending",
      },
    ],
  },
  {
    id: "general-user",
    name: "General User",
    icon: "👤",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    description: "Basic communications for all platform users",
    steps: [
      {
        id: "user-welcome",
        name: "Welcome Email",
        shortName: "Welcome",
        description: "Welcome to PlayAway with getting started guide",
        trigger: "User signup",
        status: "pending",
      },
      {
        id: "password-reset",
        name: "Password Reset",
        shortName: "Reset",
        description: "Secure password reset link",
        trigger: "Reset requested",
        status: "pending",
      },
      {
        id: "account-updated",
        name: "Account Updated",
        shortName: "Updated",
        description: "Confirmation of profile changes",
        trigger: "Profile saved",
        status: "pending",
      },
    ],
  },
];

export default function EmailsAdminPage() {
  const [expandedJourney, setExpandedJourney] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<{
    journey: string;
    step: string;
  } | null>(null);

  const totalSteps = USER_JOURNEYS.reduce((acc, j) => acc + j.steps.length, 0);
  const configuredSteps = USER_JOURNEYS.reduce(
    (acc, j) => acc + j.steps.filter((s) => s.status === "configured").length,
    0
  );

  const getStepForDetail = () => {
    if (!selectedStep) return null;
    const journey = USER_JOURNEYS.find((j) => j.id === selectedStep.journey);
    if (!journey) return null;
    const step = journey.steps.find((s) => s.id === selectedStep.step);
    return step
      ? { ...step, journeyName: journey.name, journeyIcon: journey.icon }
      : null;
  };

  const stepDetail = getStepForDetail();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl sm:text-4xl">📧</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white">
                  Email Journeys
                </h1>
                <p className="text-xs sm:text-base text-gray-300 mt-0.5 sm:mt-1">
                  Automated email flows for each user type
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="bg-white/10 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-white/20 transition text-center text-sm sm:text-base border border-white/20"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Progress Banner */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-lg sm:text-xl">✓</span>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
                  <h2 className="font-semibold text-green-200 text-sm sm:text-base">
                    Email System Progress
                  </h2>
                  <span className="bg-green-500/30 text-green-200 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full self-start sm:self-auto">
                    {configuredSteps} of {totalSteps} emails configured
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-green-100/80">
                  Click on any journey to see the email flow, then click a step
                  to configure it.
                </p>
                <div className="w-full bg-white/20 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3">
                  <div
                    className="bg-green-400 h-1.5 sm:h-2 rounded-full transition-all"
                    style={{
                      width: `${(configuredSteps / totalSteps) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Journeys */}
        <div className="space-y-4">
          {USER_JOURNEYS.map((journey) => {
            const configuredCount = journey.steps.filter(
              (s) => s.status === "configured"
            ).length;
            const isExpanded = expandedJourney === journey.id;

            return (
              <div
                key={journey.id}
                className={`bg-white rounded-xl shadow-lg border-2 transition-all ${
                  isExpanded ? journey.borderColor : "border-transparent"
                }`}
              >
                {/* Journey Header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedJourney(isExpanded ? null : journey.id)
                  }
                  className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-10 h-10 sm:w-14 sm:h-14 ${journey.bgColor} rounded-xl flex items-center justify-center`}
                    >
                      <span className="text-xl sm:text-3xl">
                        {journey.icon}
                      </span>
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                        {journey.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                        {journey.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="text-right">
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          configuredCount === journey.steps.length
                            ? "text-green-600"
                            : configuredCount > 0
                              ? "text-amber-600"
                              : "text-gray-400"
                        }`}
                      >
                        {configuredCount}/{journey.steps.length}
                      </span>
                      <span className="text-xs text-gray-400 ml-1 hidden sm:inline">
                        configured
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Journey Flow */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="border-t border-gray-100 pt-4 sm:pt-6">
                      {/* Desktop Flow View */}
                      <div className="hidden sm:flex items-center justify-between">
                        {journey.steps.map((step, index) => (
                          <div
                            key={step.id}
                            className="flex items-center flex-1"
                          >
                            {/* Step Circle */}
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStep({
                                  journey: journey.id,
                                  step: step.id,
                                })
                              }
                              className={`relative flex flex-col items-center group cursor-pointer ${
                                selectedStep?.step === step.id
                                  ? "scale-110"
                                  : ""
                              }`}
                            >
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                  step.status === "configured"
                                    ? "bg-green-100 text-green-600 ring-2 ring-green-500"
                                    : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                                } ${selectedStep?.step === step.id ? "ring-2 ring-indigo-500" : ""}`}
                              >
                                {step.status === "configured" ? (
                                  <svg
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <span className="text-sm font-medium">
                                    {index + 1}
                                  </span>
                                )}
                              </div>
                              <span className="mt-2 text-xs font-medium text-gray-700 text-center max-w-[80px]">
                                {step.shortName}
                              </span>
                              <span className="text-[10px] text-gray-400 mt-0.5">
                                {step.trigger}
                              </span>
                            </button>

                            {/* Connector Line */}
                            {index < journey.steps.length - 1 && (
                              <div className="flex-1 h-0.5 mx-2 bg-gray-200 relative">
                                <div
                                  className={`absolute inset-y-0 left-0 ${
                                    step.status === "configured"
                                      ? "bg-green-400"
                                      : "bg-gray-200"
                                  }`}
                                  style={{
                                    width:
                                      step.status === "configured"
                                        ? "100%"
                                        : "0%",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Mobile Flow View */}
                      <div className="sm:hidden space-y-3">
                        {journey.steps.map((step, index) => (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() =>
                              setSelectedStep({
                                journey: journey.id,
                                step: step.id,
                              })
                            }
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              selectedStep?.step === step.id
                                ? "bg-indigo-50 border border-indigo-200"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                step.status === "configured"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {step.status === "configured" ? (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <span className="text-xs font-medium">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium text-gray-900">
                                {step.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {step.trigger}
                              </div>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Detail Modal/Panel */}
        {selectedStep && stepDetail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stepDetail.journeyIcon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {stepDetail.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {stepDetail.journeyName}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedStep(null)}
                    className="text-gray-400 hover:text-gray-600"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {stepDetail.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trigger
                    </label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {stepDetail.trigger}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                        stepDetail.status === "configured"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {stepDetail.status === "configured" ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Configured & Active
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Not Yet Configured
                        </>
                      )}
                    </div>
                  </div>

                  {stepDetail.status !== "configured" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        To Configure This Email:
                      </h4>
                      <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Create the email template in code</li>
                        <li>Set up the trigger in the relevant API route</li>
                        <li>Test with a sample recipient</li>
                        <li>Mark as configured in this system</li>
                      </ol>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStep(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg opacity-50 cursor-not-allowed"
                  >
                    Edit Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {USER_JOURNEYS.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-300">
              User Journeys
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {totalSteps}
            </div>
            <div className="text-xs sm:text-sm text-gray-300">Total Emails</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-400">
              {configuredSteps}
            </div>
            <div className="text-xs sm:text-sm text-gray-300">Configured</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-amber-400">
              {totalSteps - configuredSteps}
            </div>
            <div className="text-xs sm:text-sm text-gray-300">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}
