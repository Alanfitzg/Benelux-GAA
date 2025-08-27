import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/auth-helpers"
import { UserRole } from "@prisma/client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/signin")
  }

  if (session.user.role !== UserRole.SUPER_ADMIN && session.user.role !== UserRole.GUEST_ADMIN && session.user.role !== UserRole.CLUB_ADMIN) {
    redirect("/")
  }

  return <>{children}</>
}