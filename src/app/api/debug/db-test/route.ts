import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test basic database connection
    const eventCount = await prisma.event.count()
    const clubCount = await prisma.club.count()
    const userCount = await prisma.user.count()
    
    // Test new table
    let adminRequestCount = 0
    try {
      adminRequestCount = await prisma.clubAdminRequest.count()
    } catch (error) {
      console.error('ClubAdminRequest table error:', error)
    }
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        events: eventCount,
        clubs: clubCount,
        users: userCount,
        clubAdminRequests: adminRequestCount
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        dbHost: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        dbHost: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'
      }
    }, { status: 500 })
  }
}