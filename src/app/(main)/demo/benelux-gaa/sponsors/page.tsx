"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import { ExternalLink, Send, CheckCircle } from "lucide-react";

export default function SponsorsPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Sponsors" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Sponsors
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We are grateful to our sponsors who help support Gaelic Games
              across the Benelux region.
            </p>
          </div>

          {/* Main Sponsor */}
          <section className="mb-16">
            <div className="bg-gradient-to-br from-[#1a3a4a] to-[#2B9EB3] rounded-2xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg flex-shrink-0">
                  <div className="w-48 md:w-64 h-36 md:h-48 relative">
                    <Image
                      src="/sponsors/breagh.jpg"
                      alt="Breagh - Official Sponsor of Benelux GAA"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
                    Official Sponsor
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Breagh Recruitment
                  </h2>
                  <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
                    Specialists in construction recruitment. Breagh is proud to
                    support Gaelic Games across the Benelux region, helping our
                    community grow and thrive.
                  </p>
                  <a
                    href="https://breaghrecruitment.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1a3a4a] rounded-lg font-semibold hover:bg-white/90 transition-colors"
                  >
                    Visit Breagh
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Become a Sponsor */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Become a Sponsor
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Interested in supporting Gaelic Games in the Benelux? We&apos;d
                love to hear from you. Reach out to discuss sponsorship
                opportunities.
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Thank You!
                  </h3>
                  <p className="text-gray-600">
                    We&apos;ve received your inquiry and will be in touch soon.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-gray-50 rounded-xl p-6 md:p-8"
                >
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="companyName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        required
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none transition-all"
                        placeholder="Your company name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contactName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contact Name
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        required
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none transition-all"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none transition-all"
                        placeholder="you@company.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Tell us about your interest in sponsoring Benelux GAA..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1a3a4a] text-white rounded-lg font-semibold hover:bg-[#2B9EB3] transition-colors"
                    >
                      Send Inquiry
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
