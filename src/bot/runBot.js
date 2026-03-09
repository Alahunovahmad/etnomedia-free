const dotenv = require('dotenv')

// Загружаем переменные окружения
dotenv.config()

// Проверяем наличие токена бота
const botToken = process.env.TELEGRAM_BOT_TOKEN
if (!botToken) {
  console.error('TELEGRAM_BOT_TOKEN не найден в переменных окружения!')
  process.exit(1)
}

// Импортируем и запускаем бота
require('./telegramBot.js').createBot(botToken)
