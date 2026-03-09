'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ManualAuthContent() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Автозаполнение токена из URL параметра
  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      setToken(urlToken)
    }
  }, [searchParams])

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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            ETNO<span className="text-red-600">MEDIA</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Введите токен авторизации вручную
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                Токен авторизации
              </label>
              <textarea
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Вставьте ваш токен сюда..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
              <p className="text-gray-500 text-xs mt-2">
                Токен можно получить в Telegram боте после команды /start
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Обработка...
                </div>
              ) : (
                'Войти'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">Как получить токен:</h3>
            <ol className="text-xs text-gray-400 space-y-1">
              <li>1. Откройте Telegram и найдите наш бот</li>
              <li>2. Нажмите "Старт" или отправьте команду /start</li>
              <li>3. Поделитесь номером телефона</li>
              <li>4. Бот пришлет вам ссылку с токеном</li>
              <li>5. Скопируйте токен из ссылки и вставьте сюда</li>
            </ol>
          </div>
        </div>

        <div className="text-center space-y-4">
          <a 
            href="/login" 
            className="text-gray-400 hover:text-white transition-colors text-sm block"
          >
            ← Вернуться к быстрому входу
          </a>
          <a 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors text-sm block"
          >
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  )
}
