import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import BeneluxAdminDashboard from "./BeneluxAdminDashboard";

export default async function AdminDashboard() {
  const session = await getServerSession();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return <BeneluxAdminDashboard />;
}
