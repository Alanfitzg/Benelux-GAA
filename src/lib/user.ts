import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole, AccountStatus } from "@prisma/client"

export async function createUser(
  email: string,
  username: string,
  password: string,
  name?: string,
  role: UserRole = UserRole.USER,
  clubId?: string | null,
  accountStatus: AccountStatus = AccountStatus.PENDING,
  isClubMember: boolean = false
) {
  const hashedPassword = await bcrypt.hash(password, 10)
  
  return prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name,
      role,
      club: clubId ? { connect: { id: clubId } } : undefined,
      accountStatus,
      approvedAt: accountStatus === AccountStatus.APPROVED ? new Date() : undefined,
    },
  })
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      club: true,
      adminOfClubs: true,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      club: true,
      adminOfClubs: true,
    },
  })
}