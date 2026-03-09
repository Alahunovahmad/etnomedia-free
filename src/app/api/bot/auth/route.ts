import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRegistrationEnabled } from '@/lib/settings'


// Простая аутентификация для бота (через заголовок или API ключ)
function authenticateBot(request: NextRequest): boolean {
  const botToken = request.headers.get('x-bot-token')
  const expectedToken = process.env.TELEGRAM_BOT_TOKEN
  
  // В реальном проекте здесь должна быть более надежная аутентификация
  return botToken === expectedToken
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем аутентификацию бота
    if (!authenticateBot(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token, telegramId, phoneNumber, firstName, lastName, username } = body

    // Валидация обязательных полей
    if (!token || !telegramId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: token, telegramId, phoneNumber' },
        { status: 400 }
      )
    }

    // Ищем сессию
    const session = await prisma.authSession.findUnique({
      where: { token }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 404 }
      )
    }

    // Проверяем статус сессии
    if (session.status !== 'pending') {
      return NextResponse.json(
        { error: 'Session already processed' },
        { status: 400 }
      )
    }

    // Проверяем время жизни сессии
    if (session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 400 }
      )
    }

    // Находим или создаем пользователя
    let user = await prisma.user.findUnique({
      where: { telegramId }
    })

    if (!user) {
      // Проверяем, разрешена ли регистрация новых пользователей
      const registrationEnabled = await isRegistrationEnabled()
      if (!registrationEnabled) {
        return NextResponse.json(
          { error: 'Registration is currently disabled', message: 'Регистрация новых пользователей временно отключена' },
          { status: 403 }
        )
      }

      user = await prisma.user.create({
        data: {
          telegramId,
          firstName: firstName || null,
          lastName: lastName || null,
          username: username || null,
          phoneNumber: phoneNumber || null,
          role: 'USER'
        }
      })
    } else {
      // Обновляем данные пользователя
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          username: username || user.username,
          phoneNumber: phoneNumber || user.phoneNumber,
          updatedAt: new Date()
        }
      })
    }

    // Обновляем сессию
    const updatedSession = await prisma.authSession.update({
      where: { id: session.id },
      data: {
        status: 'confirmed',
        userId: user.id,
        telegramId,
        phoneNumber,
        confirmedAt: new Date()
      },
      include: { user: true }
    })

    // Формируем Magic Link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const magicLink = `${baseUrl}/api/auth/confirm?token=${token}`

    return NextResponse.json({
      success: true,
      magicLink,
      user: {
        id: user.id,
        firstName: user.firstName,
        telegramId: user.telegramId
      },
      session: {
        id: updatedSession.id,
        token: updatedSession.token,
        status: updatedSession.status
      }
    })

  } catch (error) {
    console.error('Bot auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET метод для проверки статуса сессии (для бота)
export async function GET(request: NextRequest) {
  try {
    if (!authenticateBot(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      )
    }

    const session = await prisma.authSession.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        confirmedAt: session.confirmedAt,
        userId: session.userId,
        telegramId: session.telegramId,
        phoneNumber: session.phoneNumber,
        user: session.user ? {
          id: session.user.id,
          firstName: session.user.firstName,
          telegramId: session.user.telegramId
        } : null
      }
    })

  } catch (error) {
    console.error('Bot auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
