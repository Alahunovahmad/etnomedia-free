import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем роль пользователя
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Очищаем кэш Next.js для всех страниц
    revalidatePath('/', 'layout')
    revalidatePath('/admin', 'layout')
    revalidatePath('/movie/[id]', 'page')
    revalidatePath('/series/[id]', 'page')

    return NextResponse.json({ 
      success: true,
      message: 'Кэш успешно очищен'
    })

  } catch (error) {
    console.error('Clear cache error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
