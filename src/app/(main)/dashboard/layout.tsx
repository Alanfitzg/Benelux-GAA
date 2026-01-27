import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/signin");
  }

  // Allow access to dashboard for all authenticated users
  // Individual dashboard pages will handle role-specific permissions
  return <>{children}</>;
}
