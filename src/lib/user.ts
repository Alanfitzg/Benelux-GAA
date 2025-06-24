import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function createUser(
  email: string,
  username: string,
  password: string,
  name?: string,
  role: UserRole = UserRole.USER,
  clubId?: string | null
) {
  const hashedPassword = await bcrypt.hash(password, 10)
  
  return prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      name,
      role,
      clubId,
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