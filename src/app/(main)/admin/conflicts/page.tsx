import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import { ConflictsDashboard } from "./ConflictsDashboard";

export const metadata: Metadata = {
  title: "Conflict Resolution | Admin | PlayAway",
  description: "Review and resolve event disputes",
};

export default async function ConflictsPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Conflict Resolution
          </h1>
          <p className="text-gray-400">
            Review and resolve event disputes from negative reviews
          </p>
        </div>
        <ConflictsDashboard />
      </div>
    </div>
  );
}
