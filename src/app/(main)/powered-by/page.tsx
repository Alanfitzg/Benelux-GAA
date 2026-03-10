"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Copy,
  Check,
  Globe,
  Code,
  Sparkles,
  Smartphone,
  ChevronRight,
} from "lucide-react";

const EMAIL = "alan@atlaslabz.com";

const services = [
  {
    icon: Globe,
    title: "Club Websites",
    description:
      "Beautiful, mobile-first websites tailored to your club's identity and community.",
  },
  {
    icon: Code,
    title: "Event & Tournament Platforms",
    description:
      "Registration, scheduling, and results — all in one place for your competitions.",
  },
  {
    icon: Smartphone,
    title: "Member Engagement",
    description:
      "Tools to keep your community informed, connected, and coming back.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Features",
    description:
      "Smart automation, content generation, and intelligent tools built into your platform.",
  },
];

export default function PoweredByPage() {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-950/30 via-transparent to-emerald-950/20 pointer-events-none" />

      <main className="relative flex-1 flex flex-col">
        {/* Back button */}
        <div className="w-full max-w-5xl mx-auto px-4 pt-6 md:pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm border border-white/10 px-4 py-2 rounded-full hover:border-white/25 hover:bg-white/5"
          >
            <ArrowLeft size={14} />
            Back to Benelux GAA
          </Link>
        </div>

        {/* Hero section */}
        <section className="flex-shrink-0 flex items-center justify-center py-16 md:py-24 px-4">
          <div className="w-full max-w-3xl mx-auto text-center">
            {/* GT Solutions wordmark */}
            <div className="mb-8 md:mb-10">
              <span className="text-3xl md:text-5xl font-bold tracking-tight">
                <span className="text-white">GT</span>
                <span className="text-[#2B9EB3]"> Solutions</span>
              </span>
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-200 mb-5 md:mb-6 leading-snug px-2">
              Digital Solutions for Sports Clubs Worldwide
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-10 md:mb-14 leading-relaxed max-w-2xl mx-auto px-2">
              GT Solutions builds modern websites, event platforms, and digital
              tools that help sports clubs and organisations connect with their
              communities and grow.
            </p>

            {/* CTA */}
            {!showEmail ? (
              <button
                type="button"
                onClick={() => setShowEmail(true)}
                className="group inline-flex items-center gap-2.5 bg-[#2B9EB3] text-white px-7 py-3.5 md:px-9 md:py-4 rounded-full font-semibold hover:bg-[#34b5cc] transition-all text-base md:text-lg shadow-lg shadow-[#2B9EB3]/20 hover:shadow-[#2B9EB3]/30"
              >
                <Mail size={20} />
                Get in Touch
                <ChevronRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            ) : (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 mx-2 max-w-lg mx-auto backdrop-blur-sm">
                <p className="text-gray-400 text-sm mb-3">
                  Drop us an email and we&apos;ll get back to you
                </p>
                <a
                  href={`mailto:${EMAIL}?subject=GT%20Solutions%20-%20Inquiry`}
                  className="text-[#2B9EB3] text-lg md:text-xl font-semibold hover:text-white transition-colors break-all"
                >
                  {EMAIL}
                </a>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <a
                    href={`mailto:${EMAIL}?subject=GT%20Solutions%20-%20Inquiry`}
                    className="inline-flex items-center gap-2 bg-[#2B9EB3] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#34b5cc] transition-colors text-sm"
                  >
                    <Mail size={16} />
                    Open Email
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 border border-white/15 text-gray-300 px-5 py-2.5 rounded-full font-medium hover:bg-white/5 transition-colors text-sm"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Services grid */}
        <section className="py-12 md:py-20 px-4">
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-[#2B9EB3] mb-10 md:mb-14">
              What We Do
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-7 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#2B9EB3]/10 flex items-center justify-center mb-4 group-hover:bg-[#2B9EB3]/15 transition-colors">
                    <service.icon size={20} className="text-[#2B9EB3]" />
                  </div>
                  <h3 className="text-white font-semibold text-base md:text-lg mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative py-6 px-4 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} GT Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
