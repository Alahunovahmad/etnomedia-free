const axios = require('axios')

class BotHealthChecker {
  constructor(botToken, apiUrl) {
    this.botToken = botToken
    this.apiUrl = apiUrl
    this.isHealthy = true
    this.lastCheck = new Date()
  }

  async checkBotHealth() {
    try {
      // Проверяем соединение с Telegram
      const telegramResponse = await axios.get(`https://api.telegram.org/bot${this.botToken}/getMe`, {
        timeout: 5000
      })

      if (telegramResponse.data.ok) {
        console.log('✅ Telegram API is healthy')
      }

      // Проверяем соединение с нашим API
      const apiResponse = await axios.get(`${this.apiUrl.replace('/auth', '')}/health`, {
        timeout: 5000,
        headers: {
          'x-bot-token': this.botToken
        }
      })

      if (apiResponse.status === 200) {
        console.log('✅ Backend API is healthy')
      }

      this.isHealthy = true
      this.lastCheck = new Date()
      
      return {
        healthy: true,
        telegram: true,
        api: true,
        lastCheck: this.lastCheck
      }

    } catch (error) {
      this.isHealthy = false
      console.error('❌ Health check failed:', error.message)
      
      return {
        healthy: false,
        error: error.message,
        lastCheck: this.lastCheck
      }
    }
  }

  async startHealthCheck(interval = 30000) { // Каждые 30 секунд
    console.log('🔍 Starting health checks...')
    
    // Первая проверка сразу
    await this.checkBotHealth()
    
    // Регулярные проверки
    setInterval(async () => {
      await this.checkBotHealth()
    }, interval)
  }
}

module.exports = BotHealthChecker
