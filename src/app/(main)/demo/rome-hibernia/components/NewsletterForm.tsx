"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formLoadTime] = useState(Date.now());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Check honeypot fields
    if (formData.get("website") || formData.get("phone_number")) {
      // Silent fail for bots
      setSubmitted(true);
      return;
    }

    // Check if form was submitted too quickly (bot behavior)
    if (Date.now() - formLoadTime < 2000) {
      // Silent fail for bots
      setSubmitted(true);
      return;
    }

    // Here you would submit to your newsletter API
    console.log("Newsletter signup:", email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <svg
          className="w-10 h-10 text-white mx-auto mb-3"
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
        <p className="text-white font-semibold">You&apos;re subscribed!</p>
        <p className="text-white/60 text-sm mt-1">Check your inbox soon.</p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full px-6 py-4 bg-white text-[#c41e3a] rounded-xl font-bold hover:bg-white/90 transition-colors text-sm"
      >
        Subscribe to Newsletter
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-3">
      {/* Honeypot fields - hidden from users */}
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        className="absolute -left-[9999px] opacity-0 h-0 w-0"
        aria-hidden="true"
      />
      <input
        type="tel"
        name="phone_number"
        autoComplete="off"
        tabIndex={-1}
        className="absolute -left-[9999px] opacity-0 h-0 w-0"
        aria-hidden="true"
      />
      {/* Hidden timestamp field */}
      <input type="hidden" name="_timestamp" value={formLoadTime.toString()} />

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-3.5 rounded-xl bg-white/15 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/20 text-white placeholder-white/50 text-sm backdrop-blur-sm transition-colors"
          required
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-3.5 bg-white text-[#c41e3a] rounded-xl font-bold hover:bg-white/90 transition-colors text-sm whitespace-nowrap"
        >
          Subscribe
        </button>
      </div>
      <p className="text-white/40 text-[11px] tracking-wide">
        No spam, ever. Unsubscribe anytime.
      </p>
    </form>
  );
}
