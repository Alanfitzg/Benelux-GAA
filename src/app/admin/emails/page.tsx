"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Users,
  Globe,
  CheckSquare,
  Square,
  Loader2,
  Mail,
} from "lucide-react";

// Email template types with their descriptions and trigger points
// Configured templates first, then placeholders
const EMAIL_TEMPLATES = [
  {
    type: "WELCOME_EUROPEAN_ADMIN",
    name: "Welcome European Admin",
    description: "Sent when a European club admin application is approved",
    trigger: "Admin approved",
    priority: "HIGH",
    status: "configured",
  },
  {
    type: "WELCOME",
    name: "Welcome Email",
    description: "Sent when a new user registers",
    trigger: "User signup",
    priority: "HIGH",
    status: "placeholder",
  },
  {
    type: "BOOKING_CONFIRMATION",
    name: "Booking Confirmation",
    description: "Confirms a trip booking has been received",
    trigger: "Booking created",
    priority: "HIGH",
    status: "placeholder",
  },
  {
    type: "BOOKING_REMINDER",
    name: "Trip Reminder",
    description: "Reminder sent before the trip date",
    trigger: "7 days before trip",
    priority: "MEDIUM",
    status: "placeholder",
  },
  {
    type: "PRE_DEPARTURE",
    name: "Pre-Departure Info",
    description: "Essential information pack sent before departure",
    trigger: "3 days before trip",
    priority: "HIGH",
    status: "placeholder",
  },
  {
    type: "POST_TRIP_FEEDBACK",
    name: "Post-Trip Feedback Request",
    description: "Request for review/testimonial after the trip ends",
    trigger: "1-2 days after trip",
    priority: "CRITICAL",
    status: "placeholder",
  },
  {
    type: "ADMIN_NEW_BOOKING",
    name: "Admin: New Booking Alert",
    description: "Notifies admin of new bookings",
    trigger: "Booking created",
    priority: "MEDIUM",
    status: "placeholder",
  },
  {
    type: "ADMIN_NEW_USER",
    name: "Admin: New User Alert",
    description: "Notifies admin of new user registrations",
    trigger: "User signup",
    priority: "LOW",
    status: "placeholder",
  },
  {
    type: "CLUB_ADMIN_NEW_INTEREST",
    name: "Club Admin: New Interest",
    description: "Notifies club admin when someone shows interest",
    trigger: "Interest submitted",
    priority: "MEDIUM",
    status: "placeholder",
  },
  {
    type: "PASSWORD_RESET",
    name: "Password Reset",
    description: "Password reset link email",
    trigger: "Reset requested",
    priority: "HIGH",
    status: "placeholder",
  },
  {
    type: "TOURNAMENT_REGISTRATION",
    name: "Tournament Registration",
    description: "Confirms tournament registration",
    trigger: "Team registered",
    priority: "MEDIUM",
    status: "placeholder",
  },
];

interface DistributionGroup {
  id: string;
  name: string;
  description: string;
  clubCount: number;
}

const DISTRIBUTION_GROUPS: DistributionGroup[] = [
  {
    id: "mainland-europe",
    name: "Mainland Europe",
    description: "All clubs in continental Europe",
    clubCount: 0,
  },
  {
    id: "uk-ireland",
    name: "UK & Ireland",
    description: "Clubs in United Kingdom and Ireland",
    clubCount: 0,
  },
  {
    id: "north-america",
    name: "North America",
    description: "Clubs in USA and Canada",
    clubCount: 0,
  },
  {
    id: "asia-pacific",
    name: "Asia Pacific",
    description: "Clubs in Asia, Australia, and New Zealand",
    clubCount: 0,
  },
  {
    id: "middle-east-africa",
    name: "Middle East & Africa",
    description: "Clubs in Middle East and Africa",
    clubCount: 0,
  },
  {
    id: "all-clubs",
    name: "All Clubs",
    description: "Every club in the system with admins",
    clubCount: 0,
  },
];

