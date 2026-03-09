'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface VideoPlayerProps {
  videoUrl: string
  posterUrl?: string
  movieId?: number
}

export default function VideoPlayer({ videoUrl, posterUrl, movieId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [savedTime, setSavedTime] = useState<number | null>(null)

  // Функция для сохранения прогресса
  const saveProgress = async (timecode: number) => {
    if (!movieId) return
    
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          movieId,
          timecode: Math.floor(timecode)
        })
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  // Функция для загрузки сохраненного прогресса
  const loadProgress = async () => {
    if (!movieId) return
    
    try {
      const response = await fetch(`/api/history?movieId=${movieId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.watchHistory && data.watchHistory.timecode > 0) {
          setSavedTime(data.watchHistory.timecode)
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current

    // Загружаем сохраненный прогресс при монтировании
    loadProgress()

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(videoUrl)
      hls.attachMedia(video)
      
      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = videoUrl
    }

    // Устанавливаем сохраненное время после загрузки метаданных
    const handleLoadedMetadata = () => {
      if (savedTime && savedTime > 0) {
        video.currentTime = savedTime
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [videoUrl, savedTime])

  useEffect(() => {
    if (!videoRef.current || !movieId) return

    const video = videoRef.current

    // Обновляем текущее время
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    // Сохраняем прогресс каждые 15 секунд
    intervalRef.current = setInterval(() => {
      if (video.currentTime > 0) {
        saveProgress(video.currentTime)
      }
    }, 15000)

    // Сохраняем прогресс при паузе
    const handlePause = () => {
      saveProgress(video.currentTime)
    }

    // Сохраняем прогресс перед уходом со страницы
    const handleBeforeUnload = () => {
      saveProgress(video.currentTime)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('pause', handlePause)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('pause', handlePause)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [movieId])

  return (
    <div className="relative">
      <video
        ref={videoRef}
        controls
        className="w-full aspect-video bg-black rounded-lg"
        poster={posterUrl}
        playsInline
      />
      {savedTime && savedTime > 0 && (
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
          Продолжить с {Math.floor(savedTime / 60)}:{String(Math.floor(savedTime % 60)).padStart(2, '0')}
        </div>
      )}
    </div>
  )
}
