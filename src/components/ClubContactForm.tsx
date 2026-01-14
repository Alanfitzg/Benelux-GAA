"use client";

import React, { useState } from "react";

interface ClubContactFormProps {
  clubId: string;
  clubName: string;
  type: "contact" | "interest";
  compact?: boolean;
}

export default function ClubContactForm({
  clubId,
  clubName,
  type,
  compact = false,
}: ClubContactFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/clubs/${clubId}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const buttonText = type === "contact" ? "Contact Club" : "Register Interest";
  const modalTitle =
    type === "contact"
      ? `Contact ${clubName}`
      : `Register Interest in ${clubName}`;
  const placeholder =
    type === "contact"
      ? "Ask about organising a friendly match, tournament availability, or anything else..."
      : "Tell us about your club, when you might visit, or any questions...";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`rounded-lg font-medium transition-colors ${
          compact
            ? "px-3 py-1.5 text-xs bg-white/20 text-white hover:bg-white/30"
            : `px-4 py-2 text-sm ${
                type === "contact"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`
        }`}
      >
        {buttonText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalTitle}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
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

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-green-600 font-medium">
                  {type === "contact"
                    ? "Message sent successfully!"
                    : "Interest recorded successfully!"}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  The club will be notified.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message {type === "contact" ? "(Optional)" : "(Optional)"}
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                      type === "contact"
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-green-600 hover:bg-green-700"
                    } disabled:opacity-50`}
                  >
                    {loading ? "Sending..." : buttonText}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
