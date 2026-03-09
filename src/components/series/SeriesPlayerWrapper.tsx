'use client'

import { useRouter } from 'next/navigation'
import CustomVideoPlayer from '@/components/player/CustomVideoPlayer'

interface Episode {
  id: number
  season: number
  episodeNumber: number
  title: string | null
  m3u8Url: string
}

interface SeriesPlayerWrapperProps {
  videoUrl: string
  posterUrl?: string
  currentEpisode: Episode
  nextEpisode?: Episode
  seriesId: number
}

export default function SeriesPlayerWrapper({
  videoUrl,
  posterUrl,
  currentEpisode,
  nextEpisode,
  seriesId
}: SeriesPlayerWrapperProps) {
  const router = useRouter()

  const handleNextEpisode = () => {
    if (nextEpisode) {
      router.push(`/series/${seriesId}?season=${nextEpisode.season}&episode=${nextEpisode.episodeNumber}`)
    }
  }

  return (
    <CustomVideoPlayer
      videoUrl={videoUrl}
      posterUrl={posterUrl}
      currentEpisode={currentEpisode}
      nextEpisode={nextEpisode}
      onNextEpisode={handleNextEpisode}
      seriesId={seriesId}
    />
  )
}
