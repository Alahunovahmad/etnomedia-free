import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'
import { isRegistrationEnabled } from '@/lib/settings'
import crypto from 'crypto'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

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

  // Проверяем обязательные поля
  if (!authData.id || !authData.auth_date) {
    return false
  }

  // Создаем проверочную строку
  const dataCheckString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n')

  // Создаем HMAC-SHA256
  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  return hmac === hash
}

// Генерация JWT токена
async function generateJWT(userId: number, role: string): Promise<string> {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())

    // Валидация подписи Telegram
    if (!validateTelegramAuth(query)) {
      console.error('Invalid Telegram auth signature')
      return NextResponse.redirect(new URL('/login?error=invalid', request.url))
    }

    const telegramId = query.id
    const firstName = query.first_name
    const lastName = query.last_name
    const username = query.username
    const photoUrl = query.photo_url

    // Поиск или создание пользователя
    let user = await prisma.user.findUnique({
      where: { telegramId }
    })

    if (!user) {
      // Проверяем, разрешена ли регистрация
      const registrationEnabled = await isRegistrationEnabled()
      if (!registrationEnabled) {
        return NextResponse.redirect(new URL('/login?error=registration_disabled', request.url))
      }

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
      // Обновление данных пользователя
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

    // Генерация JWT
    const token = await generateJWT(user.id, user.role)

    // Установка HttpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('etnomedia_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    })

    // Редирект на главную
    return NextResponse.redirect(new URL('/', request.url))

  } catch (error) {
    console.error('Telegram auth error:', error)
    return NextResponse.redirect(new URL('/login?error=server', request.url))
  }
}
