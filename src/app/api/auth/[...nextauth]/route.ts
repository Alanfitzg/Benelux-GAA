import { handlers } from "@/lib/auth"

// Note: Rate limiting for NextAuth is handled at the middleware level
// to avoid interfering with the NextAuth internal flow
export const { GET, POST } = handlers