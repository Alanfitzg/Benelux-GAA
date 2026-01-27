import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import { ConflictDetailClient } from "./ConflictDetailClient";

export const metadata: Metadata = {
  title: "Conflict Details | Admin | PlayAway",
  description: "Review conflict details and resolve dispute",
};

interface ConflictDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConflictDetailPage({
  params,
}: ConflictDetailPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/signin");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ConflictDetailClient conflictId={id} />
      </div>
    </div>
  );
}
