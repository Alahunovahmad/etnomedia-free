import { Metadata } from 'next'
import TelegramLogin from '@/components/auth/TelegramLogin'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Вход - ETNOMEDIA',
  description: 'Войдите в свой аккаунт через Telegram',
}

interface LoginPageProps {
  searchParams: Promise<{
    error?: string
  }>
}

function LoginPageContent({ searchParams }: { searchParams: { error?: string } }) {
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
        {searchParams.error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-500 text-sm text-center">
              {searchParams.error === 'registration_disabled' && 'Регистрация новых пользователей временно отключена'}
              {searchParams.error === 'invalid' && 'Ошибка авторизации. Попробуйте снова'}
              {searchParams.error === 'server' && 'Ошибка сервера. Попробуйте позже'}
              {!['registration_disabled', 'invalid', 'server'].includes(searchParams.error) && 'Произошла ошибка'}
            </p>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
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
              botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'etnomedia_bot'}
              authUrl={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://etno-media.up.railway.app'}/api/auth/telegram`}
              onAuthSuccess={(user) => {
                console.log('Auth successful:', user)
                // Редирект произойдет автоматически через API
              }}
              onAuthError={(error) => {
                console.error('Auth error:', error)
              }}
            />
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Загрузка...</div></div>}>
      <LoginPageContent searchParams={{ error }} />
    </Suspense>
  )
}
