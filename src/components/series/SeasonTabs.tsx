'use client'

import { useRouter } from 'next/navigation'

interface Episode {
  id: number
  season: number
  episodeNumber: number
  title: string | null
  m3u8Url: string
}

interface SeasonTabsProps {
  seasons: string[]
  currentSeason: number
  episodesBySeason: Record<number, Episode[]>
  seriesId: number
  currentEpisodeId?: number
}

export default function SeasonTabs({
  seasons,
  currentSeason,
  episodesBySeason,
  seriesId,
  currentEpisodeId
}: SeasonTabsProps) {
  const router = useRouter()

  return (
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
                router.push(`/series/${seriesId}?season=${firstEpisode.season}&episode=${firstEpisode.episodeNumber}`)
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
          <a
            key={ep.id}
            href={`/series/${seriesId}?season=${ep.season}&episode=${ep.episodeNumber}`}
            className={`p-4 rounded-lg transition-all ${
              currentEpisodeId === ep.id
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
          </a>
        ))}
      </div>
    </div>
  )
}
