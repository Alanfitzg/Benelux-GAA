"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Copy, Check } from "lucide-react";

const EMAIL = "secretary.benelux.europe@gaa.ie";

export default function PoweredByPage() {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <main className="flex-1 flex items-center justify-center py-8 md:py-12 px-4">
        <div className="w-full max-w-2xl mx-auto text-center">
          {/* Back button */}
          <div className="mb-6 md:mb-10">
            <Link
              href="/"
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
              alt="Benelux GAA"
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

          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-3 md:mb-4 leading-relaxed px-2">
            Benelux GAA is a dedicated technology service provider helping
            international sports clubs connect, grow, and thrive.
          </p>

          <p className="text-sm md:text-base text-gray-400 mb-6 md:mb-10 leading-relaxed px-2">
            We build custom websites, event management systems, and digital
            tools tailored specifically for GAA clubs and sporting organisations
            around the world.
          </p>

          {/* Contact Section */}
          {!showEmail ? (
            <button
              type="button"
              onClick={() => setShowEmail(true)}
              className="inline-flex items-center gap-2 bg-[#2B9EB3] text-white px-6 py-3 md:px-8 md:py-4 rounded-lg font-semibold hover:bg-[#238a9c] transition-colors text-base md:text-lg"
            >
              <Mail size={20} className="md:w-[22px] md:h-[22px]" />
              Get in Touch
            </button>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 mx-2">
              <p className="text-gray-400 text-sm mb-3">
                Drop us an email and we&apos;ll get back to you
              </p>
              <a
                href={`mailto:${EMAIL}?subject=Benelux GAA%20Inquiry`}
                className="text-[#2B9EB3] text-lg md:text-xl font-semibold hover:text-white transition-colors break-all"
              >
                {EMAIL}
              </a>
              <div className="mt-4 flex items-center justify-center gap-3">
                <a
                  href={`mailto:${EMAIL}?subject=Benelux GAA%20Inquiry`}
                  className="inline-flex items-center gap-2 bg-[#2B9EB3] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#238a9c] transition-colors text-sm"
                >
                  <Mail size={16} />
                  Open Email
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 border border-white/20 text-gray-300 px-5 py-2.5 rounded-lg font-medium hover:bg-white/5 transition-colors text-sm"
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
      </main>

      {/* Simple footer */}
      <footer className="py-6 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Benelux GAA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
