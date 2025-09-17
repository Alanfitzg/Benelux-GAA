import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/user"
import { UserRegistrationSchema } from "@/lib/validation/schemas"
import { ConflictError, withErrorHandler } from "@/lib/error-handlers"
import { validateBody } from "@/lib/validation/middleware"
import { sendEmail } from "@/lib/email"
import { generateWelcomeEmail } from "@/lib/email-templates"
import { AccountStatus } from "@prisma/client"

async function registrationHandler(request: NextRequest) {
  // Get the raw body first to extract additional fields
  const body = await request.json()
  
  // Validate required fields using Zod schema
  const { email, username, password, name } = await validateBody({ json: async () => body } as NextRequest, UserRegistrationSchema)
  
  // Extract additional fields
  const { clubId, isClubMember } = body

  // Normalize input data
  const normalizedEmail = email.toLowerCase().trim()
  const normalizedUsername = username.toLowerCase().trim()
  const normalizedName = name?.trim() || undefined

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

  // All users are now auto-approved
  const accountStatus = AccountStatus.APPROVED
  
  // Create user with optional club association
  const user = await createUser(
    normalizedEmail, 
    normalizedUsername, 
    password, 
    normalizedName, 
    undefined, 
    clubId || null, 
    accountStatus,
    isClubMember || false
  )

  // Send welcome email to the new user (all users are approved)
  sendWelcomeEmail(user, true).catch(error => {
    console.error('Failed to send welcome email:', error)
  })

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
    message: "Account created successfully! You can now sign in and start using GAA Trips."
  }, { status: 201 })
}


// Helper function to send welcome email
async function sendWelcomeEmail(user: {
  id: string;
  email: string;
  name: string | null;
  username: string;
}, isApproved: boolean) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const loginUrl = `${baseUrl}/signin`

    const emailData = {
      userName: user.name || user.username,
      userEmail: user.email,
      loginUrl,
      isApproved
    }

    const { subject, html, text } = generateWelcomeEmail(emailData)

    const success = await sendEmail({
      to: user.email,
      subject,
      html,
      text
    })

    if (success) {
      console.log(`✅ Welcome email sent to: ${user.email}`)
    } else {
      console.error('❌ Failed to send welcome email')
    }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error)
  }
}

// Apply error handling wrapper
export const POST = withErrorHandler(registrationHandler)