export default function EmailsAdminPage() {
  const [activeTab, setActiveTab] = useState<
    "broadcast" | "templates" | "logs" | "setup"
  >("broadcast");
  const [distributionGroups, setDistributionGroups] =
    useState<DistributionGroup[]>(DISTRIBUTION_GROUPS);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    fetchDistributionGroupStats();
  }, []);

  const fetchDistributionGroupStats = async () => {
    try {
      const response = await fetch("/api/admin/distribution-groups");
      if (response.ok) {
        const data = await response.json();
        setDistributionGroups(data.groups);
      }
    } catch (error) {
      console.error("Error fetching distribution groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const getTotalRecipients = () => {
    if (selectedGroups.has("all-clubs")) {
      const allClubs = distributionGroups.find((g) => g.id === "all-clubs");
      return allClubs?.clubCount || 0;
    }
    return distributionGroups
      .filter((g) => selectedGroups.has(g.id))
      .reduce((sum, g) => sum + g.clubCount, 0);
  };

  const handleSendBroadcast = async () => {
    if (selectedGroups.size === 0) {
      setSendError("Please select at least one distribution group");
      return;
    }
    if (!broadcastSubject.trim()) {
      setSendError("Please enter a subject");
      return;
    }
    if (!broadcastMessage.trim()) {
      setSendError("Please enter a message");
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const response = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupIds: Array.from(selectedGroups),
          subject: broadcastSubject.trim(),
          message: broadcastMessage.trim(),
        }),
      });

      if (response.ok) {
        setSendSuccess(true);
        setBroadcastSubject("");
        setBroadcastMessage("");
        setSelectedGroups(new Set());
        setTimeout(() => setSendSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        setSendError(errorData.error || "Failed to send broadcast");
      }
    } catch (error) {
      console.error("Error sending broadcast:", error);
      setSendError("Failed to send broadcast. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
          Automated Emails
        </h1>
        <Link
          href="/admin"
          className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-gray-300 transition text-center text-sm sm:text-base"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Progress Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="text-lg sm:text-2xl">📧</div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
              <h2 className="font-semibold text-blue-800 text-sm sm:text-lg">
                Email System Progress
              </h2>
              <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full self-start sm:self-auto">
                1 of {EMAIL_TEMPLATES.length} configured
              </span>
            </div>
            <p className="text-xs sm:text-base text-blue-700 mb-2 sm:mb-3">
              The email system is partially set up. The Welcome European Admin
              email is ready to send. See the Setup Guide tab for remaining
              configuration steps.
            </p>
            <div className="w-full bg-blue-200 rounded-full h-1.5 sm:h-2">
              <div
                className="bg-blue-600 h-1.5 sm:h-2 rounded-full"
                style={{
                  width: `${(EMAIL_TEMPLATES.filter((t) => t.status === "configured").length / EMAIL_TEMPLATES.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("broadcast")}
            className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              activeTab === "broadcast"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Broadcast</span>
            <span className="sm:hidden">Send</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("setup")}
            className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "setup"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="hidden sm:inline">Setup Guide</span>
            <span className="sm:hidden">Setup</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "templates"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <span className="hidden sm:inline">Email Templates</span>
            <span className="sm:hidden">Templates</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "logs"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Logs
          </button>
        </nav>
      </div>

      {/* Broadcast Tab */}
      {activeTab === "broadcast" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Info Box */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-3 sm:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-purple-900 text-sm sm:text-lg mb-1 sm:mb-2">
                  Club Network Broadcast
                </h2>
                <p className="text-xs sm:text-base text-purple-700">
                  Send messages to club admins across different regions. Select
                  one or more distribution groups and compose your message.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Distribution Groups */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                Distribution Groups
              </h3>

              {loadingGroups ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {distributionGroups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full p-2.5 sm:p-4 rounded-lg border transition-colors text-left ${
                        selectedGroups.has(group.id)
                          ? "bg-purple-50 border-purple-300"
                          : "bg-gray-50 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        {selectedGroups.has(group.id) ? (
                          <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-base font-medium text-gray-900">
                              {group.name}
                            </span>
                            <span className="text-[10px] sm:text-sm text-gray-500">
                              {group.clubCount}
                            </span>
                          </div>
                          <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                            {group.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedGroups.size > 0 && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Total recipients:</span>
                    <span className="font-semibold text-purple-600">
                      ~{getTotalRecipients()} club admins
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Compose Message */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                Compose Message
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="e.g., New Tournament Opportunity"
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows={6}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    This message will be sent to all club admins in the selected
                    groups.
                  </p>
                </div>

                {sendError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-red-700">
                    {sendError}
                  </div>
                )}

                {sendSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-green-700">
                    Broadcast sent successfully!
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendBroadcast}
                  disabled={
                    sending ||
                    selectedGroups.size === 0 ||
                    !broadcastSubject.trim() ||
                    !broadcastMessage.trim()
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="hidden sm:inline">
                        Sending Broadcast...
                      </span>
                      <span className="sm:hidden">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Send Broadcast</span>
                      <span className="sm:hidden">Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Guide Tab */}
      {activeTab === "setup" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Purpose Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <h2 className="text-sm sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
              Purpose of This Section
            </h2>
            <p className="text-xs sm:text-base text-gray-600 mb-3 sm:mb-4">
              The email automation system is designed to enhance customer
              experience and drive testimonials/reviews through timely,
              well-crafted communications. Key goals:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-base text-gray-600 space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
              <li>
                <strong>Welcome new users</strong> and guide them through the
                platform
              </li>
              <li>
                <strong>Confirm bookings</strong> to build trust and reduce
                support queries
              </li>
              <li>
                <strong>Send reminders</strong> before trips to ensure customers
                are prepared
              </li>
              <li>
                <strong>Deliver pre-departure info</strong> with essential
                details
              </li>
              <li>
                <strong className="text-red-600">
                  Collect feedback post-trip
                </strong>{" "}
                - Critical for testimonials and reviews
              </li>
              <li>
                <strong>Keep admins informed</strong> of important platform
                activity
              </li>
            </ul>
          </div>

          {/* Critical Flow Section */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-6">
            <h2 className="text-sm sm:text-xl font-semibold text-red-800 mb-2 sm:mb-4">
              Critical: Post-Trip Feedback Flow
            </h2>
            <p className="text-xs sm:text-base text-red-700 mb-3 sm:mb-4">
              The most important email in the system is the post-trip feedback
              request. This directly feeds into the testimonials system:
            </p>
            <div className="bg-white/70 rounded-lg p-2 sm:p-4 overflow-x-auto">
              <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-sm min-w-[280px]">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-[10px] sm:text-base">
                    1
                  </div>
                  <span className="mt-0.5 sm:mt-1 text-gray-600 whitespace-nowrap">
                    Trip Ends
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-red-200"></div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-[10px] sm:text-base">
                    2
                  </div>
                  <span className="mt-0.5 sm:mt-1 text-gray-600 whitespace-nowrap">
                    Email Sent
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-red-200"></div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-[10px] sm:text-base">
                    3
                  </div>
                  <span className="mt-0.5 sm:mt-1 text-gray-600 whitespace-nowrap">
                    Review
                  </span>
                </div>
                <div className="flex-1 h-0.5 bg-red-200"></div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-[10px] sm:text-base">
                    4
                  </div>
                  <span className="mt-0.5 sm:mt-1 text-gray-600 whitespace-nowrap">
                    Testimonial
                  </span>
                </div>
              </div>
            </div>
            <p className="text-red-700 mt-3 sm:mt-4 text-[10px] sm:text-sm">
              Without this automated email, customers may forget to leave
              reviews, resulting in fewer testimonials for the platform and host
              clubs.
            </p>
          </div>

          {/* Implementation Steps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <h2 className="text-sm sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Implementation Phases
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Phase 1 - Complete */}
              <div className="border-l-4 border-green-500 pl-3 sm:pl-4">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-xs sm:text-base text-green-600 font-medium">
                    Phase 1: Database Models
                  </span>
                  <span className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded">
                    COMPLETE
                  </span>
                </div>
                <ul className="text-[10px] sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                  <li>✓ EmailTemplate model created</li>
                  <li>✓ EmailLog model created</li>
                  <li>✓ Admin UI placeholder page</li>
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="border-l-4 border-amber-500 pl-3 sm:pl-4">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-xs sm:text-base text-amber-600 font-medium">
                    Phase 2: Email Provider Setup
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded">
                    TODO
                  </span>
                </div>
                <ul className="text-[10px] sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                  <li>○ Choose email provider (Resend recommended)</li>
                  <li>○ Create account and get API key</li>
                  <li>○ Add RESEND_API_KEY to .env</li>
                  <li className="hidden sm:list-item">
                    ○ Create /src/lib/email.ts with sendEmail function
                  </li>
                  <li>○ Test sending a basic email</li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="border-l-4 border-gray-300 pl-3 sm:pl-4">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-xs sm:text-base text-gray-600 font-medium">
                    Phase 3: Template Implementation
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded">
                    TODO
                  </span>
                </div>
                <ul className="text-[10px] sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                  <li>○ Seed default templates to database</li>
                  <li>○ Create template editor UI</li>
                  <li className="hidden sm:list-item">
                    ○ Implement variable substitution (e.g., {"{{userName}}"},{" "}
                    {"{{tripDate}}"})
                  </li>
                  <li>○ Add preview functionality</li>
                </ul>
              </div>

              {/* Phase 4 */}
              <div className="border-l-4 border-gray-300 pl-3 sm:pl-4">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <span className="text-xs sm:text-base text-gray-600 font-medium">
                    Phase 4: Trigger Integration
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded">
                    TODO
                  </span>
                </div>
                <ul className="text-[10px] sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                  <li>○ Hook up Welcome email to user registration</li>
                  <li>○ Hook up Booking Confirmation to booking flow</li>
                  <li className="hidden sm:list-item">
                    ○ Set up scheduled job for reminders (use Vercel Cron)
                  </li>
                  <li>○ Set up post-trip feedback automation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recommended Providers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-6">
            <h2 className="text-sm sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Recommended Email Providers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="border rounded-lg p-2.5 sm:p-4">
                <h3 className="text-xs sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">
                  Resend
                </h3>
                <p className="text-[10px] sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                  Simple API, great developer experience. 100 emails/day free.
                </p>
                <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <div className="border rounded-lg p-2.5 sm:p-4">
                <h3 className="text-xs sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">
                  SendGrid
                </h3>
                <p className="text-[10px] sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                  Industry standard, excellent deliverability. 100 emails/day
                  free.
                </p>
              </div>
              <div className="border rounded-lg p-2.5 sm:p-4">
                <h3 className="text-xs sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">
                  AWS SES
                </h3>
                <p className="text-[10px] sm:text-sm text-gray-600 mb-1.5 sm:mb-2">
                  Cheapest at scale, requires more setup. $0.10 per 1,000
                  emails.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Mobile Cards View */}
          <div className="sm:hidden divide-y divide-gray-200">
            {EMAIL_TEMPLATES.map((template) => (
              <div key={template.type} className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {template.name}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {template.trigger}
                    </div>
                  </div>
                  <div className="ml-2 flex gap-1">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                        template.priority === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : template.priority === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : template.priority === "MEDIUM"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {template.priority}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                        template.status === "configured"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {template.status === "configured" ? "OK" : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {EMAIL_TEMPLATES.map((template) => (
                  <tr
                    key={template.type}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {template.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {template.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {template.trigger}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.priority === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : template.priority === "HIGH"
                              ? "bg-amber-100 text-amber-800"
                              : template.priority === "MEDIUM"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {template.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          template.status === "configured"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {template.status === "configured"
                          ? "Configured"
                          : "Not configured"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        disabled
                        className="text-gray-400 cursor-not-allowed"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8">
          <div className="text-center text-gray-500">
            <div className="text-2xl sm:text-4xl mb-3 sm:mb-4">📭</div>
            <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
              No Emails Sent Yet
            </h3>
            <p className="text-xs sm:text-sm">
              Once the email system is configured and emails are sent, logs will
              appear here.
            </p>
            <p className="text-xs sm:text-sm mt-2 hidden sm:block">
              The log will show recipient, subject, status
              (sent/failed/bounced), and timestamps.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
