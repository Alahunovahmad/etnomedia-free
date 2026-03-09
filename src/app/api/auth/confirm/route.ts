import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

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
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing_token', request.url))
    }

    // Ищем сессию в базе данных
    const session = await prisma.authSession.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url))
    }

    if (session.status !== 'confirmed') {
      return NextResponse.redirect(new URL('/login?error=not_confirmed', request.url))
    }

    if (session.expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/login?error=expired', request.url))
    }

    if (!session.userId || !session.user) {
      return NextResponse.redirect(new URL('/login?error=no_user', request.url))
    }

    // Генерируем JWT
    const jwtToken = await generateJWT(session.userId, session.user.role)

    // Устанавливаем HttpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('etnomedia_session', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    })

    // Обновляем время подтверждения
    await prisma.authSession.update({
      where: { id: session.id },
      data: { confirmedAt: new Date() }
    })

    // Редирект на главную
    return NextResponse.redirect(new URL('/', request.url))

  } catch (error) {
    console.error('Auth confirm error:', error)
    return NextResponse.redirect(new URL('/login?error=server', request.url))
  }
}
