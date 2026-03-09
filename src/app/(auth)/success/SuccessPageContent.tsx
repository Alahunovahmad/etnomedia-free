'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SuccessPageContent() {
  const [message, setMessage] = useState('Обработка авторизации...')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setError('Токен не найден')
      return
    }

    // Автоматически перенаправляем на подтверждение
    const timer = setTimeout(() => {
      router.push(`/api/auth/confirm?token=${token}`)
    }, 2000)

    return () => clearTimeout(timer)
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            ETNO<span className="text-red-600">MEDIA</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Обработка входа...
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <div className="text-center">
            {error ? (
              <div className="text-red-500 mb-4">{error}</div>
            ) : (
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            )}
            
            <h2 className="text-xl font-semibold text-white mb-2">
              {error ? 'Ошибка' : 'Вход в систему'}
            </h2>
            <p className="text-gray-400 text-sm">
              {error ? error : message}
            </p>
            
            {!error && (
              <p className="text-gray-500 text-xs mt-4">
                Вы будете перенаправлены автоматически...
              </p>
            )}
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
