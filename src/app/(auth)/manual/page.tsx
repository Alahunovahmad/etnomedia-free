'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ManualAuthPage() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Автозаполнение токена из URL параметра
  useState(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      setToken(urlToken)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token.trim()) {
      setError('Введите токен авторизации')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Перенаправляем на страницу подтверждения
      router.push(`/api/auth/confirm?token=${token.trim()}`)
    } catch (error) {
      setError('Ошибка при переходе. Попробуйте скопировать ссылку вручную.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token)
    setError('Токен скопирован в буфер обмена')
    setTimeout(() => setError(''), 2000)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            ETNO<span className="text-red-600">MEDIA</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Ввод токена авторизации
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56l-1.68 7.92c-.12.56-.44.7-.88.44l-2.48-1.84-1.2 1.16c-.14.14-.26.26-.52.26l.18-2.76 4.6-4.16c.2-.18-.04-.28-.32-.1l-5.68 3.58-2.44-.76c-.52-.16-.54-.52.12-.78l9.52-3.68c.44-.16.82.1.68.78z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Ручной ввод токена
            </h2>
            <p className="text-gray-400 text-sm">
              Вставьте токен, полученный от Telegram бота
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                Токен авторизации
              </label>
              <div className="relative">
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Вставьте токен сюда..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  required
                />
                {token && (
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                    title="Копировать токен"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes('скопирован') 
                  ? 'bg-green-900/50 border border-green-800 text-green-400' 
                  : 'bg-red-900/50 border border-red-800 text-red-400'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Авторизация...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">Инструкция:</h3>
            <ol className="text-xs text-gray-400 space-y-1">
              <li>1. Перейдите на сайт и нажмите "Войти через Telegram"</li>
              <li>2. Авторизуйтесь в Telegram боте</li>
              <li>3. Скопируйте токен из сообщения бота</li>
              <li>4. Вставьте токен в это поле</li>
              <li>5. Нажмите "Войти"</li>
            </ol>
          </div>
        </div>

        <div className="text-center space-y-2">
          <a 
            href="/login" 
            className="text-gray-400 hover:text-white transition-colors text-sm block"
          >
            ← Вернуться к обычному входу
          </a>
          <a 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors text-sm block"
          >
            ← На главную
          </a>
        </div>
      </div>
    </div>
  )
}
