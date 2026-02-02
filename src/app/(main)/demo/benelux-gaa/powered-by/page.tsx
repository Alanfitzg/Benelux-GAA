"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, CheckCircle, Mail } from "lucide-react";

export default function PoweredByPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    clubName: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formLoadTime] = useState(Date.now());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    if (formDataObj.get("website") || formDataObj.get("phone_number")) {
      setSent(true);
      return;
    }

    if (Date.now() - formLoadTime < 2000) {
      setSent(true);
      return;
    }

    setSending(true);
    setError("");

    try {
      const messageWithClub = formData.clubName
        ? `Club/Organisation: ${formData.clubName}\n\n${formData.message}`
        : formData.message;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `PlayAway Inquiry from ${formData.clubName || formData.name}`,
          message: messageWithClub,
        }),
      });

      if (response.ok) {
        setSent(true);
        setFormData({ name: "", email: "", clubName: "", message: "" });
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center py-8 md:py-12 px-4">
        <div className="w-full max-w-2xl mx-auto text-center">
          {/* Back button */}
          <div className="mb-6 md:mb-10">
            <Link
              href="/demo/benelux-gaa"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs md:text-sm border border-white/30 px-3 py-2 md:px-4 rounded-lg hover:border-white/50 hover:bg-white/5"
            >
              <ArrowLeft size={14} className="md:w-4 md:h-4" />
              Back to Benelux GAA
            </Link>
          </div>

          {/* Logo */}
          <div className="mb-6 md:mb-10">
            <Image
              src="/logo.png"
              alt="PlayAway"
              width={120}
              height={120}
              className="mx-auto w-20 h-20 md:w-[120px] md:h-[120px]"
              unoptimized
            />
          </div>

          {/* Tagline */}
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-6 px-2">
            Technology for International Sports Clubs
          </h1>

          <p className="text-base md:text-lg text-gray-300 mb-3 md:mb-4 leading-relaxed px-2">
            PlayAway is a dedicated technology service provider helping
            international sports clubs connect, grow, and thrive.
          </p>

          <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-10 leading-relaxed px-2">
            We build custom websites, event management systems, and digital
            tools tailored specifically for GAA clubs and sporting organisations
            around the world.
          </p>

          {/* Contact Section */}
          {sent ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 md:p-8 mx-2">
              <CheckCircle
                className="mx-auto text-green-400 mb-3 md:mb-4"
                size={40}
              />
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                Message Sent!
              </h3>
              <p className="text-sm md:text-base text-gray-300">
                Thank you for your interest. We&apos;ll be in touch soon.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setShowForm(false);
                }}
                className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : !showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-[#2B9EB3] text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold hover:bg-[#238a9c] transition-colors text-base md:text-lg"
            >
              <Mail size={20} className="md:w-[22px] md:h-[22px]" />
              Get in Touch
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-8 text-left mx-2"
            >
              {/* Honeypot fields */}
              <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                className="absolute -left-[9999px]"
                aria-hidden="true"
              />
              <input
                type="tel"
                name="phone_number"
                autoComplete="off"
                tabIndex={-1}
                className="absolute -left-[9999px]"
                aria-hidden="true"
              />
              <input
                type="hidden"
                name="_timestamp"
                value={formLoadTime.toString()}
              />

              <h3 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6 text-center">
                Get in Touch
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                <div>
                  <label className="block text-xs md:text-sm text-gray-400 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2.5 md:px-4 md:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm text-gray-400 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 md:px-4 md:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="mb-3 md:mb-4">
                <label className="block text-xs md:text-sm text-gray-400 mb-1">
                  Club / Organisation Name
                </label>
                <input
                  type="text"
                  value={formData.clubName}
                  onChange={(e) =>
                    setFormData({ ...formData, clubName: e.target.value })
                  }
                  className="w-full px-3 py-2.5 md:px-4 md:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent"
                  placeholder="Your club name"
                />
              </div>

              <div className="mb-4 md:mb-6">
                <label className="block text-xs md:text-sm text-gray-400 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3 py-2.5 md:px-4 md:py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm md:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent resize-none"
                  placeholder="Tell us about your club and what you're looking for..."
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs md:text-sm mb-4 text-center">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#2B9EB3] text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-[#238a9c] transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Simple footer */}
      <footer className="py-6 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} PlayAway. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
