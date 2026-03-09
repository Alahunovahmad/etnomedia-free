'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TelegramLogin from '@/components/auth/TelegramLogin'
import { RefreshCw } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string>('')
  const [isResetting, setIsResetting] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
    }
  }, [searchParams])

  const handleAuthSuccess = (user: any) => {
    console.log('Auth successful:', user)
    // Редирект произойдет автоматически через API
  }

  const handleAuthError = (error: string) => {
    console.error('Auth error:', error)
    setError('auth_error')
  }

  const handleResetSession = async () => {
    if (isResetting) return
    
    setIsResetting(true)
    try {
      // Вызываем API logout для удаления куки
      await fetch('/api/auth/logout', { method: 'POST' })
      // Перезагружаем страницу для переинициализации виджета
      window.location.reload()
    } catch (error) {
      console.error('Reset session error:', error)
      // В случае ошибки все равно перезагружаем
      window.location.reload()
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
            Войдите в свой аккаунт через Telegram
          </p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-500 text-sm text-center">
              {error === 'registration_disabled' && 'Регистрация новых пользователей временно отключена'}
              {error === 'invalid' && 'Ошибка авторизации. Попробуйте снова'}
              {error === 'server' && 'Ошибка сервера. Попробуйте позже'}
              {error === 'auth_error' && 'Ошибка виджета авторизации'}
              {!['registration_disabled', 'invalid', 'server', 'auth_error'].includes(error) && 'Произошла ошибка'}
            </p>
          </div>
        )}

        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56l-1.68 7.92c-.12.56-.44.7-.88.44l-2.48-1.84-1.2 1.16c-.14.14-.26.26-.52.26l.18-2.76 4.6-4.16c.2-.18-.04-.28-.32-.1l-5.68 3.58-2.44-.76c-.52-.16-.54-.52.12-.78l9.52-3.68c.44-.16.82.1.68.78z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Быстрый вход через Telegram
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Нажмите на кнопку ниже для авторизации
            </p>
          </div>

          <div className="flex justify-center">
            <TelegramLogin
              botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'etnomedia_free_bot'}
              authUrl={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://etno-media.up.railway.app'}/api/auth/telegram`}
              onAuthSuccess={handleAuthSuccess}
              onAuthError={handleAuthError}
            />
          </div>

          {/* Кнопка смены аккаунта */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <button
              onClick={handleResetSession}
              disabled={isResetting}
              className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Сброс сессии...' : 'Войти с другого аккаунта'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">Как это работает:</h3>
            <ol className="text-xs text-gray-400 space-y-1">
              <li>1. Нажмите кнопку "Log in with Telegram"</li>
              <li>2. Подтвердите авторизацию в Telegram</li>
              <li>3. Разрешите доступ к вашему профилю</li>
              <li>4. Готово! Вы вернетесь на сайт авторизованным</li>
            </ol>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              Используя этот сервис, вы соглашаетесь с нашими 
              <a href="#" className="text-red-600 hover:text-red-500 mx-1">Условиями использования</a>
              и 
              <a href="#" className="text-red-600 hover:text-red-500 mx-1">Политикой конфиденциальности</a>
            </p>
          </div>
        </div>

        <div className="text-center">
          <a 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  )
}
