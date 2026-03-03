import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
