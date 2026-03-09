const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')


class ETNOMediaBot {
  constructor(token) {
    // Улучшенные настройки polling с retry
    this.bot = new TelegramBot(token, { 
      polling: {
        interval: 1000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    })
    this.apiUrl = process.env.API_URL || 'https://etno-media.up.railway.app/api/bot/auth'
    this.botToken = token
    this.userTokens = {}
    this.retryCount = 0
    this.maxRetries = 5
    
    this.setupHandlers()
    this.setupErrorHandling()
  }

  setupErrorHandling() {
    // Обработка ошибок polling
    this.bot.on('polling_error', (error) => {
      console.error('Telegram bot polling error:', error.message)
      this.retryCount++
      
      if (this.retryCount < this.maxRetries) {
        console.log(`Retrying connection... (${this.retryCount}/${this.maxRetries})`)
        setTimeout(() => {
          this.bot.startPolling()
        }, 5000 * this.retryCount) // Экспоненциальная задержка
      } else {
        console.error('Max retries reached. Stopping bot.')
        process.exit(1)
      }
    })

    // Обработка сетевых ошибок
    this.bot.on('error', (error) => {
      console.error('Telegram bot error:', error.message)
    })

    // Проверка соединения с Telegram
    this.bot.getMe().then((botInfo) => {
      console.log(`✅ Bot connected: @${botInfo.username}`)
      this.retryCount = 0 // Сброс счетчика после успешного подключения
    }).catch((error) => {
      console.error('❌ Failed to connect to Telegram:', error.message)
      if (error.message.includes('Unauthorized')) {
        console.error('❌ Invalid bot token! Please check TELEGRAM_BOT_TOKEN in .env')
        process.exit(1)
      }
    })
  }

  setupHandlers() {
    // Обработка команды /start
    this.bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id
      const token = match?.[1]

      console.log(`Received /start with token: ${token} from user: ${msg.from?.id}`)

      if (!token) {
        await this.bot.sendMessage(chatId, 
          '❌ Неверная ссылка для авторизации. Пожалуйста, используйте кнопку "Войти через Telegram" на сайте.'
        )
        return
      }

      // Отправляем сообщение с просьбой поделиться номером телефона
      await this.bot.sendMessage(chatId, 
        '👋 Добро пожаловать в ETNOMEDIA!\n\n' +
        'Для входа на сайт, пожалуйста, подтвердите свой номер телефона:',
        {
          reply_markup: {
            keyboard: [[
              {
                text: '📱 Поделиться номером телефона',
                request_contact: true
              }
            ]],
            resize_keyboard: true,
            one_time_keyboard: true
          }
        }
      )

      // Сохраняем токен в памяти пользователя
      this.userTokens[msg.from?.id || 0] = token
    })

    // Обработка контакта
    this.bot.on('contact', async (msg) => {
      const chatId = msg.chat.id
      const contact = msg.contact
      const user = msg.from

      console.log(`Received contact from user: ${user?.id}, phone: ${contact.phone_number}`)

      if (!contact.user_id || contact.user_id !== user?.id) {
        await this.bot.sendMessage(chatId, 
          '❌ Пожалуйста, отправьте свой номер телефона, а не чужой.'
        )
        return
      }

      const token = this.userTokens[user?.id || 0]
      
      if (!token) {
        await this.bot.sendMessage(chatId, 
          '❌ Сессия истекла. Пожалуйста, начните авторизацию заново.'
        )
        return
      }

      try {
        // Отправляем данные на API для подтверждения с retry
        const response = await this.confirmAuthWithRetry({
          token,
          telegramId: user?.id?.toString() || '',
          phoneNumber: contact.phone_number,
          firstName: user?.first_name,
          lastName: user?.last_name,
          username: user?.username
        })

        if (response.success) {
          // Получаем токен из session.token
          const sessionToken = response.session?.token || token
          
          // Формируем правильный URL
          const baseUrl = process.env.PUBLIC_URL || 'https://etno-media.up.railway.app'
          const successUrl = `${baseUrl}/success?token=${sessionToken}`
          const magicLink = `${baseUrl}/api/auth/confirm?token=${sessionToken}`
          
          // Отправляем Magic Link пользователю
          await this.bot.sendMessage(chatId, 
              '✅ *Авторизация успешная!*\n\n' +
              'Нажмите на кнопку ниже, чтобы вернуться на сайт:', 
              { 
                  parse_mode: 'Markdown',
                  reply_markup: {
                      inline_keyboard: [
                          [
                              {
                                  text: '🔗 Вернуться на сайт', 
                                  url: magicLink             
                              }
                          ]
                      ]
                  }
              }
          );

          // Очищаем токен
          delete this.userTokens[user?.id || 0]
        } else {
          // Проверяем специфическую ошибку регистрации
          if (response.error === 'Registration is currently disabled' || response.message?.includes('Регистрация')) {
            await this.bot.sendMessage(chatId, 
              '🚫 *Регистрация временно отключена*\n\n' +
              'К сожалению, регистрация новых пользователей на данный момент недоступна.\n' +
              'Пожалуйста, попробуйте позже или свяжитесь с поддержкой.\n\n' +
              'Если у вас уже есть аккаунт, вы можете войти через него.',
              { parse_mode: 'Markdown' }
            );
          } else {
            await this.bot.sendMessage(chatId, 
              `❌ Ошибка авторизации: ${response.error || 'Неизвестная ошибка'}`
            );
          }
        }
      } catch (error) {
        console.error('Auth confirmation error:', error)
        await this.bot.sendMessage(chatId, 
          '❌ Произошла ошибка при авторизации. Попробуйте еще раз.'
        )
      }
    })

