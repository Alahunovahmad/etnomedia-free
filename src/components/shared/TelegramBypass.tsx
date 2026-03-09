'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, MoreVertical, X } from 'lucide-react'

export default function TelegramBypass() {
  const [isTelegram, setIsTelegram] = useState(false)
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Проверяем userAgent на наличие Telegram
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    const isTelegramBrowser = userAgent.includes('Telegram')
    
    setIsTelegram(isTelegramBrowser)
  }, [])

  const handleContinue = () => {
    setShow(false)
  }

  if (!isTelegram || !show) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 bg-opacity-20 rounded-full p-3">
              <ExternalLink className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-white">Открыть в браузере</h2>
          </div>
          <button
            onClick={handleContinue}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            Для стабильной работы плеера и просмотра в Full HD, пожалуйста, откройте сайт во внешнем браузере.
          </p>

          {/* Instructions */}
          <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-white font-medium flex items-center space-x-2">
              <MoreVertical className="h-4 w-4 text-red-600" />
              <span>Как открыть в браузере:</span>
            </h3>
            
            <ol className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start space-x-3">
                <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  1
                </span>
                <span>Нажмите на три точки (⋮) в правом верхнем углу</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                  2
                </span>
                <span>Выберите "Открыть в Safari" или "Открыть в браузере"</span>
              </li>
            </ol>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-red-600 font-semibold mb-1">Full HD</div>
              <div className="text-gray-400 text-xs">Качество видео</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-red-600 font-semibold mb-1">Fullscreen</div>
              <div className="text-gray-400 text-xs">Полноэкранный режим</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-red-600 font-semibold mb-1">AirPlay</div>
              <div className="text-gray-400 text-xs">Трансляция на TV</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-red-600 font-semibold mb-1">Стабильно</div>
              <div className="text-gray-400 text-xs">Без зависаний</div>
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-3 rounded-xl transition-colors font-medium"
          >
            Продолжить в Telegram
          </button>
        </div>
      </div>
    </div>
  )
}
