"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Newsletter {
  id: string;
  title: string;
  content: string;
  status: "draft" | "scheduled" | "sent";
  scheduledFor?: string;
  sentAt?: string;
  recipients: number;
  openRate?: number;
  clickRate?: number;
}

const templates = [
  {
    id: "standard",
    name: "Standard Newsletter",
    description: "Monthly update template",
  },
  {
    id: "event",
    name: "Event Announcement",
    description: "For promoting upcoming events",
  },
  {
    id: "recap",
    name: "Event Recap",
    description: "Post-event summary template",
  },
  {
    id: "urgent",
    name: "Urgent Notice",
    description: "For time-sensitive communications",
  },
];

export default function YouthNewsletterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newNewsletter, setNewNewsletter] = useState({
    title: "",
    content: "",
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
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

  const handleSaveDraft = () => {
    const newNL: Newsletter = {
      id: `draft-${Date.now()}`,
      title: newNewsletter.title,
      content: newNewsletter.content,
      status: "draft",
      recipients: 0,
    };
    setNewsletters([newNL, ...newsletters]);
    setIsComposing(false);
    setNewNewsletter({ title: "", content: "" });
    setSelectedTemplate(null);
  };

  const handleSend = () => {
    const newNL: Newsletter = {
      id: `sent-${Date.now()}`,
      title: newNewsletter.title,
      content: newNewsletter.content,
      status: "sent",
      sentAt: new Date().toISOString(),
      recipients: 45,
    };
    setNewsletters([newNL, ...newsletters]);
    setIsComposing(false);
    setNewNewsletter({ title: "", content: "" });
    setSelectedTemplate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500/20 text-green-300";
      case "scheduled":
        return "bg-blue-500/20 text-blue-300";
      case "draft":
        return "bg-amber-500/20 text-amber-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
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
                <span className="text-3xl">📰</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Newsletter
                </h1>
                <p className="text-white/70 text-sm">
                  Create and send youth newsletters
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsComposing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
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
              Create Newsletter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {newsletters.filter((n) => n.status === "sent").length}
            </div>
            <div className="text-sm text-white/60">Sent</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-400">
              {newsletters.filter((n) => n.status === "draft").length}
            </div>
            <div className="text-sm text-white/60">Drafts</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(
                newsletters
                  .filter((n) => n.openRate)
                  .reduce((acc, n) => acc + (n.openRate || 0), 0) /
                  newsletters.filter((n) => n.openRate).length || 0
              )}
              %
            </div>
            <div className="text-sm text-white/60">Avg Open Rate</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(
                newsletters
                  .filter((n) => n.clickRate)
                  .reduce((acc, n) => acc + (n.clickRate || 0), 0) /
                  newsletters.filter((n) => n.clickRate).length || 0
              )}
              %
            </div>
            <div className="text-sm text-white/60">Avg Click Rate</div>
          </div>
        </div>

        {/* Compose Modal */}
        {isComposing && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">
                  Create Newsletter
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Template Selection */}
                {!selectedTemplate && (
                  <div>
                    <h3 className="text-sm font-medium text-white/70 mb-3">
                      Choose a template
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplate(template.id)}
                          className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-colors"
                        >
                          <h4 className="font-medium text-white">
                            {template.name}
                          </h4>
                          <p className="text-sm text-white/50 mt-1">
                            {template.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Editor */}
                {selectedTemplate && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        Newsletter Title
                      </label>
                      <input
                        type="text"
                        value={newNewsletter.title}
                        onChange={(e) =>
                          setNewNewsletter({
                            ...newNewsletter,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Youth Newsletter - February 2026"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">
                        Content (Markdown supported)
                      </label>
                      <textarea
                        value={newNewsletter.content}
                        onChange={(e) =>
                          setNewNewsletter({
                            ...newNewsletter,
                            content: e.target.value,
                          })
                        }
                        rows={15}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="# Newsletter Title&#10;&#10;Write your content here..."
                      />
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-white/70 mb-2">
                        Preview
                      </h4>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-white/80 whitespace-pre-wrap">
                          {newNewsletter.content ||
                            "Your newsletter content will appear here..."}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 border-t border-white/10 flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedTemplate) {
                      setSelectedTemplate(null);
                    } else {
                      setIsComposing(false);
                    }
                  }}
                  className="px-4 py-2 text-white/70 hover:text-white"
                >
                  {selectedTemplate ? "Back" : "Cancel"}
                </button>
                {selectedTemplate && (
                  <div className="flex gap-3">
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
                      disabled={!newNewsletter.title || !newNewsletter.content}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {newsletters.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📰</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Newsletters Yet
            </h3>
            <p className="text-white/60 mb-6">
              Create your first newsletter to send to youth clubs.
            </p>
            <button
              type="button"
              onClick={() => setIsComposing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
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
              Create First Newsletter
            </button>
          </div>
        )}

        {/* Newsletters List */}
        {newsletters.length > 0 && (
          <div className="space-y-4">
            {newsletters.map((newsletter) => (
              <div
                key={newsletter.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">
                        {newsletter.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusColor(newsletter.status)}`}
                      >
                        {newsletter.status}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-3 line-clamp-2">
                      {newsletter.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      {newsletter.sentAt && (
                        <span>
                          Sent:{" "}
                          {new Date(newsletter.sentAt).toLocaleDateString()}
                        </span>
                      )}
                      {newsletter.recipients > 0 && (
                        <span>{newsletter.recipients} recipients</span>
                      )}
                    </div>
                  </div>
                  {newsletter.openRate !== undefined && (
                    <div className="text-right ml-4 space-y-1">
                      <div>
                        <span className="text-lg font-bold text-green-400">
                          {newsletter.openRate}%
                        </span>
                        <span className="text-xs text-white/50 ml-1">open</span>
                      </div>
                      {newsletter.clickRate !== undefined && (
                        <div>
                          <span className="text-lg font-bold text-blue-400">
                            {newsletter.clickRate}%
                          </span>
                          <span className="text-xs text-white/50 ml-1">
                            click
                          </span>
                        </div>
                      )}
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
