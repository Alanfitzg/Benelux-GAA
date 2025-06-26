import { Suspense } from "react";
import Link from "next/link";
import SurveyForm from "@/components/SurveyForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan Custom GAA Trip | GAA Trips",
  description:
    "Tell us your GAA travel needs and interests. Share your preferences so we can create the perfect custom travel experience for your club.",
  keywords: [
    "GAA custom trip",
    "GAA club travel",
    "Gaelic sports travel",
    "GAA trip planning",
    "Irish sports travel planning",
  ],
  openGraph: {
    title: "Plan Custom GAA Trip | GAA Trips",
    description:
      "Tell us your GAA travel needs and we'll create the perfect custom experience for your club.",
    url: "https://gaa-trips.vercel.app/survey",
    type: "website",
  },
  alternates: {
    canonical: "https://gaa-trips.vercel.app/survey",
  },
};

function SurveyComplete() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-6">
          Your custom trip request has been submitted successfully. We
          appreciate you sharing your travel preferences with us.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            What happens next?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • We&apos;ll review your travel preferences and requirements
            </li>
            <li>
              • Our team will reach out with custom trip options for your club
            </li>
            <li>
              • We&apos;ll help plan the perfect GAA travel experience based on
              your needs
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <Link
            href="/events"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Events
          </Link>
          <br />
          <Link
            href="/"
            className="inline-block text-primary hover:text-primary/80 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SurveyPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string }>;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tell us about your club&apos;s travel preferences and we&apos;ll try
            to create the perfect custom GAA experience tailored to your needs
            and budget.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <span className="inline-flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Takes about 5-7 minutes
            </span>
          </div>
        </div>

        <Suspense
          fallback={<div className="text-center">Loading trip planner...</div>}
        >
          <SurveyFormWrapper searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function SurveyFormWrapper({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const eventId = params.eventId;
  const completed = params.completed === "true";

  if (completed) {
    return <SurveyComplete />;
  }

  return <SurveyForm eventId={eventId} />;
}
