import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { Instagram, Facebook, Twitter } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Contact Us - Benelux GAA",
  description:
    "Get in touch with Benelux GAA. We're here to help with fixtures, clubs, and all things Gaelic Games in Belgium, the Netherlands, and Luxembourg.",
  keywords: [
    "contact Benelux GAA",
    "Benelux GAA email",
    "Gaelic games Belgium",
    "Gaelic games Netherlands",
    "Gaelic games Luxembourg",
  ],
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#1a3a4a] flex flex-col">
      <Header currentPage="Contact" />

      <main className="flex-1 pt-20 pb-8 sm:pt-24 sm:pb-12 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Get in Touch
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
              Have a question about Benelux GAA? Want to get involved with
              Gaelic Games in Belgium, the Netherlands, or Luxembourg? We&apos;d
              love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-12">
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Send us a message
              </h2>
              <ContactForm />
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#2B9EB3]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span>📧</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <a
                        href="mailto:secretary.benelux.europe@gaa.ie"
                        className="text-[#2B9EB3] hover:underline"
                      >
                        secretary.benelux.europe@gaa.ie
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        Official Benelux GAA Secretary
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-[#2B9EB3]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span>📍</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Region</h3>
                      <p className="text-gray-600">
                        Belgium, Netherlands &amp; Luxembourg
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Part of GAA Europe
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                  Follow Us
                </h2>
                <div className="flex justify-center gap-4">
                  <a
                    href="https://www.instagram.com/beneluxgaa/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl hover:opacity-80 transition-opacity duration-200"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href="https://www.facebook.com/BeneluxGAA/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-blue-600 rounded-xl hover:opacity-80 transition-opacity duration-200"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href="https://twitter.com/BeneluxGAA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-3 bg-black rounded-xl hover:opacity-80 transition-opacity duration-200"
                    aria-label="X (Twitter)"
                  >
                    <Twitter className="w-6 h-6 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
