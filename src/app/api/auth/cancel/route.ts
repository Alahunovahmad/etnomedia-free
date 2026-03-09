import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { nonce } = await request.json()

    if (!nonce) {
      return NextResponse.json(
        { error: 'Nonce is required' },
        { status: 400 }
      )
    }

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

    // Обновляем статус на EXPIRED (сжигаем токен)
    await prisma.pendingAuth.update({
      where: { id: pendingAuth.id },
      data: { status: 'EXPIRED' }
    })

    return NextResponse.json({
      success: true,
      message: 'Authorization cancelled'
    })
  } catch (error) {
    console.error('Cancel auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
