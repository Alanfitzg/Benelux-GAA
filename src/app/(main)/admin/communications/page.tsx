"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Send,
  Users,
  Globe,
  CheckSquare,
  Square,
  Loader2,
  Mail,
  User,
  Radio,
  Plus,
  X,
  Search,
  Trash2,
  ChevronDown,
} from "lucide-react";

interface DistributionGroup {
  id: string;
  name: string;
  description: string;
  clubCount: number;
  isCustom?: boolean;
  emails?: string[];
}

interface ClubAdmin {
  id: string;
  email: string;
  name: string | null;
  clubName: string;
  clubId: string;
  country: string | null;
}

const DISTRIBUTION_GROUPS: DistributionGroup[] = [
  {
    id: "mainland-europe",
    name: "Mainland Europe",
    description: "All clubs in continental Europe",
    clubCount: 0,
  },
  {
    id: "ireland",
    name: "Ireland",
    description: "Clubs in Ireland (32 counties)",
    clubCount: 0,
  },
  {
    id: "britain",
    name: "Britain",
    description: "Clubs in England, Scotland, and Wales",
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

export default function CommunicationsPage() {
  const [mode, setMode] = useState<"single" | "broadcast">("single");
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");

  // Single contact state
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [singleContactAdmins, setSingleContactAdmins] = useState<ClubAdmin[]>(
    []
  );
  const [loadingSingleAdmins, setLoadingSingleAdmins] = useState(false);
  const [singleCountryFilter, setSingleCountryFilter] = useState("");
  const [singleClubFilter, setSingleClubFilter] = useState("");

  // Broadcast state
  const [distributionGroups, setDistributionGroups] =
    useState<DistributionGroup[]>(DISTRIBUTION_GROUPS);
  const [customGroups, setCustomGroups] = useState<DistributionGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  // Custom group modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customGroupName, setCustomGroupName] = useState("");
  const [clubAdmins, setClubAdmins] = useState<ClubAdmin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [selectedAdmins, setSelectedAdmins] = useState<Set<string>>(new Set());
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [modalCountryFilter, setModalCountryFilter] = useState("");
  const [modalClubFilter, setModalClubFilter] = useState("");

  // Shared state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    fetchDistributionGroupStats();
    // Load custom groups from localStorage
    const savedCustomGroups = localStorage.getItem("customDistributionGroups");
    if (savedCustomGroups) {
      try {
        setCustomGroups(JSON.parse(savedCustomGroups));
      } catch {
        // Invalid JSON, ignore
      }
    }
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

  const fetchClubAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const response = await fetch("/api/admin/club-admins");
      if (response.ok) {
        const data = await response.json();
        setClubAdmins(data.admins);
      }
    } catch (error) {
      console.error("Error fetching club admins:", error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchSingleContactAdmins = async () => {
    setLoadingSingleAdmins(true);
    try {
      const response = await fetch("/api/admin/club-admins");
      if (response.ok) {
        const data = await response.json();
        setSingleContactAdmins(data.admins);
      }
    } catch (error) {
      console.error("Error fetching club admins:", error);
    } finally {
      setLoadingSingleAdmins(false);
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

  const toggleAdmin = (adminId: string) => {
    const newSelected = new Set(selectedAdmins);
    if (newSelected.has(adminId)) {
      newSelected.delete(adminId);
    } else {
      newSelected.add(adminId);
    }
    setSelectedAdmins(newSelected);
  };

  const getTotalRecipients = () => {
    let total = 0;

    // Check standard groups
    if (selectedGroups.has("all-clubs")) {
      const allClubs = distributionGroups.find((g) => g.id === "all-clubs");
      return allClubs?.clubCount || 0;
    }

    // Add standard group counts
    distributionGroups
      .filter((g) => selectedGroups.has(g.id))
      .forEach((g) => {
        total += g.clubCount;
      });

    // Add custom group counts
    customGroups
      .filter((g) => selectedGroups.has(g.id))
      .forEach((g) => {
        total += g.clubCount;
      });

    return total;
  };

  const openCustomModal = () => {
    setShowCustomModal(true);
    setCustomGroupName("");
    setSelectedAdmins(new Set());
    setAdminSearchQuery("");
    setModalCountryFilter("");
    setModalClubFilter("");
    fetchClubAdmins();
  };

  const openContactPicker = () => {
    setShowContactPicker(true);
    setSingleCountryFilter("");
    setSingleClubFilter("");
    if (singleContactAdmins.length === 0) {
      fetchSingleContactAdmins();
    }
  };

  const selectContact = (admin: ClubAdmin) => {
    setRecipientEmail(admin.email);
    setRecipientName(admin.name || "");
    setShowContactPicker(false);
  };

  const createCustomGroup = () => {
    if (!customGroupName.trim() || selectedAdmins.size === 0) return;

    const selectedEmails = clubAdmins
      .filter((a) => selectedAdmins.has(a.id))
      .map((a) => a.email);

    const newGroup: DistributionGroup = {
      id: `custom-${Date.now()}`,
      name: customGroupName.trim(),
      description: `Custom list with ${selectedAdmins.size} contacts`,
      clubCount: selectedAdmins.size,
      isCustom: true,
      emails: selectedEmails,
    };

    const updatedCustomGroups = [...customGroups, newGroup];
    setCustomGroups(updatedCustomGroups);
    localStorage.setItem(
      "customDistributionGroups",
      JSON.stringify(updatedCustomGroups)
    );

    setShowCustomModal(false);
    setCustomGroupName("");
    setSelectedAdmins(new Set());
  };

  const deleteCustomGroup = (groupId: string) => {
    const updatedCustomGroups = customGroups.filter((g) => g.id !== groupId);
    setCustomGroups(updatedCustomGroups);
    localStorage.setItem(
      "customDistributionGroups",
      JSON.stringify(updatedCustomGroups)
    );

    // Remove from selection if selected
    const newSelected = new Set(selectedGroups);
    newSelected.delete(groupId);
    setSelectedGroups(newSelected);
  };

  // Get unique countries and clubs for filters
  const modalCountries = useMemo(() => {
    const countries = new Set<string>();
    clubAdmins.forEach((a) => {
      if (a.country) countries.add(a.country);
    });
    return Array.from(countries).sort();
  }, [clubAdmins]);

  const modalClubs = useMemo(() => {
    const clubs = new Map<string, string>();
    clubAdmins
      .filter((a) => !modalCountryFilter || a.country === modalCountryFilter)
      .forEach((a) => {
        clubs.set(a.clubId, a.clubName);
      });
    return Array.from(clubs.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clubAdmins, modalCountryFilter]);

  const singleCountries = useMemo(() => {
    const countries = new Set<string>();
    singleContactAdmins.forEach((a) => {
      if (a.country) countries.add(a.country);
    });
    return Array.from(countries).sort();
  }, [singleContactAdmins]);

  const singleClubs = useMemo(() => {
    const clubs = new Map<string, string>();
    singleContactAdmins
      .filter((a) => !singleCountryFilter || a.country === singleCountryFilter)
      .forEach((a) => {
        clubs.set(a.clubId, a.clubName);
      });
    return Array.from(clubs.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [singleContactAdmins, singleCountryFilter]);

  const filteredAdmins = useMemo(() => {
    return clubAdmins.filter((admin) => {
      // Apply country filter
      if (modalCountryFilter && admin.country !== modalCountryFilter)
        return false;

      // Apply club filter
      if (modalClubFilter && admin.clubId !== modalClubFilter) return false;

      // Apply search query
      if (adminSearchQuery) {
        const query = adminSearchQuery.toLowerCase();
        return (
          admin.email.toLowerCase().includes(query) ||
          admin.clubName.toLowerCase().includes(query) ||
          (admin.name && admin.name.toLowerCase().includes(query)) ||
          (admin.country && admin.country.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [clubAdmins, modalCountryFilter, modalClubFilter, adminSearchQuery]);

  const filteredSingleAdmins = useMemo(() => {
    return singleContactAdmins.filter((admin) => {
      // Apply country filter
      if (singleCountryFilter && admin.country !== singleCountryFilter)
        return false;

      // Apply club filter
      if (singleClubFilter && admin.clubId !== singleClubFilter) return false;

      return true;
    });
  }, [singleContactAdmins, singleCountryFilter, singleClubFilter]);

  const handleSend = async () => {
    // Validation
    if (mode === "single") {
      if (!recipientEmail.trim()) {
        setSendError("Please enter a recipient email");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) {
        setSendError("Please enter a valid email address");
        return;
      }
    } else {
      if (selectedGroups.size === 0) {
        setSendError("Please select at least one distribution group");
        return;
      }
    }

    if (!subject.trim()) {
      setSendError("Please enter a subject");
      return;
    }
    if (!message.trim()) {
      setSendError("Please enter a message");
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      if (mode === "single") {
        // Send to single contact
        const response = await fetch("/api/admin/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: recipientEmail.trim(),
            name: recipientName.trim() || undefined,
            subject: subject.trim(),
            message: message.trim(),
          }),
        });

        if (response.ok) {
          setSendSuccess(true);
          setRecipientEmail("");
          setRecipientName("");
          setSubject("");
          setMessage("");
          setTimeout(() => setSendSuccess(false), 5000);
        } else {
          const errorData = await response.json();
          setSendError(errorData.error || "Failed to send email");
        }
      } else {
        // Collect custom group emails
        const customEmails: string[] = [];
        customGroups
          .filter((g) => selectedGroups.has(g.id) && g.emails)
          .forEach((g) => {
            customEmails.push(...(g.emails || []));
          });

        // Get standard group IDs (filter out custom ones)
        const standardGroupIds = Array.from(selectedGroups).filter(
          (id) => !id.startsWith("custom-")
        );

        // Send broadcast
        const response = await fetch("/api/admin/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupIds: standardGroupIds,
            customEmails: customEmails.length > 0 ? customEmails : undefined,
            subject: subject.trim(),
            message: message.trim(),
          }),
        });

        if (response.ok) {
          setSendSuccess(true);
          setSelectedGroups(new Set());
          setSubject("");
          setMessage("");
          setTimeout(() => setSendSuccess(false), 5000);
        } else {
          const errorData = await response.json();
          setSendError(errorData.error || "Failed to send broadcast");
        }
      }
    } catch (error) {
      console.error("Error sending:", error);
      setSendError("Failed to send. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const allGroups = [...distributionGroups, ...customGroups];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl sm:text-4xl">📢</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white">
                  Communications
                </h1>
                <p className="text-xs sm:text-base text-gray-300 mt-0.5 sm:mt-1">
                  Send messages to club admins
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
        </div>

        {/* Tabs */}
        <div className="border-b border-white/20 mb-4 sm:mb-6">
          <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("compose")}
              className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                activeTab === "compose"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white hover:border-gray-400"
              }`}
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Compose Message</span>
              <span className="sm:hidden">Compose</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === "history"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white hover:border-gray-400"
              }`}
            >
              History
            </button>
          </nav>
        </div>

        {/* Compose Tab */}
        {activeTab === "compose" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Mode Toggle */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <span className="text-sm font-medium text-gray-700">
                  Send to:
                </span>
                <div className="flex gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setMode("single")}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all text-sm ${
                      mode === "single"
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Single Contact</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("broadcast")}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-all text-sm ${
                      mode === "broadcast"
                        ? "bg-purple-50 border-purple-300 text-purple-700"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>Broadcast</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Single Contact Mode */}
            {mode === "single" && (
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-gray-900 text-sm sm:text-lg">
                          Send to Individual
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Compose a message to a single club admin or contact
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={openContactPicker}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                      >
                        <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Find Contact</span>
                        <span className="sm:hidden">Find</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Recipient Email *
                      </label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="admin@club.com"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Recipient Name (optional)
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="John Smith"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Tournament Update"
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your message here..."
                      rows={8}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    />
                  </div>

                  {sendError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-red-700">
                      {sendError}
                    </div>
                  )}

                  {sendSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-green-700">
                      Message sent successfully!
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={
                      sending ||
                      !recipientEmail.trim() ||
                      !subject.trim() ||
                      !message.trim()
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Broadcast Mode */}
            {mode === "broadcast" && (
              <>
                {/* Info Box */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm sm:text-lg mb-1 sm:mb-2">
                        Broadcast to Distribution Groups
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Send a message to all club admins in one or more
                        regions. Only clubs with active admins receive
                        broadcasts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Distribution Groups */}
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        Distribution Groups
                      </h3>
                      <button
                        type="button"
                        onClick={openCustomModal}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">New List</span>
                        <span className="sm:hidden">New</span>
                      </button>
                    </div>

                    {loadingGroups ? (
                      <div className="flex items-center justify-center py-6 sm:py-8">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {allGroups.map((group) => (
                          <div
                            key={group.id}
                            className={`relative p-2.5 sm:p-4 rounded-lg border transition-colors ${
                              selectedGroups.has(group.id)
                                ? "bg-purple-50 border-purple-300"
                                : "bg-gray-50 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleGroup(group.id)}
                              className="w-full text-left"
                            >
                              <div className="flex items-start gap-2 sm:gap-3">
                                {selectedGroups.has(group.id) ? (
                                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-base font-medium text-gray-900">
                                      {group.name}
                                    </span>
                                    {group.isCustom && (
                                      <span className="px-1.5 py-0.5 text-[10px] sm:text-xs bg-purple-100 text-purple-700 rounded">
                                        Custom
                                      </span>
                                    )}
                                    <span className="text-[10px] sm:text-sm text-gray-500 ml-auto">
                                      {group.clubCount}
                                    </span>
                                  </div>
                                  <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5 hidden sm:block">
                                    {group.description}
                                  </p>
                                </div>
                              </div>
                            </button>
                            {group.isCustom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCustomGroup(group.id);
                                }}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete custom list"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedGroups.size > 0 && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">
                            Total recipients:
                          </span>
                          <span className="font-semibold text-purple-600">
                            ~{getTotalRecipients()} club admins
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Compose Message */}
                  <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-3 sm:p-6">
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
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g., New Tournament Opportunity"
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Message *
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Write your message here..."
                          rows={6}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        />
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                          This message will be sent to all club admins in the
                          selected groups.
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
                        onClick={handleSend}
                        disabled={
                          sending ||
                          selectedGroups.size === 0 ||
                          !subject.trim() ||
                          !message.trim()
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
                            <span className="hidden sm:inline">
                              Send Broadcast
                            </span>
                            <span className="sm:hidden">Send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-8">
            <div className="text-center text-gray-500">
              <div className="text-2xl sm:text-4xl mb-3 sm:mb-4">📬</div>
              <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                No Messages Sent Yet
              </h3>
              <p className="text-xs sm:text-sm">
                Once messages are sent, a history of all communications will
                appear here.
              </p>
              <p className="text-xs sm:text-sm mt-2 hidden sm:block">
                You&apos;ll be able to see recipients, subjects, and delivery
                status.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contact Picker Modal for Single Contact */}
      {showContactPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Find Contact
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Select a club admin to send your message to
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowContactPicker(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
              {/* Filter Dropdowns */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={singleCountryFilter}
                      onChange={(e) => {
                        setSingleCountryFilter(e.target.value);
                        setSingleClubFilter("");
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">All Countries</option>
                      {singleCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Club
                  </label>
                  <div className="relative">
                    <select
                      value={singleClubFilter}
                      onChange={(e) => setSingleClubFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">All Clubs</option>
                      {singleClubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Contact List */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {loadingSingleAdmins ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredSingleAdmins.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No contacts found. Try adjusting your filters.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredSingleAdmins.map((admin) => (
                      <button
                        key={admin.id}
                        type="button"
                        onClick={() => selectContact(admin)}
                        className="w-full p-3 text-left hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 truncate">
                                {admin.name || "No name"}
                              </span>
                              {admin.country && (
                                <span className="text-xs text-gray-500">
                                  ({admin.country})
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {admin.clubName}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowContactPicker(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Distribution Group Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Create Custom Distribution List
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Select club admins to add to your custom list
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
              {/* List Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List Name *
                </label>
                <input
                  type="text"
                  value={customGroupName}
                  onChange={(e) => setCustomGroupName(e.target.value)}
                  placeholder="e.g., Tournament Hosts 2025"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Filter by Country
                  </label>
                  <div className="relative">
                    <select
                      value={modalCountryFilter}
                      onChange={(e) => {
                        setModalCountryFilter(e.target.value);
                        setModalClubFilter("");
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">All Countries</option>
                      {modalCountries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Filter by Club
                  </label>
                  <div className="relative">
                    <select
                      value={modalClubFilter}
                      onChange={(e) => setModalClubFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">All Clubs</option>
                      {modalClubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Selected Count */}
              <div className="mb-2 text-sm text-gray-600">
                {selectedAdmins.size} contact
                {selectedAdmins.size !== 1 ? "s" : ""} selected
                {filteredAdmins.length > 0 && (
                  <span className="text-gray-400">
                    {" "}
                    • Showing {filteredAdmins.length} result
                    {filteredAdmins.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Admin List */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                {loadingAdmins ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : filteredAdmins.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {adminSearchQuery || modalCountryFilter || modalClubFilter
                      ? "No admins found matching your filters"
                      : "No club admins available"}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredAdmins.map((admin) => (
                      <button
                        key={admin.id}
                        type="button"
                        onClick={() => toggleAdmin(admin.id)}
                        className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                          selectedAdmins.has(admin.id) ? "bg-purple-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {selectedAdmins.has(admin.id) ? (
                            <CheckSquare className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 truncate">
                                {admin.name || admin.email}
                              </span>
                              {admin.country && (
                                <span className="text-xs text-gray-500">
                                  ({admin.country})
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {admin.clubName}
                            </div>
                            {admin.name && (
                              <div className="text-xs text-gray-400 truncate">
                                {admin.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createCustomGroup}
                disabled={!customGroupName.trim() || selectedAdmins.size === 0}
                className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create List ({selectedAdmins.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
