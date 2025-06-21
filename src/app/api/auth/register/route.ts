import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/user"
import { createUserSchema, sanitizeInput, validateRequest } from "@/lib/validation"
import { ConflictError, handleApiError } from "@/lib/error-handling"
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

async function registrationHandler(request: NextRequest) {
  try {
    // Get and validate request body
    const body = await request.json()
    const validation = validateRequest(createUserSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: { type: "VALIDATION_ERROR", message: validation.error } },
        { status: 400 }
      )
    }

    const { email, username, password, name } = validation.data

    // Sanitize input data
    const sanitizedEmail = sanitizeInput(email.toLowerCase())
    const sanitizedUsername = sanitizeInput(username.toLowerCase())
    const sanitizedName = name ? sanitizeInput(name) : undefined

    // Check for existing users
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      getUserByEmail(sanitizedEmail),
      getUserByUsername(sanitizedUsername)
    ])

    if (existingUserByEmail) {
      throw new ConflictError("An account with this email already exists")
    }

    if (existingUserByUsername) {
      throw new ConflictError("This username is already taken")
    }

    // Create user
    const user = await createUser(sanitizedEmail, sanitizedUsername, password, sanitizedName)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      message: "Account created successfully"
    }, { status: 201 })

  } catch (error) {
    return handleApiError(error, "User registration")
  }
}

// Apply rate limiting to registration endpoint
export const POST = withRateLimit(RATE_LIMITS.REGISTRATION, registrationHandler)