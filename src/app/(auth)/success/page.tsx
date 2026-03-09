'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SuccessPage() {
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
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Авторизация успешна!
          </h1>
          
          <p className="text-gray-400 mb-8">
            {message}
          </p>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
              <p className="text-sm text-gray-300 mb-2">
                Вы будете автоматически перенаправлены на сайт через несколько секунд...
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>

            <button
              onClick={() => {
                const token = searchParams.get('token')
                if (token) {
                  router.push(`/api/auth/confirm?token=${token}`)
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Перейти на сайт сейчас
            </button>
          </div>

          <div className="mt-8">
            <a 
              href="/" 
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← На главную
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
