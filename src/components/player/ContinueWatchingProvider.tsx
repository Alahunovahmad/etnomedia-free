'use client'

import { useState, useEffect } from 'react'
import ContinueWatchingOverlay from './ContinueWatchingOverlay'

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

interface ContinueWatchingProviderProps {
  children: React.ReactNode
}

export default function ContinueWatchingProvider({ children }: ContinueWatchingProviderProps) {
  const [continueData, setContinueData] = useState<ContinueWatchingData | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Проверяем наличие продолжения просмотра при загрузке
    checkContinueWatching()
  }, [])

  const checkContinueWatching = async () => {
    try {
      const response = await fetch('/api/watch-history/continue')
      if (response.ok) {
        const data = await response.json()
        if (data.continueWatching) {
          setContinueData(data.continueWatching)
          setIsVisible(true)
        }
      }
    } catch (error) {
      console.error('Failed to check continue watching:', error)
    }
  }

  const handleResume = () => {
    if (!continueData) return

    // Перенаправляем на соответствующую страницу
    if (continueData.type === 'movie') {
      window.location.href = `/movie/${continueData.id}?t=${continueData.timecode}`
    } else if (continueData.type === 'episode') {
      // Ищем ID сериала по названию (временное решение)
      window.location.href = `/series/1?season=${continueData.season}&episode=${continueData.episodeNumber}&t=${continueData.timecode}`
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Можно сохранить в localStorage, чтобы не показывать сегодня
    localStorage.setItem('dismissed-continue-watching', new Date().toISOString())
  }

  // Проверяем, не был ли оверлей отклонен сегодня
  const wasDismissedToday = () => {
    const dismissed = localStorage.getItem('dismissed-continue-watching')
    if (!dismissed) return false
    
    const dismissedDate = new Date(dismissed)
    const today = new Date()
    return dismissedDate.toDateString() === today.toDateString()
  }

  if (!isVisible || !continueData || wasDismissedToday()) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <ContinueWatchingOverlay
        data={continueData}
        onResume={handleResume}
        onDismiss={handleDismiss}
      />
    </>
  )
}
