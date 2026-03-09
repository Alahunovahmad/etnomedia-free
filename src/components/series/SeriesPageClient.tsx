'use client'

import { useState, useEffect } from 'react'
import CustomVideoPlayer from '@/components/player/CustomVideoPlayer'

interface Episode {
  id: number
  season: number
  episodeNumber: number
  title: string | null
  m3u8Url: string
  createdAt: Date
}

interface Series {
  id: number
  title: string
  description: string | null
  posterUrl: string | null
  bgImage: string | null
  year: number | null
  rating: number | null
  actors: string | null
  directors: string | null
  genres: string | null
  episodes: Episode[]
}

interface SeriesPageClientProps {
  series: Series
  initialSeason: number
  initialEpisode: number
}

export default function SeriesPageClient({ 
  series, 
  initialSeason, 
  initialEpisode 
}: SeriesPageClientProps) {
  const [currentSeason, setCurrentSeason] = useState(initialSeason)
  const [currentEpisodeNum, setCurrentEpisodeNum] = useState(initialEpisode)

  // Group episodes by season
  const episodesBySeason = series.episodes.reduce((acc, ep) => {
    if (!acc[ep.season]) {
      acc[ep.season] = []
    }
    acc[ep.season].push(ep)
    return acc
  }, {} as Record<number, Episode[]>)

  const seasons = Object.keys(episodesBySeason).sort((a, b) => parseInt(a) - parseInt(b))

  // Get current episode
  const currentEpisode = series.episodes.find(
    ep => ep.season === currentSeason && ep.episodeNumber === currentEpisodeNum
  ) || series.episodes[0]

  // Find next episode
  const currentIndex = series.episodes.findIndex(ep => ep.id === currentEpisode?.id)
  const nextEpisode = currentIndex >= 0 && currentIndex < series.episodes.length - 1 
    ? series.episodes[currentIndex + 1] 
    : undefined

  const handleEpisodeChange = (season: number, episode: number) => {
    setCurrentSeason(season)
    setCurrentEpisodeNum(episode)
    // Update URL without reload
    window.history.pushState({}, '', `/series/${series.id}?season=${season}&episode=${episode}`)
  }

  const handleNextEpisode = () => {
    if (nextEpisode) {
      handleEpisodeChange(nextEpisode.season, nextEpisode.episodeNumber)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player */}
        {currentEpisode && (
          <div className="mb-6">
            <CustomVideoPlayer 
              key={`${currentEpisode.season}-${currentEpisode.episodeNumber}`}
              videoUrl={currentEpisode.m3u8Url} 
              posterUrl={series.posterUrl || undefined}
              currentEpisode={{
                id: currentEpisode.id,
                season: currentEpisode.season,
                episodeNumber: currentEpisode.episodeNumber,
                title: currentEpisode.title,
                m3u8Url: currentEpisode.m3u8Url
              }}
              nextEpisode={nextEpisode ? {
                id: nextEpisode.id,
                season: nextEpisode.season,
                episodeNumber: nextEpisode.episodeNumber,
                title: nextEpisode.title,
                m3u8Url: nextEpisode.m3u8Url
              } : undefined}
              onNextEpisode={handleNextEpisode}
              seriesId={series.id}
            />
          </div>
        )}

        {/* Season Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {seasons.map((seasonNum: string) => {
              const isActive = parseInt(seasonNum) === currentSeason
              return (
                <button
                  key={seasonNum}
                  className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    const firstEpisode = episodesBySeason[parseInt(seasonNum)][0]
                    handleEpisodeChange(firstEpisode.season, firstEpisode.episodeNumber)
                  }}
                >
                  Сезон {seasonNum}
                </button>
              )
            })}
          </div>

          {/* Episodes Grid for Active Season */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {episodesBySeason[currentSeason]?.map((ep: Episode) => (
              <button
                key={ep.id}
                onClick={() => handleEpisodeChange(ep.season, ep.episodeNumber)}
                className={`p-4 rounded-lg transition-all ${
                  currentEpisode?.id === ep.id
                    ? 'bg-red-600 ring-2 ring-red-400'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="font-semibold text-center">
                  Серия {ep.episodeNumber}
                </div>
                {ep.title && (
                  <div className="text-xs text-gray-300 mt-1 text-center line-clamp-2">
                    {ep.title}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Series Info */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{series.title}</h1>
            
            {series.description && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Описание</h3>
                <p className="text-gray-300">{series.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              {series.year && (
                <div>
                  <span className="text-gray-400">Год:</span>
                  <span className="ml-2">{series.year}</span>
                </div>
              )}
              
              {series.rating && (
                <div>
                  <span className="text-gray-400">Рейтинг:</span>
                  <span className="ml-2 text-yellow-400">★ {series.rating}</span>
                </div>
              )}
            </div>

            {(series.actors || series.directors || series.genres) && (
              <div className="space-y-4">
                {series.actors && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Актеры</h3>
                    <p className="text-gray-300">{series.actors}</p>
                  </div>
                )}
                
                {series.directors && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Режиссеры</h3>
                    <p className="text-gray-300">{series.directors}</p>
                  </div>
                )}
                
                {series.genres && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Жанры</h3>
                    <div className="flex flex-wrap gap-2">
                      {series.genres.split(',').map((genre: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-red-600 rounded-full text-sm"
                        >
                          {genre.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Poster Sidebar */}
          <div className="space-y-6">
            {series.posterUrl && (
              <img 
                src={series.posterUrl} 
                alt={series.title}
                className="w-full rounded-lg"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
