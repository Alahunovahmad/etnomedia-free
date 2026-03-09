'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface WatchProgress {
  [movieId: number]: number // процент просмотра (0-100)
}

interface WatchProgressContextType {
  progress: WatchProgress
  updateProgress: (movieId: number, timecode: number, duration: number) => void
  loadProgress: (movieIds: number[]) => Promise<void>
}

const WatchProgressContext = createContext<WatchProgressContextType | undefined>(undefined)

export function useWatchProgress() {
  const context = useContext(WatchProgressContext)
  if (!context) {
    throw new Error('useWatchProgress must be used within WatchProgressProvider')
  }
  return context
}

export function WatchProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<WatchProgress>({})

  // Обновление прогресса для фильма
  const updateProgress = (movieId: number, timecode: number, duration: number) => {
    const percentage = duration > 0 ? (timecode / duration) * 100 : 0
    setProgress(prev => ({
      ...prev,
      [movieId]: percentage
    }))
  }

  // Загрузка прогресса для списка фильмов
  const loadProgress = async (movieIds: number[]) => {
    try {
      // Проверяем авторизацию через API
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        return // Пользователь не авторизован
      }

      const progressPromises = movieIds.map(async (movieId: number) => {
        try {
          const response = await fetch(`/api/history?movieId=${movieId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.watchHistory) {
              // Для получения процента нужно знать длительность фильма
              // Пока вернем timecode, потом можно будет получить duration из API
              return { movieId, timecode: data.watchHistory.timecode }
            }
          }
        } catch (error) {
          console.error(`Failed to load progress for movie ${movieId}:`, error)
        }
        return null
      })

      const results = await Promise.all(progressPromises)
      const newProgress: WatchProgress = {}
      
      results.forEach(result => {
        if (result) {
          // Временно сохраняем timecode как процент (будет исправлено при получении duration)
          newProgress[result.movieId] = result.timecode
        }
      })

      setProgress(newProgress)
    } catch (error) {
      console.error('Failed to load watch progress:', error)
    }
  }

  return (
    <WatchProgressContext.Provider value={{ progress, updateProgress, loadProgress }}>
      {children}
    </WatchProgressContext.Provider>
  )
}
