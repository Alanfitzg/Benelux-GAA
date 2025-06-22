import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-helpers";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/signin");
  }

  return <ProfileClient user={session.user} />;
}