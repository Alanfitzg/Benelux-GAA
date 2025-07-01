import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/user"
import { UserRegistrationSchema } from "@/lib/validation/schemas"
import { ConflictError, withErrorHandler } from "@/lib/error-handlers"
import { validateBody } from "@/lib/validation/middleware"
import { sendEmail, getAdminEmails } from "@/lib/email"
import { generateNewUserNotificationEmail } from "@/lib/email-templates"

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

  // Send admin notification email (don't wait for it to complete)
  sendAdminNotification(user).catch(error => {
    console.error('Failed to send admin notification email:', error)
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
    message: "Account created successfully! Your account is pending approval from an administrator. You will receive an email notification once approved."
  }, { status: 201 })
}

// Helper function to send admin notifications
async function sendAdminNotification(user: any) {
  try {
    const adminEmails = await getAdminEmails()
    
    if (adminEmails.length === 0) {
      console.log('No admin emails found, skipping notification')
      return
    }

    // Get the base URL for admin panel links
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const adminPanelUrl = `${baseUrl}/admin`

    // Get user's club name if they have one
    let userClub: string | undefined
    if (user.clubId) {
      try {
        const { prisma } = await import('@/lib/prisma')
        const club = await prisma.club.findUnique({
          where: { id: user.clubId },
          select: { name: true }
        })
        userClub = club?.name
      } catch (error) {
        console.error('Failed to fetch club name:', error)
      }
    }

    const emailData = {
      userName: user.name || user.username,
      userEmail: user.email,
      userId: user.id,
      userClub,
      registrationDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      adminPanelUrl
    }

    const { subject, html, text } = generateNewUserNotificationEmail(emailData)

    const success = await sendEmail({
      to: adminEmails,
      subject,
      html,
      text
    })

    if (success) {
      console.log(`✅ Admin notification sent for new user: ${user.email}`)
    } else {
      console.error('❌ Failed to send admin notification email')
    }
  } catch (error) {
    console.error('Error in sendAdminNotification:', error)
  }
}

// Apply error handling wrapper
export const POST = withErrorHandler(registrationHandler)