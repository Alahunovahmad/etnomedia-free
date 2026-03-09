import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Обновляем роль пользователя
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role: 'ADMIN' }
    })

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
