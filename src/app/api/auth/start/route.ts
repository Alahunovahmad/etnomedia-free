import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Генерация уникального токена
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export async function POST() {
  try {
    const token = generateToken()
    
    // Создаем сессию авторизации
    const session = await prisma.authSession.create({
      data: {
        token,
        status: 'pending',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
      }
    })

    // Формируем ссылку на бота
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'etnomedia_free_bot'
    const telegramUrl = `https://t.me/${botUsername}?start=${token}`

    return NextResponse.json({
      success: true,
      token,
      telegramUrl
    })

  } catch (error) {
    console.error('Auth start error:', error)
    return NextResponse.json(
      { error: 'Failed to start authentication' },
      { status: 500 }
    )
  }
}
