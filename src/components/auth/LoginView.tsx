'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { RefreshCw, MessageCircle, X } from 'lucide-react'

export default function LoginView() {
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [authStatus, setAuthStatus] = useState<string>('')
  const [nonce, setNonce] = useState<string>('')
  const searchParams = useSearchParams()
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
    }
    
    // Очищаем кэш и сбрасываем авторизацию при переходе на страницу входа
    resetAuthState()
  }, [searchParams])

  // Немедленная очистка при первом рендере (без зависимостей)
  useEffect(() => {
    resetAuthState()
  }, [])

  // Функция для полного сброса состояния авторизации
  const resetAuthState = async () => {
    // Останавливаем текущий polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    
    // Очищаем старый nonce из localStorage
    const oldNonce = localStorage.getItem('auth_nonce')
    if (oldNonce) {
      try {
        // Сжигаем старый nonce на сервере
        await fetch('/api/auth/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nonce: oldNonce })
        })
      } catch (error) {
        console.error('Error cancelling old nonce:', error)
      }
    }
    
    // Полная очистка локального состояния
    localStorage.removeItem('auth_nonce')
    setNonce('')
    setIsWaiting(false)
    setAuthStatus('')
    setError('')
    setIsLoading(false)
  }

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  const handleLogin = async () => {
    if (isLoading) return
    
    // Полный сброс состояния перед началом новой авторизации
    await resetAuthState()
    
    setIsLoading(true)

    try {
      // Получаем nonce
      const response = await fetch('/api/auth/init')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to init auth')
      }

      const newNonce = data.nonce
      setNonce(newNonce)
      
      // Определяем мобильное устройство
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // Открываем Telegram с правильным форматом nonce
      const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'etnomedia_free_bot'
      const telegramUrl = `https://t.me/${botUsername}?start=${newNonce}`
      
      if (isMobile) {
        // На мобильных открываем в текущем окне
        window.location.href = telegramUrl
      } else {
        // На ПК открываем в новой вкладке
        window.open(telegramUrl, '_blank')
      }
      
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Ошибка инициализации авторизации')
      setIsLoading(false)
    }
  }

  const startPolling = (currentNonce: string) => {
    setIsWaiting(true)
    
    // Начинаем опрос статуса
    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/check-status?nonce=${currentNonce}`)
        const data = await response.json()

        if (response.ok && data.success) {
          // Авторизация успешна
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
          }
          
          // Перенаправляем на главную
          window.location.href = '/'
        } else if (response.status === 410) {
          // Истекло время
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
          }
          setError('Время авторизации истекло. Попробуйте снова.')
          setIsWaiting(false)
          setAuthStatus('')
        } else {
          // Устанавливаем статус для отображения правильного сообщения
          setAuthStatus(data.status || 'PENDING')
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000) // Опрос каждые 2 секунды

    // Таймаут через 5 минут
    setTimeout(() => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
      setError('Время авторизации истекло. Попробуйте снова.')
      setIsWaiting(false)
    }, 5 * 60 * 1000)
  }

  const handleResetSession = async () => {
    if (isLoading) return
    
    await resetAuthState()
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.reload()
    } catch (error) {
      console.error('Reset session error:', error)
      window.location.reload()
    }
  }

  const handleStopWaiting = async () => {
    if (!nonce || !pollingRef.current) return
    
    // Останавливаем polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    
    // Сжигаем nonce на сервере
    try {
      await fetch('/api/auth/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nonce })
      })
    } catch (error) {
      console.error('Cancel auth error:', error)
    }
    
    // Очищаем локальное состояние
    localStorage.removeItem('auth_nonce')
    setNonce('')
    setIsWaiting(false)
    setError('Процесс авторизации отменен')
  }

  // Проверяем, есть ли nonce в localStorage (возвращаемся из Telegram)
  useEffect(() => {
    const storedNonce = localStorage.getItem('auth_nonce')
    if (storedNonce && !isWaiting) {
      setNonce(storedNonce)
      startPolling(storedNonce)
    }
  }, [isWaiting])

  // Сохраняем nonce при его получении
  useEffect(() => {
    if (nonce) {
      localStorage.setItem('auth_nonce', nonce)
      startPolling(nonce)
    }
  }, [nonce])

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
              {!['registration_disabled', 'invalid', 'server', 'auth_error'].includes(error) && error}
            </p>
          </div>
        )}

        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Быстрый вход через Telegram
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Нажмите на кнопку ниже для авторизации
            </p>
          </div>

          {/* Основная кнопка входа */}
          <div className="flex justify-center">
            <button
              onClick={handleLogin}
              disabled={isLoading || isWaiting}
              className="w-full bg-[#0088cc] hover:bg-[#0077b3] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Инициализация...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Войти через Telegram
                </>
              )}
            </button>
          </div>

          {/* Экран ожидания */}
          {isWaiting && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                <p className="text-blue-500 text-sm font-medium">
                  {authStatus === 'AWAITING_PHONE' 
                    ? 'Ожидание номера телефона...' 
                    : 'Ожидание авторизации...'}
                </p>
              </div>
              <p className="text-gray-400 text-xs text-center">
                {authStatus === 'AWAITING_PHONE' 
                  ? 'Пожалуйста, поделитесь номером телефона в Telegram для завершения авторизации.'
                  : 'Подтвердите вход в приложении Telegram. Это может занять несколько секунд.'}
              </p>
            </div>
          )}

          {/* Кнопка смены аккаунта / остановки */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            {isWaiting ? (
              <button
                onClick={handleStopWaiting}
                className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 transition-colors text-xs"
              >
                <X className="w-3 h-3" />
                Остановить
              </button>
            ) : (
              <button
                onClick={handleResetSession}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-400 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-3 h-3" />
                Войти с другого аккаунта
              </button>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">Как это работает:</h3>
            <ol className="text-xs text-gray-400 space-y-1">
              <li>1. Нажмите кнопку "Войти через Telegram"</li>
              <li>2. Откроется Telegram с нашим ботом</li>
              <li>3. Нажмите "Start" в боте</li>
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
