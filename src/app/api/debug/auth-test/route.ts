import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Test NextAuth configuration
    const session = await auth()
    
    // Test bcrypt (used in registration)
    const testPassword = 'TestPassword123!'
    const hashedPassword = await bcrypt.hash(testPassword, 12)
    const isValidPassword = await bcrypt.compare(testPassword, hashedPassword)
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      auth: {
        hasSession: !!session,
        sessionUser: session?.user?.username || null,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nextAuthSecret: process.env.NEXTAUTH_SECRET ? '***SET***' : 'NOT SET'
      },
      bcrypt: {
        canHash: !!hashedPassword,
        canCompare: isValidPassword,
        hashLength: hashedPassword.length
      },
      email: {
        hasResendApiKey: !!process.env.RESEND_API_KEY,
        resendFromEmail: process.env.RESEND_FROM_EMAIL || 'NOT SET'
      }
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}