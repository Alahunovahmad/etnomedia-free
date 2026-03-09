'use client'

import { useEffect, useRef } from 'react'

export default function TelegramLoginWidget() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && !containerRef.current.querySelector('script')) {
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?22'
      script.async = true
      script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'etnomedia_free_bot')
      script.setAttribute('data-size', 'large')
      script.setAttribute('data-auth-url', '/api/auth/telegram')
      script.setAttribute('data-request-access', 'write')
      
      containerRef.current.appendChild(script)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="flex justify-center"
      id="telegram-login-widget"
    />
  )
}
