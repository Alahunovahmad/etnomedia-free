'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  SkipForward,
  Loader2,
  PictureInPicture
} from 'lucide-react'

interface Episode {
  id: number
  season: number
  episodeNumber: number
  title: string | null
  m3u8Url: string
}

interface CustomVideoPlayerProps {
  videoUrl: string
  posterUrl?: string
  movieId?: number
  episodeId?: number
  seriesId?: number
  season?: number
  episodeNumber?: number
  initialTime?: number
  currentEpisode?: Episode
  nextEpisode?: Episode
  onNextEpisode?: () => void
}

export default function CustomVideoPlayer({ 
  videoUrl, 
  posterUrl,
  movieId,
  episodeId,
  seriesId,
  season,
  episodeNumber,
  initialTime = 0,
  currentEpisode,
  nextEpisode,
  onNextEpisode
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const saveProgressTimeoutRef = useRef<NodeJS.Timeout>()

  // Player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [buffered, setBuffered] = useState(0)
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false)
  
  // Advanced features
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [qualities, setQualities] = useState<Array<{ height: number, bitrate: number }>>([])
  const [currentQuality, setCurrentQuality] = useState(-1)
  const [showNextEpisode, setShowNextEpisode] = useState(false)

  // Watch position key
  const getWatchKey = () => {
    if (seriesId && currentEpisode) {
      return `watch_${seriesId}_s${currentEpisode.season}e${currentEpisode.episodeNumber}`
    }
    return `watch_${videoUrl}`
  }

  // Reset state when video changes
  useEffect(() => {
    setShowNextEpisode(false)
    setHasStartedPlaying(false)
    setIsPlaying(false)
    setCurrentTime(0)
  }, [videoUrl])

  // Initialize HLS
  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current

    // Restore watch position
    const savedPosition = initialTime > 0 ? initialTime : localStorage.getItem(getWatchKey())
    if (savedPosition) {
      const position = typeof savedPosition === 'string' ? parseFloat(savedPosition) : savedPosition
      if (position > 0 && position < duration - 30) {
        video.currentTime = position
      }
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      })
      
      hlsRef.current = hls
      hls.loadSource(videoUrl)
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false)
        setQualities(data.levels.map((level: any) => ({
          height: level.height,
          bitrate: level.bitrate
        })))
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level)
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setIsLoading(false)
          console.error('HLS Error:', data)
        }
      })
      
      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl
      setIsLoading(false)
    }
  }, [videoUrl])

  // Save progress to server
  const saveProgressToServer = useCallback(async (currentTime: number, duration: number) => {
    if (!movieId && !episodeId) return
    
    try {
      await fetch('/api/watch-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movieId || undefined,
          episodeId: episodeId || undefined,
          seriesId: seriesId || undefined,
          season: season || undefined,
          episodeNumber: episodeNumber || undefined,
          currentTime: Math.round(currentTime)
        })
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }, [movieId, episodeId, seriesId, season, episodeNumber])

  // Save progress periodically
  useEffect(() => {
    if (currentTime > 0 && duration > 0) {
      if (saveProgressTimeoutRef.current) {
        clearTimeout(saveProgressTimeoutRef.current)
      }
      
      saveProgressTimeoutRef.current = setTimeout(() => {
        const progress = currentTime / duration
        if (progress < 0.95) {
          // Сохраняем на сервер
          saveProgressToServer(currentTime, duration)
          // И в localStorage как backup
          localStorage.setItem(getWatchKey(), currentTime.toString())
        } else {
          localStorage.removeItem(getWatchKey())
        }
      }, 10000)
    }
  }, [currentTime, duration, saveProgressToServer])

  // Show next episode button 4 minutes before end
  useEffect(() => {
    if (!nextEpisode || !duration || !hasStartedPlaying) {
      return
    }

    const timeRemaining = duration - currentTime
    const watchProgress = currentTime / duration
    
    // Only show next episode button if watched >30% and <4 min remaining
    if (isPlaying && watchProgress > 0.3 && timeRemaining <= 240 && timeRemaining > 10) {
      setShowNextEpisode(true)
    } else {
      setShowNextEpisode(false)
    }
  }, [currentTime, duration, nextEpisode, isPlaying, hasStartedPlaying])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsLoading(false)
      setHasStartedPlaying(true)
    }

    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  // Player controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    const doc = document as any
    
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement) {
      // Try different fullscreen APIs for mobile compatibility
      const requestFullscreen = (container as any).requestFullscreen || 
                              (container as any).webkitRequestFullscreen || 
                              (container as any).webkitRequestFullScreen || 
                              (container as any).mozRequestFullScreen || 
                              (container as any).msRequestFullscreen
      
      if (requestFullscreen) {
        requestFullscreen.call(container)
        setIsFullscreen(true)
      }
    } else {
      // Try different exit fullscreen APIs
      const exitFullscreen = doc.exitFullscreen || 
                           doc.webkitExitFullscreen || 
                           doc.webkitCancelFullScreen || 
                           doc.mozCancelFullScreen || 
                           doc.msExitFullscreen
      
      if (exitFullscreen) {
        exitFullscreen.call(doc)
        setIsFullscreen(false)
      }
    }
  }, [])

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch (error) {
      console.error('PiP error:', error)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return
      const video = videoRef.current

      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      // Use e.code for physical key position (works with any keyboard layout)
      const code = e.code

      switch (code) {
        case 'Space':
        case 'KeyK':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          video.currentTime = Math.max(0, video.currentTime - 10)
          break
        case 'ArrowRight':
          e.preventDefault()
          video.currentTime = Math.min(duration, video.currentTime + 10)
          break
        case 'ArrowUp':
          e.preventDefault()
          setVolume(v => Math.min(1, v + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(v => Math.max(0, v - 0.1))
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
        case 'KeyF':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'KeyP':
          e.preventDefault()
          togglePiP()
          break
        case 'KeyN':
          if (nextEpisode && onNextEpisode) {
            e.preventDefault()
            onNextEpisode()
          }
          break
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          e.preventDefault()
          const num = parseInt(code.replace('Digit', ''))
          video.currentTime = (duration * num) / 10
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [duration, nextEpisode, onNextEpisode, togglePlay, toggleMute, toggleFullscreen, togglePiP])

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 5000)
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls, isPlaying])

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return
    
    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pos * duration
  }

  const changeQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level
      setShowSettings(false)
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
      setShowSettings(false)
    }
  }

  // Update volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  // Fullscreen event listeners for mobile compatibility
  useEffect(() => {
    const doc = document as any
    const handleFullscreenChange = () => {
      const isFullscreenActive = !!(doc.fullscreenElement || 
                                   doc.webkitFullscreenElement || 
                                   doc.mozFullScreenElement || 
                                   doc.msFullscreenElement)
      setIsFullscreen(isFullscreenActive)
    }

    // Add event listeners for different browsers
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ]

    events.forEach(event => {
      doc.addEventListener(event, handleFullscreenChange)
    })

    return () => {
      events.forEach(event => {
        doc.removeEventListener(event, handleFullscreenChange)
      })
    }
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

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      style={{
        ...(isFullscreen && {
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          borderRadius: '0',
          position: 'fixed',
          top: '0',
          left: '0',
          zIndex: '9999'
        })
      }}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={posterUrl}
        playsInline
        onClick={togglePlay}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
        </div>
      )}


      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => {
          // Only toggle play if clicking on the overlay itself, not on controls
          if (e.target === e.currentTarget) {
            togglePlay()
          }
        }}
      >
        {/* Top Bar - Episode Info */}
        {currentEpisode && (
          <div className="absolute top-0 left-0 right-0 p-6">
            <h2 className="text-xl font-bold">
              Сезон {currentEpisode.season} Серия {currentEpisode.episodeNumber}
              {currentEpisode.title && `: ${currentEpisode.title}`}
            </h2>
          </div>
        )}

        {/* Next Episode Button */}
        {showNextEpisode && nextEpisode && (
          <div className="absolute top-6 right-6">
            <button
              onClick={onNextEpisode}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
            >
              <SkipForward className="w-5 h-5" />
              Следующая серия
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          {/* Progress Bar */}
          <div 
            ref={progressBarRef}
            className="relative h-1 bg-gray-600 rounded-full cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            {/* Buffered */}
            <div 
              className="absolute h-full bg-gray-500 rounded-full"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
            {/* Progress */}
            <div 
              className="absolute h-full bg-red-600 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            {/* Hover indicator */}
            <div className="absolute -top-1 h-3 w-3 bg-red-600 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translateX(-50%)' }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="hover:text-red-600 transition-colors">
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button onClick={toggleMute} className="hover:text-red-600 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value))
                    setIsMuted(false)
                  }}
                  className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 accent-red-600"
                />
              </div>

              {/* Time */}
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Settings */}
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:text-red-600 transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-4 min-w-[200px] space-y-4">
                    {/* Playback Speed */}
                    <div>
                      <div className="text-sm font-semibold mb-2">Скорость</div>
                      <div className="space-y-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate: number) => (
                          <button
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={`block w-full text-left px-3 py-1 rounded ${
                              playbackRate === rate ? 'bg-red-600' : 'hover:bg-gray-800'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality */}
                    {qualities.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold mb-2">Качество</div>
                        <div className="space-y-1">
                          <button
                            onClick={() => changeQuality(-1)}
                            className={`block w-full text-left px-3 py-1 rounded ${
                              currentQuality === -1 ? 'bg-red-600' : 'hover:bg-gray-800'
                            }`}
                          >
                            Авто
                          </button>
                          {qualities.map((quality: any, index: number) => (
                            <button
                              key={index}
                              onClick={() => changeQuality(index)}
                              className={`block w-full text-left px-3 py-1 rounded ${
                                currentQuality === index ? 'bg-red-600' : 'hover:bg-gray-800'
                              }`}
                            >
                              {quality.height}p
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PiP */}
              <button onClick={togglePiP} className="hover:text-red-600 transition-colors">
                <PictureInPicture className="w-6 h-6" />
              </button>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="hover:text-red-600 transition-colors">
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
