import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Генерируем уникальный nonce
    const nonce = randomBytes(32).toString('hex')
    
    // Создаем запись в PendingAuth
    const pendingAuth = await prisma.pendingAuth.create({
      data: {
        nonce,
        status: 'PENDING'
      }
    })

    // Очищаем старые записи (старше 5 минут)
    await prisma.pendingAuth.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 5 * 60 * 1000) // 5 минут
        },
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      nonce: pendingAuth.nonce
    })
  } catch (error) {
    console.error('Auth init error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
