import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'
import { isRegistrationEnabled } from '@/lib/settings'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

async function generateJWT(userId: number, role: string): Promise<string> {
  return await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nonce = searchParams.get('nonce')

  if (!nonce) {
    return NextResponse.json(
      { error: 'Nonce is required' },
      { status: 400 }
    )
  }

  try {
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

    // Если статус COMPLETED - создаем/обновляем пользователя и генерируем JWT
    if (pendingAuth.status === 'COMPLETED') {
      // Проверяем есть ли данные Telegram
      if (!pendingAuth.telegramId) {
        return NextResponse.json(
          { error: 'Telegram data not found' },
          { status: 400 }
        )
      }

      // Ищем или создаем пользователя
      let user = await prisma.user.findUnique({
        where: { telegramId: pendingAuth.telegramId }
      })

      if (!user) {
        // Проверяем разрешена ли регистрация
        const registrationEnabled = await isRegistrationEnabled()
        if (!registrationEnabled) {
          return NextResponse.json(
            { error: 'Registration disabled' },
            { status: 403 }
          )
        }

        // Создаем нового пользователя
        user = await prisma.user.create({
          data: {
            telegramId: pendingAuth.telegramId,
            phoneNumber: pendingAuth.phoneNumber,
            role: 'USER'
          }
        })
      } else {
        // Обновляем номер телефона если есть
        if (pendingAuth.phoneNumber) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { phoneNumber: pendingAuth.phoneNumber }
          })
        }
      }

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Генерируем JWT
      const token = await generateJWT(user.id, user.role)

      // Устанавливаем HttpOnly куку
      const cookieStore = await cookies()
      cookieStore.set('etnomedia_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 дней
        path: '/'
      })

      // Удаляем запись из PendingAuth
      await prisma.pendingAuth.delete({
        where: { id: pendingAuth.id }
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          photoUrl: user.photoUrl,
          role: user.role
        }
      })
    }

    // Если статус PENDING - возвращаем статус ожидания
    if (pendingAuth.status === 'PENDING') {
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

      return NextResponse.json({
        success: false,
        status: 'PENDING',
        message: 'Waiting for authorization...'
      })
    }

    // Если статус EXPIRED
    if (pendingAuth.status === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Authorization expired' },
        { status: 410 }
      )
    }

    return NextResponse.json(
      { error: 'Unknown status' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Check status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
