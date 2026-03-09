import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRegistrationEnabled } from '@/lib/settings'
import crypto from 'crypto'

// Функция для валидации подписи Telegram
function validateTelegramAuth(query: any): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not found')
    return false
  }

  const authData = { ...query }
  const hash = authData.hash
  delete authData.hash

  if (!authData.id || !authData.auth_date) {
    return false
  }

  const dataCheckString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n')

  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  return hmac === hash
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nonce, telegramData } = body

    if (!nonce || !telegramData) {
      return NextResponse.json(
        { error: 'Nonce and telegramData are required' },
        { status: 400 }
      )
    }

    // Валидация данных Telegram
    if (!validateTelegramAuth(telegramData)) {
      return NextResponse.json(
        { error: 'Invalid Telegram auth data' },
        { status: 400 }
      )
    }

    // Извлекаем данные из Telegram
    const telegramId = telegramData.id
    const firstName = telegramData.first_name
    const lastName = telegramData.last_name
    const username = telegramData.username
    const photoUrl = telegramData.photo_url

    // Ищем запись в PendingAuth
    const pendingAuth = await prisma.pendingAuth.findUnique({
      where: { nonce }
    })

    if (!pendingAuth) {
      return NextResponse.json(
        { error: 'Invalid nonce' },
        { status: 404 }
      )
    }

    if (pendingAuth.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Authorization already processed' },
        { status: 400 }
      )
    }

    // Проверяем, не истекло ли время (5 минут)
    const isExpired = Date.now() - pendingAuth.createdAt.getTime() > 5 * 60 * 1000
    if (isExpired) {
      await prisma.pendingAuth.update({
        where: { id: pendingAuth.id },
        data: { status: 'EXPIRED' }
      })
      
      return NextResponse.json(
        { error: 'Authorization expired' },
        { status: 410 }
      )
    }

    // Ищем пользователя по telegramId
    let user = await prisma.user.findUnique({
      where: { telegramId }
    })

    if (!user) {
      // Проверяем, разрешена ли регистрация
      const registrationEnabled = await isRegistrationEnabled()
      if (!registrationEnabled) {
        await prisma.pendingAuth.update({
          where: { id: pendingAuth.id },
          data: { status: 'EXPIRED' }
        })
        return NextResponse.json(
          { error: 'Registration disabled' },
          { status: 403 }
        )
      }

      // Создаем нового пользователя
      user = await prisma.user.create({
        data: {
          telegramId,
          firstName,
          lastName: lastName || null,
          username: username || null,
          photoUrl: photoUrl || null,
          role: 'USER'
        }
      })
    } else {
      // Обновляем данные существующего пользователя
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          username: username || user.username,
          photoUrl: photoUrl || user.photoUrl,
        }
      })
    }

    // Обновляем статус PendingAuth
    await prisma.pendingAuth.update({
      where: { id: pendingAuth.id },
      data: {
        status: 'COMPLETED',
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Authorization completed'
    })
  } catch (error) {
    console.error('Telegram bot auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
