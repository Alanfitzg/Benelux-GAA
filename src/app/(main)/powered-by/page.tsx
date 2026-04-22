"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Copy, Check, ChevronRight } from "lucide-react";

const CONTACT_EMAIL = "alan@gaelictrips.com";

export default function PoweredByPage() {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(CONTACT_EMAIL);
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
        <section className="flex-1 flex items-center justify-center py-16 md:py-24 px-4">
          <div className="w-full max-w-3xl mx-auto text-center">
            {/* PlayAway logo */}
            <div className="mb-8 md:mb-10 flex justify-center">
              <Image
                src="/sponsors/PLayAway Logo white - new.png"
                alt="PlayAway"
                width={480}
                height={240}
                className="h-24 md:h-32 w-auto object-contain"
                unoptimized
                priority
              />
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-200 mb-5 md:mb-6 leading-snug px-2">
              Data-led products at the intersection of travel, tourism, and
              sport
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-10 md:mb-14 leading-relaxed max-w-2xl mx-auto px-2">
              PlayAway is a digital studio specialising in data-led products
              powered by modern AI and web technology. We design and deliver
              focused solutions across travel, tourism, and sport.
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
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 max-w-lg mx-auto backdrop-blur-sm">
                <p className="text-gray-400 text-sm mb-3">
                  Drop us a line and we&apos;ll get back to you
                </p>
                <p className="text-[#2B9EB3] text-lg md:text-xl font-semibold break-all mb-5">
                  {CONTACT_EMAIL}
                </p>
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
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative py-6 px-4 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} PlayAway. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
