"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, MapPin, Send, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Club {
  id: string;
  name: string;
  location?: string | null;
  imageUrl?: string | null;
  teamTypes: string[];
}

interface ClubSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmit?: () => void;
}

export default function ClubSelectionModal({
  isOpen,
  onClose,
  onRequestSubmit,
}: ClubSelectionModalProps) {
  const { trackClubAdminRequest } = useAnalytics();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userClubs, setUserClubs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchClubs();
      fetchUserClubs();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = clubs.filter(
      (club) =>
        !userClubs.includes(club.id) && (
          club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.location?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredClubs(filtered);
  }, [searchTerm, clubs, userClubs]);

  const fetchClubs = async () => {
    try {
      const response = await fetch("/api/clubs");
      if (response.ok) {
        const data = await response.json();
        setClubs(data.clubs);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserClubs = async () => {
    try {
      const response = await fetch("/api/user/clubs");
      if (response.ok) {
        const data = await response.json();
        const clubIds = data.clubs.map((club: { id: string }) => club.id);
        setUserClubs(clubIds);
      }
    } catch (error) {
      console.error("Error fetching user clubs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub || !reason.trim()) {
      setError("Please select a club and provide a reason");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/clubs/admin-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubId: selectedClub.id,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      // Track successful club admin request
      trackClubAdminRequest(selectedClub.id, selectedClub.name);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedClub(null);
        setReason("");
        setSearchTerm("");
        if (onRequestSubmit) {
          onRequestSubmit();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClubSelect = (club: Club) => {
    setSelectedClub(club);
    setSearchTerm("");
  };

  const handleBack = () => {
    setSelectedClub(null);
    setReason("");
    setError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedClub ? "Request Admin Access" : "Select a Club"}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-green-600 mb-2">
                    Request Submitted!
                  </h4>
                  <p className="text-gray-600">
                    Your request has been sent to the administrators for review.
                  </p>
                </motion.div>
              ) : selectedClub ? (
                <div>
                  <button
                    onClick={handleBack}
                    className="text-primary hover:text-primary-dark mb-4 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to clubs
                  </button>

                  <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    {selectedClub.imageUrl ? (
                      <Image
                        src={selectedClub.imageUrl}
                        alt={selectedClub.name}
                        width={60}
                        height={60}
                        className="w-15 h-15 rounded-lg object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{selectedClub.name}</h4>
                      {selectedClub.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {selectedClub.location}
                        </p>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Request <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please explain why you should be granted admin access to this club..."
                        className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        rows={4}
                        required
                      />
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Request
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search clubs by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : filteredClubs.length > 0 ? (
                    <div className="space-y-2">
                      {filteredClubs.map((club) => (
                        <motion.button
                          key={club.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => handleClubSelect(club)}
                          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-gray-50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            {club.imageUrl ? (
                              <Image
                                src={club.imageUrl}
                                alt={club.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-lg object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{club.name}</h4>
                              {club.location && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {club.location}
                                </p>
                              )}
                              {club.teamTypes.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {club.teamTypes.join(", ")}
                                </p>
                              )}
                            </div>
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No clubs found matching your search.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}