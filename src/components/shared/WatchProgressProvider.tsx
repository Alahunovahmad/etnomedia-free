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
    if (movieIds.length === 0) return

    try {
      // Проверяем авторизацию через API
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        return // Пользователь не авторизован
      }

      // Используем один batch запрос вместо множества отдельных
      const response = await fetch(`/api/watch-progress/batch?movieIds=${movieIds.join(',')}`)
      if (response.ok) {
        const batchProgress = await response.json()
        setProgress(batchProgress)
      }
    } catch (error) {
      console.error('Failed to load batch progress:', error)
    }
  }

  return (
    <WatchProgressContext.Provider value={{ progress, updateProgress, loadProgress }}>
      {children}
    </WatchProgressContext.Provider>
  )
}
