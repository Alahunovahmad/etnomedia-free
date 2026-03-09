import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface SupportRequest {
  category: string
  message: string
}

const categories = {
  player: 'Плеер',
  payment: 'Оплата', 
  content: 'Контент',
  other: 'Другое'
}

async function sendTelegramMessage(telegramId: string, message: string, replyToId?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not found')
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  
  const payload = {
    chat_id: telegramId,
    text: message,
    parse_mode: 'HTML',
    reply_markup: replyToId ? {
      inline_keyboard: [[{
        text: '📞 Ответить пользователю',
        url: `tg://user?id=${replyToId}`
      }]]
    } : undefined
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error(`Failed to send message to ${telegramId}:`, error)
      return false
    }

    return true
  } catch (error) {
    console.error(`Error sending message to ${telegramId}:`, error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Получаем текущего пользователя
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Парсим тело запроса
    const body: SupportRequest = await request.json()
    const { category, message } = body

    // Валидация
    if (!category || !message) {
      return NextResponse.json(
        { error: 'Category and message are required' },
        { status: 400 }
      )
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (!Object.keys(categories).includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Получаем всех администраторов
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { telegramId: true }
    })

    if (admins.length === 0) {
      return NextResponse.json(
        { error: 'No administrators found' },
        { status: 500 }
      )
    }

    // Формируем сообщение
    const categoryLabel = categories[category as keyof typeof categories]
    const supportMessage = `🚨 <b>Новое обращение в поддержку!</b>

👤 <b>От:</b> ${user.firstName || 'Неизвестно'} ${user.lastName || ''} (ID: ${user.telegramId || 'Неизвестно'})
📂 <b>Категория:</b> ${categoryLabel}
📝 <b>Сообщение:</b>
${message}

⏰ <i>${new Date().toLocaleString('ru-RU')}</i>`

    // Отправляем сообщения всем админам параллельно
    const sendPromises = admins.map(async (admin) => {
      if (!admin.telegramId) {
        console.warn(`Admin without telegramId found, skipping...`)
        return { telegramId: 'unknown', success: false }
      }

      const success = await sendTelegramMessage(
        admin.telegramId,
        supportMessage,
        user.telegramId || undefined
      )

      return { telegramId: admin.telegramId, success }
    })

    // Ждем выполнения всех отправок
    const results = await Promise.all(sendPromises)
    
    // Считаем успешные отправки
    const successful = results.filter(r => r.success).length
    const failed = results.length - successful

    console.log(`Support message sent to ${successful}/${results.length} admins`)

    // Если хотя бы одному админу отправлено успешно, считаем успехом
    if (successful > 0) {
      return NextResponse.json({
        success: true,
        message: `Сообщение отправлено администраторам (${successful}/${results.length})`,
        stats: { successful, failed, total: results.length }
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send message to any administrator' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Support API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    categories: Object.entries(categories).map(([key, label]) => ({ key, label }))
  })
}
