import { Metadata } from "next";
import { ReviewFormClient } from "./ReviewFormClient";

export const metadata: Metadata = {
  title: "Share Your Experience | PlayAway",
  description: "Share your feedback about your recent event experience",
};

interface ReviewPageProps {
  params: Promise<{ token: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ReviewFormClient token={token} />
    </div>
  );
}
