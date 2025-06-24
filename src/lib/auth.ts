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

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
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

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username as string,
          },
        })

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

        // Check account status - only allow approved accounts to sign in
        // Temporarily disabled for migration - TODO: Re-enable after database migration
        // if (user.accountStatus !== 'APPROVED') {
        //   return null
        // }

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.accountStatus = user.accountStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as UserRole
        session.user.accountStatus = token.accountStatus as AccountStatus
      }
      return session
    },
  },
})