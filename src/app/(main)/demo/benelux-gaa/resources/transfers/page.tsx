"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import InternalLink from "../../components/InternalLink";
import { ArrowLeft, RefreshCcw, ExternalLink, AlertCircle } from "lucide-react";

export default function TransfersPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header currentPage="Resources" />

      <main className="flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32">
        <div className="max-w-4xl mx-auto px-4">
          <InternalLink
            href="/resources"
            className="inline-flex items-center gap-2 text-[#2B9EB3] hover:text-[#1a3a4a] mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Resources
          </InternalLink>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center">
              <RefreshCcw size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
              <p className="text-gray-600">
                Player registration and transfer information
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <p>
              All GAA players must be registered with a club. If you&apos;re
              moving clubs or registering for the first time, here&apos;s what
              you need to know.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={24}
                className="text-blue-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Transfer Windows
                </h3>
                <p className="text-gray-600 text-sm">
                  GAA transfers typically occur during designated transfer
                  windows. Contact your club secretary for current deadlines and
                  requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                New Player Registration
              </h3>
              <p className="text-gray-600 mb-4">
                If you&apos;ve never played GAA before, you can register
                directly with your local club. They will help you complete the
                registration process through Foireann.
              </p>
              <InternalLink
                href="/clubs"
                className="text-[#2B9EB3] font-medium hover:text-[#1a3a4a] transition-colors"
              >
                Find a club near you →
              </InternalLink>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Transferring Between Clubs
              </h3>
              <p className="text-gray-600 mb-4">
                To transfer from one club to another, you&apos;ll need to:
              </p>
              <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-4">
                <li>Request a transfer through Foireann</li>
                <li>Have your current club approve the transfer</li>
                <li>Have your new club accept the transfer</li>
                <li>
                  Wait for the transfer to be processed by the County Board
                </li>
              </ol>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                International Transfers
              </h3>
              <p className="text-gray-600 mb-4">
                Moving to or from the Benelux? International transfers require
                additional approval from the respective GAA boards. Allow extra
                time for processing.
              </p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Need Help with a Transfer?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact your club secretary or reach out to Benelux GAA for
              assistance with the transfer process.
            </p>
            <InternalLink
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              Contact Us
            </InternalLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
