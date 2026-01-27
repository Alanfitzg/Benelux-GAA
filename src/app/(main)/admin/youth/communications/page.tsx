"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

interface Communication {
  id: string;
  subject: string;
  content: string;
  recipients: string[];
  recipientType: "all" | "specific" | "country";
  sentAt: string;
  sentBy: string;
  status: "sent" | "draft";
  openRate?: number;
}

const youthClubs: { id: string; name: string; country: string }[] = [];

const countries: string[] = [];

export default function YouthCommunicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: "",
    content: "",
    recipientType: "all" as "all" | "specific" | "country",
    selectedClubs: [] as string[],
    selectedCountries: [] as string[],
  });

  useEffect(() => {
    if (status === "loading") return;
    if (
      !session?.user ||
      (session.user.role !== "SUPER_ADMIN" &&
        session.user.role !== "YOUTH_OFFICER")
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (searchParams.get("action") === "compose") {
      setIsComposing(true);
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" &&
      session.user.role !== "YOUTH_OFFICER")
  ) {
    return null;
  }

  const handleSend = () => {
    const newComm: Communication = {
      id: `new-${Date.now()}`,
      subject: newMessage.subject,
      content: newMessage.content,
      recipients:
        newMessage.recipientType === "all"
          ? ["All Youth Clubs"]
          : newMessage.recipientType === "country"
            ? newMessage.selectedCountries
            : newMessage.selectedClubs,
      recipientType: newMessage.recipientType,
      sentAt: new Date().toISOString(),
      sentBy: session.user?.name || session.user?.username || "Youth Officer",
      status: "sent",
    };
    setCommunications([newComm, ...communications]);
    setIsComposing(false);
    setNewMessage({
      subject: "",
      content: "",
      recipientType: "all",
      selectedClubs: [],
      selectedCountries: [],
    });
  };

  const handleSaveDraft = () => {
    const newComm: Communication = {
      id: `draft-${Date.now()}`,
      subject: newMessage.subject,
      content: newMessage.content,
      recipients:
        newMessage.recipientType === "all"
          ? ["All Youth Clubs"]
          : newMessage.recipientType === "country"
            ? newMessage.selectedCountries
            : newMessage.selectedClubs,
      recipientType: newMessage.recipientType,
      sentAt: "",
      sentBy: "",
      status: "draft",
    };
    setCommunications([newComm, ...communications]);
    setIsComposing(false);
    setNewMessage({
      subject: "",
      content: "",
      recipientType: "all",
      selectedClubs: [],
      selectedCountries: [],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/youth"
                className="text-white/70 hover:text-white transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📧</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Communications
                </h1>
                <p className="text-white/70 text-sm">
                  Send messages to youth clubs
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsComposing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Compose
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {communications.filter((c) => c.status === "sent").length}
            </div>
            <div className="text-sm text-white/60">Messages Sent</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-400">
              {communications.filter((c) => c.status === "draft").length}
            </div>
            <div className="text-sm text-white/60">Drafts</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {youthClubs.length}
            </div>
            <div className="text-sm text-white/60">Recipients</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(
                communications
                  .filter((c) => c.openRate)
                  .reduce((acc, c) => acc + (c.openRate || 0), 0) /
                  communications.filter((c) => c.openRate).length || 0
              )}
              %
            </div>
            <div className="text-sm text-white/60">Avg Open Rate</div>
          </div>
        </div>

        {/* Compose Modal */}
        {isComposing && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">New Message</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Recipients
                  </label>
                  <div className="flex gap-2 mb-3">
                    {(["all", "country", "specific"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setNewMessage({ ...newMessage, recipientType: type })
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                          newMessage.recipientType === type
                            ? "bg-rose-500 text-white"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                      >
                        {type === "all"
                          ? "All Clubs"
                          : type === "country"
                            ? "By Country"
                            : "Specific Clubs"}
                      </button>
                    ))}
                  </div>

                  {newMessage.recipientType === "country" && (
                    <div className="flex flex-wrap gap-2">
                      {countries.map((country) => (
                        <button
                          key={country}
                          type="button"
                          onClick={() => {
                            const selected =
                              newMessage.selectedCountries.includes(country)
                                ? newMessage.selectedCountries.filter(
                                    (c) => c !== country
                                  )
                                : [...newMessage.selectedCountries, country];
                            setNewMessage({
                              ...newMessage,
                              selectedCountries: selected,
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            newMessage.selectedCountries.includes(country)
                              ? "bg-rose-500 text-white"
                              : "bg-white/10 text-white/60 hover:bg-white/20"
                          }`}
                        >
                          {country}
                        </button>
                      ))}
                    </div>
                  )}

                  {newMessage.recipientType === "specific" && (
                    <div className="flex flex-wrap gap-2">
                      {youthClubs.map((club) => (
                        <button
                          key={club.id}
                          type="button"
                          onClick={() => {
                            const selected = newMessage.selectedClubs.includes(
                              club.name
                            )
                              ? newMessage.selectedClubs.filter(
                                  (c) => c !== club.name
                                )
                              : [...newMessage.selectedClubs, club.name];
                            setNewMessage({
                              ...newMessage,
                              selectedClubs: selected,
                            });
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            newMessage.selectedClubs.includes(club.name)
                              ? "bg-rose-500 text-white"
                              : "bg-white/10 text-white/60 hover:bg-white/20"
                          }`}
                        >
                          {club.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-rose-500"
                    placeholder="Enter subject..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Message
                  </label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) =>
                      setNewMessage({ ...newMessage, content: e.target.value })
                    }
                    rows={8}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-rose-500"
                    placeholder="Write your message..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!newMessage.subject || !newMessage.content}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {communications.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Communications Yet
            </h3>
            <p className="text-white/60 mb-6">
              Send your first message to youth clubs.
            </p>
            <button
              type="button"
              onClick={() => setIsComposing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors font-medium"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Compose First Message
            </button>
          </div>
        )}

        {/* Communications List */}
        {communications.length > 0 && (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div
                key={comm.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">
                        {comm.subject}
                      </h3>
                      {comm.status === "draft" && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-300">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60 mb-3 line-clamp-2">
                      {comm.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1">
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {comm.recipients.join(", ")}
                      </span>
                      {comm.sentAt && (
                        <span>
                          {new Date(comm.sentAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {comm.openRate !== undefined && (
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-green-400">
                        {comm.openRate}%
                      </div>
                      <div className="text-xs text-white/50">Open rate</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
