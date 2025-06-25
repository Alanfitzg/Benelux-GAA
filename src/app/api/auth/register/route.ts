import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/user"
import { UserRegistrationSchema } from "@/lib/validation/schemas"
import { ConflictError, withErrorHandler } from "@/lib/error-handlers"
import { validateBody } from "@/lib/validation/middleware"

async function registrationHandler(request: NextRequest) {
  // Validate request body using Zod schema
  const { email, username, password, name, clubId } = await validateBody(request, UserRegistrationSchema)

  // Normalize input data
  const normalizedEmail = email.toLowerCase().trim()
  const normalizedUsername = username.toLowerCase().trim()
  const normalizedName = name.trim()

  // Check for existing users
  const [existingUserByEmail, existingUserByUsername] = await Promise.all([
    getUserByEmail(normalizedEmail),
    getUserByUsername(normalizedUsername)
  ])

  if (existingUserByEmail) {
    throw new ConflictError("An account with this email already exists")
  }

  if (existingUserByUsername) {
    throw new ConflictError("This username is already taken")
  }

  // Create user
  const user = await createUser(normalizedEmail, normalizedUsername, password, normalizedName, undefined, clubId)

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      accountStatus: user.accountStatus,
    },
    message: "Account created successfully! Your account is pending approval from an administrator. You will receive an email notification once approved."
  }, { status: 201 })
}

// Apply error handling wrapper
export const POST = withErrorHandler(registrationHandler)