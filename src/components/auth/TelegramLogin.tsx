'use client'

import { useEffect, useRef } from 'react'

interface TelegramLoginProps {
  botUsername: string
  authUrl: string
  onAuthSuccess?: (user: any) => void
  onAuthError?: (error: string) => void
}

export default function TelegramLogin({ 
  botUsername, 
  authUrl, 
  onAuthSuccess, 
  onAuthError 
}: TelegramLoginProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return

    const loadTelegramScript = async () => {
      try {
        // Динамическая загрузка скрипта Telegram Widget
        const script = document.createElement('script')
        script.src = 'https://telegram.org/js/telegram-widget.js?22'
        script.async = true
        script.setAttribute('data-telegram-login', botUsername)
        script.setAttribute('data-auth-url', authUrl)
        script.setAttribute('data-request-access', 'write')
        script.setAttribute('data-size', 'large')
        script.setAttribute('data-radius', '8')
        script.setAttribute('data-userpic', 'true')

        // Обработка успешной авторизации
        script.onload = () => {
          scriptLoaded.current = true
          
          // Глобальная функция для обработки авторизации
          ;(window as any).telegramLoginCallback = (user: any) => {
            console.log('Telegram auth success:', user)
            onAuthSuccess?.(user)
          }
        }

        script.onerror = () => {
          console.error('Failed to load Telegram widget script')
          onAuthError?.('Не удалось загрузить виджет Telegram')
        }

        if (containerRef.current) {
          containerRef.current.appendChild(script)
        }
      } catch (error) {
        console.error('Error loading Telegram widget:', error)
        onAuthError?.('Ошибка загрузки виджета')
      }
    }

    loadTelegramScript()

    return () => {
      // Очистка при размонтировании
      if ((window as any).telegramLoginCallback) {
        delete (window as any).telegramLoginCallback
      }
    }
  }, [botUsername, authUrl, onAuthSuccess, onAuthError])

  return (
    <div className="flex items-center justify-center">
      <div 
        ref={containerRef}
        id="telegram-login-widget"
        className="telegram-login-widget"
      />
    </div>
  )
}
