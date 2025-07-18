import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test events query similar to what the events page does
    const events = await prisma.event.findMany({
      take: 5,
      orderBy: {
        startDate: 'asc'
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        interests: {
          select: {
            id: true
          }
        }
      }
    })
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      eventsCount: events.length,
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        eventType: event.eventType,
        location: event.location,
        startDate: event.startDate,
        clubName: event.club?.name || 'No club',
        interestCount: event.interests.length
      }))
    })
  } catch (error) {
    console.error('Events test error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}