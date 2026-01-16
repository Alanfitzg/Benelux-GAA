import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { FinancialsClient } from "./FinancialsClient";

export const metadata: Metadata = {
  title: "Financials | Club Admin | PlayAway",
  description:
    "Track your earnings, potential revenue, and manage bank details for payouts",
};

export default async function FinancialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/signin");
  }

  // Check if user is authorized to view this club's data
  const club = await prisma.club.findFirst({
    where: {
      id,
      OR: [
        {
          admins: {
            some: {
              id: session.user.id,
            },
          },
        },
        {
          id: session.user.role === "SUPER_ADMIN" ? id : undefined,
        },
      ],
    },
    select: {
      id: true,
      name: true,
      isMainlandEurope: true,
      admins: { select: { id: true } },
    },
  });

  if (!club) {
    redirect("/");
  }

  // Only European clubs should see this page (they're the hosts)
  if (!club.isMainlandEurope) {
    redirect(`/club-admin/${id}`);
  }

  const isClubAdmin = club.admins.some((admin) => admin.id === session.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        <FinancialsClient
          clubId={id}
          clubName={club.name}
          canEditBankDetails={isClubAdmin}
        />
      </div>
    </div>
  );
}
