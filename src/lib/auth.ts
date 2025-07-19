import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { UserRole, AccountStatus } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      name?: string | null
      role: UserRole
      accountStatus: AccountStatus
    }
  }

  interface User {
    username: string
    role: UserRole
    accountStatus: AccountStatus
  }
}

export const authOptions = {
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days default
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const loginInput = (credentials.username as string).toLowerCase().trim()
        
        // Try to find user by email first, then by username
        let user = await prisma.user.findUnique({
          where: {
            email: loginInput,
          },
        })

        if (!user) {
          user = await prisma.user.findUnique({
            where: {
              username: loginInput,
            },
          })
        }

        if (!user) {
          return null
        }

        const passwordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordValid) {
          return null
        }

        // Check account status - allow approved and pending accounts to sign in
        // Rejected and suspended accounts cannot sign in
        if (user.accountStatus === 'REJECTED' || user.accountStatus === 'SUSPENDED') {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          accountStatus: user.accountStatus || 'APPROVED', // Default to APPROVED for existing users
        }
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.accountStatus = user.accountStatus
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as UserRole
        session.user.accountStatus = token.accountStatus as AccountStatus
      }
      return session
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)