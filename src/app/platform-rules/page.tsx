import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Platform Rules & Laws | PlayAway",
  description:
    "Legal requirements, EU regulations, and compliance guidelines for hosting on PlayAway.",
};

export default function PlatformRulesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1a3352] to-[#264673] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Platform Rules & Laws
            </h1>
            <p className="text-xl text-blue-100">
              Legal requirements and compliance guidelines for hosting on
              PlayAway.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Coming Soon Notice */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Documentation Coming Soon
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We&apos;re finalising the comprehensive platform rules and legal
              compliance documentation. This page will be updated shortly.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              In the meantime, please review our Host Terms for key information
              about hosting on PlayAway.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/host-terms"
                className="inline-flex items-center gap-2 bg-[#1a3352] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#264673] transition-colors"
              >
                View Host Terms
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                View Products Guide
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <Link
              href="/terms"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Terms & Conditions
              </h3>
              <p className="text-sm text-gray-600">
                General platform terms for all users
              </p>
            </Link>
            <Link
              href="/privacy"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Privacy Policy
              </h3>
              <p className="text-sm text-gray-600">How we handle your data</p>
            </Link>
            <Link
              href="/legal"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-2">
                Legal Compliance
              </h3>
              <p className="text-sm text-gray-600">
                Our regulatory compliance information
              </p>
            </Link>
            <Link
              href="/contact"
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-sm text-gray-600">
                Have questions? Get in touch
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
