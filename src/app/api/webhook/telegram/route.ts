import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Функция для валидации подписи Telegram
function validateTelegramData(query: any): boolean {
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

  const crypto = require('crypto')
  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex')

  return hmac === hash
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    const chatId = message.chat.id
    const text = message.text

    // Обработка /start auth_<nonce>
    if (text && text.startsWith('/start auth_')) {
      const nonce = text.replace('/start auth_', '')
      
      console.log(`Received /start auth_${nonce} from user: ${chatId}`)

      try {
        // Ищем nonce в PendingAuth
        const pendingAuth = await prisma.pendingAuth.findUnique({
          where: { nonce }
        })

        if (!pendingAuth) {
          return NextResponse.json({
            method: 'sendMessage',
            chat_id: chatId,
            text: '❌ Ссылка авторизации недействительна или истекла.',
            parse_mode: 'Markdown'
          })
        }

        if (pendingAuth.status !== 'PENDING') {
          return NextResponse.json({
            method: 'sendMessage',
            chat_id: chatId,
            text: '❌ Эта ссылка авторизации уже была использована.',
            parse_mode: 'Markdown'
          })
        }

        // Проверяем время жизни (5 минут)
        const isExpired = Date.now() - pendingAuth.createdAt.getTime() > 5 * 60 * 1000
        if (isExpired) {
          await prisma.pendingAuth.update({
            where: { id: pendingAuth.id },
            data: { status: 'EXPIRED' }
          })

          return NextResponse.json({
            method: 'sendMessage',
            chat_id: chatId,
            text: '❌ Срок действия ссылки истек.',
            parse_mode: 'Markdown'
          })
        }

        // Обновляем telegramId в PendingAuth
        await prisma.pendingAuth.update({
          where: { id: pendingAuth.id },
          data: { telegramId: message.from.id.toString() }
        })

        // Запрашиваем номер телефона
        return NextResponse.json({
          method: 'sendMessage',
          chat_id: chatId,
          text: '📞 Для завершения авторизации, пожалуйста, подтвердите номер телефона:',
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [[{
              text: '📱 Подтвердить номер телефона',
              request_contact: true
            }]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        })
      } catch (error) {
        console.error('Error processing auth start:', error)
        return NextResponse.json({
          method: 'sendMessage',
          chat_id: chatId,
          text: '❌ Произошла ошибка. Попробуйте еще раз.',
          parse_mode: 'Markdown'
        })
      }
    }

    // Обработка контакта
    if (message.contact) {
      const contact = message.contact
      
      // Проверяем что контакт принадлежит пользователю
      if (contact.user_id.toString() !== message.from.id.toString()) {
        return NextResponse.json({
          method: 'sendMessage',
          chat_id: chatId,
          text: '❌ Ошибка безопасности: номер телефона должен принадлежать вам.',
          parse_mode: 'Markdown'
        })
      }

      try {
        // Ищем PendingAuth по telegramId
        const pendingAuth = await prisma.pendingAuth.findFirst({
          where: { 
            telegramId: message.from.id.toString(),
            status: 'PENDING'
          }
        })

        if (!pendingAuth) {
          return NextResponse.json({
            method: 'sendMessage',
            chat_id: chatId,
            text: '❌ Сессия авторизации истекла. Начните заново.',
            parse_mode: 'Markdown'
          })
        }

        // Обновляем PendingAuth с телефоном и статусом
        await prisma.pendingAuth.update({
          where: { id: pendingAuth.id },
          data: {
            phoneNumber: contact.phone_number,
            status: 'COMPLETED'
          }
        })

        return NextResponse.json({
          method: 'sendMessage',
          chat_id: chatId,
          text: '✅ Авторизация успешна! Теперь вы можете вернуться на сайт.',
          parse_mode: 'Markdown',
          reply_markup: {
            remove_keyboard: true
          }
        })
      } catch (error) {
        console.error('Error processing contact:', error)
        return NextResponse.json({
          method: 'sendMessage',
          chat_id: chatId,
          text: '❌ Ошибка при сохранении данных. Попробуйте еще раз.',
          parse_mode: 'Markdown'
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
