import type { Metadata } from "next";
import { Mail, Instagram, Facebook, MapPin } from "lucide-react";
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
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Get in Touch
            </h1>
            <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
              Have a question about Benelux GAA? Want to get involved with
              Gaelic Games in Belgium, the Netherlands, or Luxembourg?
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#2B9EB3]/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#2B9EB3]" />
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Email Us
              </h2>
              <a
                href="mailto:secretary.benelux.europe@gaa.ie"
                className="text-lg sm:text-xl text-[#2B9EB3] hover:underline font-medium"
              >
                secretary.benelux.europe@gaa.ie
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Official Benelux GAA Secretary
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>
                Belgium, Netherlands &amp; Luxembourg — Part of GAA Europe
              </span>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Follow Us
              </h3>
              <div className="flex justify-center gap-4">
                <a
                  href="https://www.instagram.com/beneluxgaa_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl hover:opacity-80 transition-opacity duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a
                  href="https://www.facebook.com/GAAbenelux/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-blue-600 rounded-xl hover:opacity-80 transition-opacity duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
