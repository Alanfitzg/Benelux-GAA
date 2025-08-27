import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { Instagram, Facebook, Twitter, Music2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch. We're here to help you connect with the global Gaelic Athletic Association community.",
  keywords: [
    "contact GAA Trips",
    "support",
    "help",
    "Gaelic Athletic Association",
    "GAA support",
    "customer service",
  ],
  openGraph: {
    title: "Contact Us",
    description:
      "Get in touch. We're here to help you connect with the global Gaelic Athletic Association community.",
    url: "https://gaa-trips.vercel.app/contact",
    type: "website",
  },
  alternates: {
    canonical: "https://gaa-trips.vercel.app/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question about GAA Trips? Want to suggest a club or event?
            We&apos;d love to hear from you and help you connect with the global
            GAA community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Send us a message
            </h2>
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">alan@gaelictrips.com</p>
                    <p className="text-sm text-gray-500 mt-1">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary">⏰</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Response Time
                    </h3>
                    <p className="text-gray-600">Monday - Friday</p>
                    <p className="text-sm text-gray-500 mt-1">
                      9:00 AM - 6:00 PM GMT
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Follow Us
              </h2>
              <div className="flex justify-center gap-4">
                <a
                  href="#"
                  className="flex items-center justify-center p-3 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl hover:opacity-80 transition-opacity duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6 text-white" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center p-3 bg-blue-600 rounded-xl hover:opacity-80 transition-opacity duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6 text-white" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center p-3 bg-black rounded-xl hover:opacity-80 transition-opacity duration-200"
                  aria-label="X (Twitter)"
                >
                  <Twitter className="w-6 h-6 text-white" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center p-3 bg-black rounded-xl hover:opacity-80 transition-opacity duration-200"
                  aria-label="TikTok"
                >
                  <Music2 className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
