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
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [qualities, setQualities] = useState<Array<{ height: number, bitrate: number }>>([])
  const [currentQuality, setCurrentQuality] = useState(-1)
  const [showNextEpisode, setShowNextEpisode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
        const parsedQualities = data.levels.map((level: any) => ({
          height: level.height,
          bitrate: level.bitrate
        }))
        setQualities(parsedQualities)
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
      // Native HLS support (Safari)
      video.src = videoUrl
      setIsLoading(false)
    }
  }, [videoUrl, initialTime])

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
          saveProgressToServer(currentTime, duration)
          localStorage.setItem(getWatchKey(), currentTime.toString())
        } else {
          localStorage.removeItem(getWatchKey())
        }
      }, 10000)
    }
  }, [currentTime, duration, saveProgressToServer])

  // Show next episode button
  useEffect(() => {
    if (!nextEpisode || !duration || !hasStartedPlaying) return

    const timeRemaining = duration - currentTime
    const watchProgress = currentTime / duration
    
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

    const handleLoadedMetadata = () => setDuration(video.duration)
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

  const toggleMute = useCallback(() => setIsMuted(!isMuted), [isMuted])

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current || !videoRef.current) return
    
    const container = containerRef.current
    const video = videoRef.current as any
    const doc = document as any
    
    const isCurrentlyFull = !!(doc.fullscreenElement || 
                               doc.webkitFullscreenElement || 
                               doc.mozFullScreenElement || 
                               doc.msFullscreenElement)

    if (!isCurrentlyFull) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen()
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen()
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen()
        } else if ((container as any).mozRequestFullScreen) {
          await (container as any).mozRequestFullScreen()
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen()
        }
      } catch (err) {
        console.error("Fullscreen error:", err)
      }
    } else {
      try {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen()
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen()
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen()
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen()
        }
      } catch (err) {
        console.error("Exit fullscreen error:", err)
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const doc = document as any

    const handleFsChange = () => {
      const isFs = !!(doc.fullscreenElement || 
                      doc.webkitFullscreenElement || 
                      doc.mozFullScreenElement || 
                      doc.msFullscreenElement)
      setIsFullscreen(isFs)
    }

    doc.addEventListener('fullscreenchange', handleFsChange)
    doc.addEventListener('webkitfullscreenchange', handleFsChange)
    doc.addEventListener('mozfullscreenchange', handleFsChange)
    doc.addEventListener('MSFullscreenChange', handleFsChange)

    const handleWebkitBeginFs = () => setIsFullscreen(true)
    const handleWebkitEndFs = () => setIsFullscreen(false)

    if (video) {
      video.addEventListener('webkitbeginfullscreen', handleWebkitBeginFs)
      video.addEventListener('webkitendfullscreen', handleWebkitEndFs)
    }

    return () => {
      doc.removeEventListener('fullscreenchange', handleFsChange)
      doc.removeEventListener('webkitfullscreenchange', handleFsChange)
      doc.removeEventListener('mozfullscreenchange', handleFsChange)
      doc.removeEventListener('MSFullscreenChange', handleFsChange)
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', handleWebkitBeginFs)
        video.removeEventListener('webkitendfullscreen', handleWebkitEndFs)
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

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

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
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [duration, nextEpisode, onNextEpisode, togglePlay, toggleMute, toggleFullscreen, togglePiP])

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
        setShowSettings(false)
        setShowQualityMenu(false)
        setShowSpeedMenu(false)
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
      setShowQualityMenu(false)
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
      setShowSpeedMenu(false)
    }
  }

  // Update volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const getCurrentQualityDisplay = () => {
    if (currentQuality === -1) return 'Авто'
    const quality = qualities[currentQuality]
    return quality ? `${quality.height}p` : 'Авто'
  }

  const getCurrentSpeedDisplay = () => {
    return `${playbackRate}x`
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden group flex items-center justify-center transition-all ${
        isFullscreen ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none' : 'aspect-video rounded-lg'
      }`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={posterUrl}
        playsInline
        onClick={togglePlay}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) togglePlay()
        }}
      >
        {/* Top Bar - Episode Info */}
        {currentEpisode && (
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 pointer-events-none">
            <h2 className="text-lg md:text-xl font-bold text-white drop-shadow-md">
              Сезон {currentEpisode.season} Серия {currentEpisode.episodeNumber}
              {currentEpisode.title && `: ${currentEpisode.title}`}
            </h2>
          </div>
        )}

        {/* Next Episode Button */}
        {showNextEpisode && nextEpisode && (
          <div className="absolute top-16 md:top-6 right-4 md:right-6 pointer-events-auto">
            <button
              onClick={onNextEpisode}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm md:text-base shadow-lg"
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
              Следующая серия
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 pointer-events-auto">
          {/* Progress Bar */}
          <div 
            ref={progressBarRef}
            className="relative h-1 sm:h-1.5 bg-gray-600/50 rounded-full cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            {/* Buffered */}
            <div 
              className="absolute h-full bg-gray-400/50 rounded-full transition-all duration-200"
              style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }}
            />
            {/* Progress */}
            <div 
              className="absolute h-full bg-red-600 rounded-full transition-all duration-200"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            {/* Hover indicator */}
            <div className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-600 rounded-full opacity-100 sm:opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-sm"
              style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button onClick={togglePlay} className="hover:text-red-500 transition-colors p-1">
                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-8 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-8 fill-current" />}
              </button>

              <div className="flex items-center gap-1 sm:gap-2 group/volume">
                <button onClick={toggleMute} className="hover:text-red-500 transition-colors p-1">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
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
                  className="w-0 opacity-0 group-hover/volume:w-16 group-hover/volume:opacity-100 transition-all duration-300 accent-red-600 cursor-pointer sm:w-20"
                />
              </div>

              <span className="text-xs font-medium tracking-wide">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              {/* Settings */}
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`hover:text-red-500 transition-colors p-1 ${showSettings ? 'text-red-500' : ''}`}
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* NEW SETTINGS MENU WITH SEPARATE BUTTONS */}
                {showSettings && (
                  <div className={`absolute ${isMobile ? 'bottom-[calc(100%+0.5rem)] right-0 w-[140px]' : 'bottom-[calc(100%+1rem)] right-0 w-[240px]'} bg-[#1e1e1e]/95 backdrop-blur-md border border-white/10 rounded-xl ${isMobile ? 'p-1' : 'p-3'} shadow-2xl z-50`}>
                    
                    {/* Quality Button */}
                    {qualities.length > 0 && (
                      <div className={`relative ${isMobile ? 'mb-1' : 'mb-2'}`}>
                        <button
                          onClick={() => setShowQualityMenu(!showQualityMenu)}
                          className={`w-full flex items-center justify-between ${isMobile ? 'px-1 py-0.5' : 'px-3 py-2'} bg-white/5 hover:bg-white/10 ${isMobile ? 'rounded' : 'rounded-lg'} transition-colors ${isMobile ? 'text-[7px]' : 'text-sm'} text-white`}
                        >
                          <span>Качество</span>
                          <span className="text-red-400 font-medium">{getCurrentQualityDisplay()}</span>
                        </button>
                        
                        {/* Quality Dropdown */}
                        {showQualityMenu && (
                          <div className={`absolute bottom-[calc(100%+0.25rem)] left-0 right-0 bg-[#1e1e1e]/95 backdrop-blur-md border border-white/10 ${isMobile ? 'rounded p-1' : 'rounded-lg p-2'} z-10`}>
                            <button
                              onClick={() => changeQuality(-1)}
                              className={`block w-full text-left ${isMobile ? 'px-1 py-0.5' : 'px-3 py-2'} ${isMobile ? 'rounded' : 'rounded-lg'} ${isMobile ? 'text-[7px]' : 'text-sm'} transition-colors ${
                                currentQuality === -1 ? 'bg-red-600/90 text-white font-medium' : 'hover:bg-white/10 text-gray-200'
                              }`}
                            >
                              {isMobile ? 'Авто' : 'Автоматически'}
                            </button>
                            {qualities.map((quality: any, index: number) => (
                              <button
                                key={index}
                                onClick={() => changeQuality(index)}
                                className={`block w-full text-left ${isMobile ? 'px-1 py-0.5' : 'px-3 py-2'} ${isMobile ? 'rounded' : 'rounded-lg'} ${isMobile ? 'text-[7px]' : 'text-sm'} transition-colors ${
                                  currentQuality === index ? 'bg-red-600/90 text-white font-medium' : 'hover:bg-white/10 text-gray-200'
                                }`}
                              >
                                {quality.height}p
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Speed Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className={`w-full flex items-center justify-between ${isMobile ? 'px-1 py-0.5' : 'px-3 py-2'} bg-white/5 hover:bg-white/10 ${isMobile ? 'rounded' : 'rounded-lg'} transition-colors ${isMobile ? 'text-[7px]' : 'text-sm'} text-white`}
                      >
                        <span>Скорость</span>
                        <span className="text-red-400 font-medium">{getCurrentSpeedDisplay()}</span>
                      </button>
                      
                      {/* Speed Dropdown */}
                      {showSpeedMenu && (
                        <div className={`absolute bottom-[calc(100%+0.25rem)] left-0 right-0 bg-[#1e1e1e]/95 backdrop-blur-md border border-white/10 ${isMobile ? 'rounded p-1' : 'rounded-lg p-2'} z-10`}>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate: number) => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`block w-full text-left ${isMobile ? 'px-1 py-0.5' : 'px-3 py-2'} ${isMobile ? 'rounded' : 'rounded-lg'} ${isMobile ? 'text-[7px]' : 'text-sm'} transition-colors ${
                                playbackRate === rate ? 'bg-red-600/90 text-white font-medium' : 'hover:bg-white/10 text-gray-200'
                              }`}
                            >
                              {rate}x {!isMobile && rate === 1 && <span className="text-xs opacity-75 ml-1">(Обычная)</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={togglePiP} className="hidden sm:block hover:text-red-500 transition-colors p-1">
                <PictureInPicture className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button onClick={toggleFullscreen} className="hover:text-red-500 transition-colors p-1">
                {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}