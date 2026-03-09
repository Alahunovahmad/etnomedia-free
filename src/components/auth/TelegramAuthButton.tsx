'use client'

import { useState } from 'react'

export default function TelegramAuthButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async () => {
    try {
      setLoading(true)
      setError(null)

      // Запрашиваем создание сессии
      const response = await fetch('/api/auth/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to start authentication')
      }

      const data = await response.json()

      // Перенаправляем в Telegram бота
      window.location.href = data.telegramUrl

    } catch (error) {
      console.error('Auth error:', error)
      setError('Не удалось начать авторизацию. Попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56l-1.68 7.92c-.12.56-.44.7-.88.44l-2.48-1.84-1.2 1.16c-.14.14-.26.26-.52.26l.18-2.76 4.6-4.16c.2-.18-.04-.28-.32-.1l-5.68 3.58-2.44-.76c-.52-.16-.54-.52.12-.78l9.52-3.68c.44-.16.82.1.68.78z"/>
        </svg>
        <span>{loading ? 'Создаем сессию...' : 'Войти через Telegram'}</span>
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-900/50 border border-red-800 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <p className="mt-3 text-center text-gray-500 text-xs">
          Нажмите чтобы перейти к боту и продолжить авторизацию
        </p>
      )}
    </div>
  )
}
