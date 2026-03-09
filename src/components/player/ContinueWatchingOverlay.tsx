'use client'

import { useState, useEffect } from 'react'
import { Play, Clock, Calendar } from 'lucide-react'

interface ContinueWatchingData {
  type: 'movie' | 'episode'
  id: number
  title: string
  timecode: number
  duration?: number
  posterUrl?: string
  seriesName?: string
  season?: number
  episodeNumber?: number
  episodeTitle?: string
}

interface ContinueWatchingOverlayProps {
  data: ContinueWatchingData
  onResume: () => void
  onDismiss: () => void
}

export default function ContinueWatchingOverlay({ data, onResume, onDismiss }: ContinueWatchingOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Анимация появления
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = data.duration ? (data.timecode / data.duration) * 100 : 0

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-gray-900 rounded-xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Header */}
        <div className="relative aspect-video bg-gradient-to-b from-black/50 to-transparent">
          {data.posterUrl && (
            <img 
              src={data.posterUrl} 
              alt={data.title}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Progress bar overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Type indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div className="px-2 py-1 bg-red-600 rounded text-xs font-semibold">
              {data.type === 'movie' ? 'ФИЛЬМ' : 'СЕРИАЛ'}
            </div>
            {data.type === 'episode' && data.seriesName && (
              <div className="text-gray-400 text-sm">
                {data.seriesName}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
            {data.title}
          </h3>

          {/* Episode info for series */}
          {data.type === 'episode' && (
            <div className="text-gray-300 text-sm mb-4">
              Сезон {data.season} Серия {data.episodeNumber}
              {data.episodeTitle && `: ${data.episodeTitle}`}
            </div>
          )}

          {/* Time info */}
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Продолжить с {formatTime(data.timecode)}</span>
            </div>
            {data.duration && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatTime(data.duration)} всего</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onResume}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Продолжить
            </button>
            
            <button
              onClick={onDismiss}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Отмена
            </button>
          </div>

          {/* Additional info */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              {data.type === 'movie' 
                ? 'Вы остановились на этом месте. Продолжите просмотр!'
                : 'Продолжите просмотр сериала с последней серии'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
