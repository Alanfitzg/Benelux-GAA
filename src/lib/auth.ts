import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { UserRole, AccountStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      name?: string | null;
      role: UserRole;
      accountStatus: AccountStatus;
      hasPassword: boolean;
      clubId?: string | null;
      isClubMember?: boolean;
      createdAt?: Date;
    };
  }

  interface User {
    username: string;
    role: UserRole;
    accountStatus: AccountStatus;
    hasPassword?: boolean;
    clubId?: string | null;
    isClubMember?: boolean;
  }
}

export const authOptions = {
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days default
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: false, // Set to false for localhost development
      },
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const loginInput = (credentials.username as string)
          .toLowerCase()
          .trim();

        // Try to find user by email first, then by username
        let user = await prisma.user.findUnique({
          where: {
            email: loginInput,
          },
        });

        if (!user) {
          user = await prisma.user.findUnique({
            where: {
              username: loginInput,
            },
          });
        }

        if (!user) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordValid) {
          return null;
        }

        // Check account status - allow approved and pending accounts to sign in
        // Rejected and suspended accounts cannot sign in
        if (
          user.accountStatus === "REJECTED" ||
          user.accountStatus === "SUSPENDED"
        ) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
          accountStatus: user.accountStatus || "APPROVED", // Default to APPROVED for existing users
        };
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: any) {
      // Handle Google OAuth sign in
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        try {
          // Check if user already exists
          let existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!existingUser) {
            // Generate a unique username from email
            const baseUsername = email.split("@")[0].toLowerCase();
            let username = baseUsername;
            let counter = 1;

            // Ensure username is unique
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${baseUsername}${counter}`;
              counter++;
            }

            // Create new user with Google OAuth
            existingUser = await prisma.user.create({
              data: {
                email,
                username,
                name: user.name || undefined,
                password: "", // OAuth users don't have passwords
                role: "USER",
                accountStatus: "APPROVED", // Auto-approve Google users
                approvedAt: new Date(),
              },
            });
          } else {
            // User exists - check if they already have a Google account linked
            const existingGoogleAccount = await prisma.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: "google",
              },
            });

            if (!existingGoogleAccount) {
              // No Google account linked yet
              if (existingUser.password && existingUser.password !== "") {
                // This is a traditional account trying to sign in with Google
                // Create the OAuth account link
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    type: "oauth",
                    provider: "google",
                    providerAccountId: account.providerAccountId!,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                  },
                });
                console.log(`Linked Google account to existing user ${email}`);
              }
            }
          }

          // Update the user object with our database user data
          user.id = existingUser.id;
          user.username = existingUser.username;
          user.role = existingUser.role;
          user.accountStatus = existingUser.accountStatus;

          return true;
        } catch (error) {
          console.error("Error handling Google sign in:", error);
          return false;
        }
      }

      return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account }: any) {
      if (account?.provider === "google" && user) {
        // For Google sign in, fetch the user data from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.accountStatus = dbUser.accountStatus;
        }
      } else if (user) {
        // For credentials sign in
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.accountStatus = user.accountStatus;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as UserRole;
        session.user.accountStatus = token.accountStatus as AccountStatus;

        // Fetch user data including club information and password status
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            password: true,
            clubId: true,
            isClubMember: true,
            createdAt: true,
          },
        });

        session.user.hasPassword = !!(user?.password && user.password !== "");
        session.user.clubId = user?.clubId || null;
        session.user.isClubMember = user?.isClubMember || false;
        session.user.createdAt = user?.createdAt;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
