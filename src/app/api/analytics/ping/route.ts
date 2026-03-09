import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { visitorId, path } = body || {}

    if (!visitorId || !path) {
      return NextResponse.json(
        { error: 'Missing required fields: visitorId, path' },
        { status: 400 }
      )
    }

    // Upsert visitor
    await prisma.analyticsVisitor.upsert({
      where: { visitorId },
      create: {
        visitorId,
        firstSeen: new Date(),
        lastSeen: new Date()
      },
      update: {
        lastSeen: new Date()
      }
    })

    // Create pageview
    await prisma.analyticsPageview.create({
      data: {
        visitorId,
        path
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics ping error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
