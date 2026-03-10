import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from './prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

export interface User {
  id: number
  telegramId: string | null
  phoneNumber: string | null
  firstName: string | null
  lastName: string | null
  username: string | null
  photoUrl: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('etnomedia_session')?.value

    if (!token) {
      return null
    }

    // Верификация JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = (payload as any).userId

    if (!userId) {
      return null
    }

    // Получение данных пользователя из БД
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    return user

  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('etnomedia_session')
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN'
}

export function isUser(user: User | null): boolean {
  return user?.role === 'USER'
}