    // Обработка команды /help
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id
      
      await this.bot.sendMessage(chatId,
        '🤖 *ETNOMEDIA Bot*\n\n' +
        'Этот бот используется для авторизации на сайте ETNOMEDIA.\n\n' +
        '*Как использовать:*\n' +
        '1. Зайдите на сайт etnomedia.com\n' +
        '2. Нажмите "Войти через Telegram"\n' +
        '3. Нажмите "Старт" в этом боте\n' +
        '4. Поделитесь номером телефона\n' +
        '5. Нажмите на ссылку для возврата на сайт\n\n' +
        '*Команды:*\n' +
        '/start - Начать авторизацию\n' +
        '/help - Показать это сообщение',
        { parse_mode: 'Markdown' }
      )
    })

    // Обработка ошибок
    this.bot.on('polling_error', (error) => {
      console.error('Telegram bot polling error:', error)
    })

    console.log('ETNOMEDIA Telegram bot started successfully!')
  }

  async confirmAuthWithRetry(data, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(this.apiUrl, data, {
          headers: {
            'x-bot-token': this.botToken,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 секунд таймаут
        })

        return response.data
      } catch (error) {
        const status = error.response?.status
        const errorData = error.response?.data || {}
        
        console.error(`API request attempt ${attempt} failed:`, {
          status: status || 'NO_RESPONSE',
          url: this.apiUrl,
          message: error.message,
          code: error.code,
          data: errorData
        })
        
        // Если ошибка 403 (регистрация отключена), не повторяем попытки и возвращаем успешный ответ с ошибкой
        if (status === 403) {
          console.log('🚫 Registration disabled - returning error message to user')
          return { 
            success: false, 
            error: errorData.error || 'Registration is currently disabled',
            message: errorData.message || 'Регистрация временно отключена'
          }
        }
        
        if (attempt === maxRetries) {
          // Для других ошибок тоже возвращаем объект вместо бросания исключения
          return { 
            success: false, 
            error: errorData.error || 'API request failed after retries',
            message: errorData.message || 'Ошибка API после нескольких попыток'
          }
        }
        
        // Ждем перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  async confirmAuth(data) {
    try {
      const response = await axios.post(this.apiUrl, data, {
        headers: {
          'x-bot-token': this.botToken,
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      console.error('API request error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'API request failed')
    }
  }

  stop() {
    this.bot.stopPolling()
    console.log('ETNOMEDIA Telegram bot stopped')
  }
}

// Функция для создания бота
function createBot(token) {
  const bot = new ETNOMediaBot(token)
  
  // Обработка завершения процесса
  process.on('SIGINT', () => {
    console.log('\nПолучен SIGINT, останавливаем бота...')
    bot.stop()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\nПолучен SIGTERM, останавливаем бота...')
    bot.stop()
    process.exit(0)
  })

  console.log('ETNOMEDIA Telegram Bot запущен!')
  return bot
}

module.exports = { createBot, ETNOMediaBot }
