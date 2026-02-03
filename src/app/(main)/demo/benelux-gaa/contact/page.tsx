"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import EditableText from "../components/EditableText";
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Mail,
  MapPin,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react";

const CLUB_ID = "benelux-gaa";

interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  twitter: string;
}

const defaultSocialLinks: SocialLinks = {
  instagram: "https://www.instagram.com/beneluxgaa/",
  facebook: "https://www.facebook.com/BeneluxGAA/",
  youtube: "",
  twitter: "https://twitter.com/BeneluxGAA",
};

export default function ContactPage() {
  const [socialLinks, setSocialLinks] =
    useState<SocialLinks>(defaultSocialLinks);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    club: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [formLoadTime] = useState(Date.now());

  useEffect(() => {
    fetch(`/api/club-content?clubId=${CLUB_ID}&pageKey=settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          const links = { ...defaultSocialLinks };
          Object.entries(data.content).forEach(([key, val]) => {
            const platform = key.replace("social_", "") as keyof SocialLinks;
            if (platform in links) {
              const value = (val as { value: string }).value;
              if (value) {
                links[platform] = value;
              }
            }
          });
          setSocialLinks(links);
        }
      })
      .catch(() => {});
  }, []);

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `Benelux GAA: ${formData.subject}`,
          message: formData.club
            ? `Club: ${formData.club}\n\n${formData.message}`
            : formData.message,
        }),
      });

      if (response.ok) {
        setSent(true);
        setFormData({
          name: "",
          email: "",
          club: "",
          subject: "",
          message: "",
        });
      } else {
        setError("Failed to send message. Please try again.");
      }
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const socialButtons = [
    {
      key: "instagram",
      href: socialLinks.instagram,
      icon: Instagram,
      label: "Instagram",
      style: {
        background:
          "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      },
    },
    {
      key: "facebook",
      href: socialLinks.facebook,
      icon: Facebook,
      label: "Facebook",
      className: "bg-[#1877f2]",
    },
    {
      key: "twitter",
      href: socialLinks.twitter,
      icon: Twitter,
      label: "Twitter",
      className: "bg-black",
    },
    {
      key: "youtube",
      href: socialLinks.youtube,
      icon: Youtube,
      label: "YouTube",
      className: "bg-[#ff0000]",
    },
  ];

  const activeSocialButtons = socialButtons.filter((btn) => btn.href);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Contact" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <EditableText
                pageKey="contact"
                contentKey="title"
                defaultValue="Get in Touch"
                maxLength={30}
              />
            </h1>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">
              <EditableText
                pageKey="contact"
                contentKey="subtitle"
                defaultValue="Have a question about Benelux GAA? Want to join a club or start one? We'd love to hear from you!"
                maxLength={150}
              />
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Info */}
            <div>
              {/* Social Media */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Connect With Us
                </h2>
                <div className="flex flex-wrap gap-3">
                  {activeSocialButtons.map((btn) => {
                    const Icon = btn.icon;
                    return (
                      <a
                        key={btn.key}
                        href={btn.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity ${btn.className || ""}`}
                        style={btn.style}
                      >
                        <Icon size={18} />
                        <span>{btn.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Email */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Email Us
                </h2>
                <a
                  href="mailto:secretary.benelux.europe@gaa.ie"
                  className="inline-flex items-center gap-2 text-[#2B9EB3] hover:text-[#1a3a4a] transition-colors"
                >
                  <Mail size={20} />
                  <span className="text-lg">
                    secretary.benelux.europe@gaa.ie
                  </span>
                </a>
              </div>

              {/* Region Info */}
              <div className="bg-[#1a3a4a] rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={20} className="text-[#2B9EB3]" />
                  <h2 className="text-lg font-semibold">Our Region</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Benelux GAA covers Belgium, Netherlands, and Luxembourg with
                  16 clubs and over 1,000 members across 4 countries.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-1">🇧🇪</div>
                    <div className="text-sm text-gray-400">Belgium</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🇳🇱</div>
                    <div className="text-sm text-gray-400">Netherlands</div>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🇱🇺</div>
                    <div className="text-sm text-gray-400">Luxembourg</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              {sent ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <CheckCircle
                    size={48}
                    className="mx-auto text-green-500 mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for getting in touch. We&apos;ll respond as soon
                    as possible.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-[#2B9EB3] font-medium hover:text-[#1a3a4a] transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-xl p-6 md:p-8 border-2 border-gray-200 shadow-lg shadow-gray-200/50"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Send us a Message
                  </h2>

                  {/* Honeypot fields */}
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
                  <input
                    type="hidden"
                    name="_timestamp"
                    value={formLoadTime.toString()}
                  />

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent transition-shadow"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent transition-shadow"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Club (optional)
                      </label>
                      <input
                        type="text"
                        value={formData.club}
                        onChange={(e) =>
                          setFormData({ ...formData, club: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent transition-shadow"
                        placeholder="Your club name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent transition-shadow bg-white"
                      >
                        <option value="">Select a topic</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Join a Club">Join a Club</option>
                        <option value="Start a Club">Start a Club</option>
                        <option value="Sponsorship">Sponsorship</option>
                        <option value="Media Inquiry">Media Inquiry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2B9EB3] focus:border-transparent transition-shadow resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm text-center">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#2B9EB3] text-white rounded-lg font-semibold hover:bg-[#238a9c] transition-colors disabled:opacity-50"
                    >
                      {sending ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
