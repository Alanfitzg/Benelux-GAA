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

    if (formData.get("website") || formData.get("phone_number")) {
      setSubmitted(true);
      return;
    }

    if (Date.now() - formLoadTime < 2000) {
      setSubmitted(true);
      return;
    }

    console.log("Newsletter signup:", email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <svg
          className="w-10 h-10 text-[#2B9EB3] mx-auto mb-3"
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
        <p className="text-gray-400 text-sm mt-1">Check your inbox soon.</p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full max-w-md mx-auto px-6 py-4 bg-[#2B9EB3] text-white rounded-xl font-bold hover:bg-[#238a9c] transition-colors text-sm"
      >
        Subscribe to Newsletter
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative space-y-3 max-w-md mx-auto"
    >
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
      <input type="hidden" name="_timestamp" value={formLoadTime.toString()} />

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-3.5 rounded-xl bg-white/15 border border-white/20 focus:outline-none focus:border-[#2B9EB3] focus:bg-white/20 text-white placeholder-white/50 text-sm backdrop-blur-sm transition-colors"
          required
          autoFocus
        />
        <button
          type="submit"
          className="px-6 py-3.5 bg-[#2B9EB3] text-white rounded-xl font-bold hover:bg-[#238a9c] transition-colors text-sm whitespace-nowrap"
        >
          Subscribe
        </button>
      </div>
      <p className="text-gray-500 text-[11px] tracking-wide">
        No spam, ever. Unsubscribe anytime.
      </p>
    </form>
  );
}
