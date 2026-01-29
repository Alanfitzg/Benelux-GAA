"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Edit3,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface PendingClub {
  id: string;
  name: string;
  location: string;
  imageUrl: string | null;
  teamTypes: string[];
  contactFirstName: string | null;
  contactLastName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isContactWilling: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  submittedBy: string | null;
  submitter: {
    id: string;
    email: string;
    username: string | null;
    name: string;
  } | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewer: {
    id: string;
    email: string;
    username: string | null;
    name: string;
  } | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  notesForAdmin: string | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  region: string | null;
  subRegion: string | null;
  internationalUnitId: string | null;
}

interface InternationalUnit {
  id: string;
  code: string;
  name: string;
}

export default function ClubApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clubs, setClubs] = useState<PendingClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");
  const [selectedClub, setSelectedClub] = useState<PendingClub | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedClub, setEditedClub] = useState<Partial<PendingClub>>({});
  const [internationalUnits, setInternationalUnits] = useState<
    InternationalUnit[]
  >([]);
  const [selectedInternationalUnit, setSelectedInternationalUnit] =
    useState("");

  // Check permissions
  useEffect(() => {
    if (status === "loading") return;
    if (
      !session?.user ||
      !["SUPER_ADMIN", "GUEST_ADMIN"].includes(session.user.role)
    ) {
      router.push("/admin");
    }
  }, [session, status, router]);

  const fetchClubs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/clubs/pending?status=${statusFilter}`
      );
      if (res.ok) {
        const data = await res.json();
        setClubs(data.clubs);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const fetchInternationalUnits = useCallback(async () => {
    try {
      const res = await fetch("/api/international-units");
      if (res.ok) {
        const data = await res.json();
        setInternationalUnits(data.internationalUnits);
      }
    } catch (error) {
      console.error("Error fetching international units:", error);
    }
  }, []);

  // Fetch clubs and international units
  useEffect(() => {
    fetchClubs();
    fetchInternationalUnits();
  }, [fetchClubs, fetchInternationalUnits]);

  const openReviewModal = (club: PendingClub) => {
    setSelectedClub(club);
    setEditedClub({
      name: club.name,
      location: club.location,
      region: club.region,
      subRegion: club.subRegion,
      contactFirstName: club.contactFirstName,
      contactLastName: club.contactLastName,
      contactEmail: club.contactEmail,
      contactPhone: club.contactPhone,
      facebook: club.facebook,
      instagram: club.instagram,
      website: club.website,
      teamTypes: club.teamTypes,
    });
    setIsEditing(false);
    setRejectionReason("");
    setAdminNotes("");
    setSelectedInternationalUnit(club.internationalUnitId || "");
  };

  const handleEditField = (field: string, value: string | string[] | null) => {
    setEditedClub((prev) => ({ ...prev, [field]: value }));
  };

  const handleAction = async (clubId: string, action: "approve" | "reject") => {
    if (action === "reject" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      setActionLoading(clubId);
      const requestBody: {
        action: string;
        rejectionReason?: string;
        adminNotes?: string;
        editedData?: Partial<PendingClub>;
        internationalUnitId?: string;
      } = {
        action,
        rejectionReason: action === "reject" ? rejectionReason : undefined,
        adminNotes: adminNotes || undefined,
        internationalUnitId: selectedInternationalUnit || undefined,
      };

      // Include edited fields if in editing mode
      if (isEditing) {
        requestBody.editedData = editedClub;
      }

      const res = await fetch(`/api/admin/clubs/${clubId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        await fetchClubs(); // Refresh the list
        setSelectedClub(null);
        setRejectionReason("");
        setAdminNotes("");
        setIsEditing(false);
        setEditedClub({});
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update club status");
      }
    } catch (error) {
      console.error("Error updating club:", error);
      alert("Network error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = clubs.filter((c) => c.status === "PENDING").length;
  const approvedCount = clubs.filter((c) => c.status === "APPROVED").length;
  const rejectedCount = clubs.filter((c) => c.status === "REJECTED").length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Club Approval Management
          </h1>
          <p className="text-white/70 text-sm sm:text-base">
            Review and manage club registrations
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 mb-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                New Club Submissions
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                When users submit a new club that isn&apos;t in our database, it
                appears here for review. You can verify the club details, assign
                it to the correct international unit, and approve or reject the
                submission. Approved clubs become visible in the club directory.
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setStatusFilter("PENDING")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                statusFilter === "PENDING"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Pending</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {pendingCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("APPROVED")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                statusFilter === "APPROVED"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Approved</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {approvedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("REJECTED")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                statusFilter === "REJECTED"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Rejected</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {rejectedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Clubs List */}
        <div className="space-y-4">
          {clubs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                No {statusFilter.toLowerCase()} clubs found
              </p>
            </div>
          ) : (
            clubs.map((club) => (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Mobile Layout */}
                <div className="sm:hidden p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {club.imageUrl ? (
                        <Image
                          src={club.imageUrl}
                          alt={club.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">
                        {club.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{club.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(club.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {club.contactFirstName || "No contact"}
                      </span>
                    </div>
                  </div>

                  {club.teamTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {club.teamTypes.slice(0, 3).map((type, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700"
                        >
                          {type}
                        </span>
                      ))}
                      {club.teamTypes.length > 3 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                          +{club.teamTypes.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {club.status !== "PENDING" && (
                    <div
                      className={`p-3 rounded-xl text-sm mb-3 ${
                        club.status === "APPROVED"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {club.status === "APPROVED" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={
                            club.status === "APPROVED"
                              ? "text-green-700 font-medium"
                              : "text-red-700 font-medium"
                          }
                        >
                          {club.status}
                        </span>
                      </div>
                      {club.rejectionReason && (
                        <p className="text-slate-600 text-xs mt-1">
                          {club.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}

                  {club.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => openReviewModal(club)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors"
                    >
                      Review Club
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {club.imageUrl ? (
                          <Image
                            src={club.imageUrl}
                            alt={club.name}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        ) : (
                          <Building2 className="w-8 h-8 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {club.name}
                        </h3>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{club.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Globe className="w-4 h-4 text-slate-400" />
                              <span>
                                {club.region || "Region not specified"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>
                                Submitted{" "}
                                {new Date(club.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {club.submitter && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <User className="w-4 h-4 text-slate-400" />
                                <span>
                                  by{" "}
                                  {club.submitter.name || club.submitter.email}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {club.contactFirstName && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <User className="w-4 h-4 text-slate-400" />
                                <span>
                                  {club.contactFirstName} {club.contactLastName}
                                </span>
                              </div>
                            )}
                            {club.contactEmail && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>{club.contactEmail}</span>
                              </div>
                            )}
                            {club.contactPhone && (
                              <div className="flex items-center gap-2 text-slate-600">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>{club.contactPhone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {club.teamTypes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {club.teamTypes.map((type, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}

                        {(club.facebook || club.instagram || club.website) && (
                          <div className="mt-3 flex items-center gap-3">
                            {club.facebook && (
                              <a
                                href={club.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                              >
                                Facebook <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {club.instagram && (
                              <a
                                href={club.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-700 text-sm flex items-center gap-1"
                              >
                                Instagram <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {club.website && (
                              <a
                                href={club.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-slate-700 text-sm flex items-center gap-1"
                              >
                                Website <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {club.status !== "PENDING" && (
                          <div
                            className={`mt-4 p-4 rounded-xl text-sm ${
                              club.status === "APPROVED"
                                ? "bg-green-50 border border-green-200"
                                : "bg-red-50 border border-red-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {club.status === "APPROVED" ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              <span
                                className={`font-medium ${
                                  club.status === "APPROVED"
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {club.status}
                              </span>
                              {club.reviewedAt && (
                                <span className="text-slate-500">
                                  on{" "}
                                  {new Date(
                                    club.reviewedAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                              {club.reviewer && (
                                <span className="text-slate-500">
                                  by {club.reviewer.name || club.reviewer.email}
                                </span>
                              )}
                            </div>
                            {club.rejectionReason && (
                              <p className="text-slate-600">
                                <span className="text-slate-500">Reason:</span>{" "}
                                {club.rejectionReason}
                              </p>
                            )}
                            {club.adminNotes && (
                              <p className="text-slate-600 mt-1">
                                <span className="text-slate-500">Notes:</span>{" "}
                                {club.adminNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {club.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => openReviewModal(club)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-medium text-sm hover:bg-slate-700 transition-colors flex-shrink-0"
                      >
                        Review
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedClub && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-indigo-800 px-4 sm:px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                    {isEditing
                      ? editedClub.name || selectedClub.name
                      : selectedClub.name}
                  </h2>
                  <p className="text-white/60 text-sm mt-0.5">
                    Review & Approve
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      isEditing
                        ? "bg-orange-500/20 text-orange-200 hover:bg-orange-500/30"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedClub(null)}
                    className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Mobile Edit Button */}
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`sm:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium mb-4 transition ${
                  isEditing
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? "Cancel Edit Mode" : "Enable Edit Mode"}
              </button>

              {/* Submitter Information */}
              <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <User className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium">Submitted by:</span>
                  {selectedClub.submitter ? (
                    <span className="text-indigo-600 font-medium">
                      {selectedClub.submitter.name ||
                        selectedClub.submitter.email}
                    </span>
                  ) : (
                    <span className="text-slate-400">Unknown</span>
                  )}
                  <span className="text-slate-400">•</span>
                  <span>
                    {new Date(selectedClub.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Club Information */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-500" />
                  Club Information
                  {isEditing && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                      Editing
                    </span>
                  )}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Club Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedClub.name || ""}
                        onChange={(e) =>
                          handleEditField("name", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900 font-medium">
                        {selectedClub.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedClub.location || ""}
                        onChange={(e) =>
                          handleEditField("location", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">{selectedClub.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Region
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedClub.region || ""}
                        onChange={(e) =>
                          handleEditField("region", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">
                        {selectedClub.region || "-"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Sub Region
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedClub.subRegion || ""}
                        onChange={(e) =>
                          handleEditField("subRegion", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">
                        {selectedClub.subRegion || "-"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <h4 className="text-sm font-semibold text-slate-700 mt-6 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  Contact Information
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedClub.contactFirstName || ""}
                        onChange={(e) =>
                          handleEditField("contactFirstName", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">
                        {selectedClub.contactFirstName || "-"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedClub.contactLastName || ""}
                        onChange={(e) =>
                          handleEditField("contactLastName", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">
                        {selectedClub.contactLastName || "-"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedClub.contactEmail || ""}
                        onChange={(e) =>
                          handleEditField("contactEmail", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">
                        {selectedClub.contactEmail || "-"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedClub.contactPhone || ""}
                        onChange={(e) =>
                          handleEditField("contactPhone", e.target.value)
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900">
                        {selectedClub.contactPhone || "-"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <h4 className="text-sm font-semibold text-slate-700 mt-6 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  Social Media
                </h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Facebook
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedClub.facebook || ""}
                        onChange={(e) =>
                          handleEditField("facebook", e.target.value)
                        }
                        placeholder="https://facebook.com/..."
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900 truncate">
                        {selectedClub.facebook ? (
                          <a
                            href={selectedClub.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Instagram
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedClub.instagram || ""}
                        onChange={(e) =>
                          handleEditField("instagram", e.target.value)
                        }
                        placeholder="https://instagram.com/..."
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900 truncate">
                        {selectedClub.instagram ? (
                          <a
                            href={selectedClub.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedClub.website || ""}
                        onChange={(e) =>
                          handleEditField("website", e.target.value)
                        }
                        placeholder="https://..."
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-slate-900 truncate">
                        {selectedClub.website ? (
                          <a
                            href={selectedClub.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          "-"
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Team Types */}
                <div className="mt-6">
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    Team Types
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={
                        Array.isArray(editedClub.teamTypes)
                          ? editedClub.teamTypes.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        handleEditField(
                          "teamTypes",
                          e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter((t) => t)
                        )
                      }
                      placeholder="Men's, Women's, Youth, etc. (comma separated)"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedClub.teamTypes.length > 0 ? (
                        selectedClub.teamTypes.map((type, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-sm">
                          None specified
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes from User */}
              {selectedClub.notesForAdmin && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">
                    Notes from User
                  </h3>
                  <p className="text-amber-900 text-sm whitespace-pre-line">
                    {selectedClub.notesForAdmin}
                  </p>
                </div>
              )}

              {/* International Unit Assignment */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-800 mb-3">
                  International Unit Assignment
                </h3>
                <div>
                  <label className="block text-xs font-medium text-blue-700 mb-2">
                    Assign International Unit (Required for approval)
                  </label>
                  <select
                    value={selectedInternationalUnit}
                    onChange={(e) =>
                      setSelectedInternationalUnit(e.target.value)
                    }
                    className="w-full border border-blue-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select International Unit...</option>
                    {internationalUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-2">
                    This determines which GAA region this club belongs to.
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this club..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Rejection Reason */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Rejection Reason (Required for rejection)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason if rejecting this club..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleAction(selectedClub.id, "approve")}
                  disabled={
                    actionLoading === selectedClub.id ||
                    !selectedInternationalUnit
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  {actionLoading === selectedClub.id
                    ? "Processing..."
                    : isEditing
                      ? "Save & Approve"
                      : "Approve Club"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(selectedClub.id, "reject")}
                  disabled={
                    actionLoading === selectedClub.id || !rejectionReason.trim()
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <XCircle className="w-5 h-5" />
                  {actionLoading === selectedClub.id
                    ? "Processing..."
                    : "Reject Club"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
