import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SeriesPageClient from '@/components/series/SeriesPageClient'
import { getUser } from '@/lib/auth'
import { isMaintenanceMode } from '@/lib/settings'
import MaintenanceMode from '@/components/MaintenanceMode'

export const dynamic = 'force-dynamic'

interface SeriesPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    season?: string
    episode?: string
  }>
}

export default async function SeriesPage({ params, searchParams }: SeriesPageProps) {
  // Проверка авторизации
  const user = await getUser()
  
  if (!user) {
    const { id } = await params
    redirect('/login?redirect=/series/' + id)
  }

  // Проверка режима обслуживания (админы могут смотреть)
  const maintenanceMode = await isMaintenanceMode()
  if (maintenanceMode && user.role !== 'ADMIN') {
    return <MaintenanceMode />
  }

  const { id } = await params
  const { season, episode } = await searchParams
  
  const series = await prisma.series.findUnique({
    where: { id: parseInt(id) },
    include: {
      episodes: {
        orderBy: [
          { season: 'asc' },
          { episodeNumber: 'asc' }
        ]
      }
    }
  })

  if (!series) {
    notFound()
  }

  // If no season/episode specified, redirect to first episode
  if (!season || !episode) {
    const firstEpisode = series.episodes[0]
    if (firstEpisode) {
      redirect(`/series/${id}?season=${firstEpisode.season}&episode=${firstEpisode.episodeNumber}`)
    }
  }

  const currentSeason = season ? parseInt(season) : 1
  const currentEpisodeNum = episode ? parseInt(episode) : 1

  return (
    <SeriesPageClient 
      series={series}
      initialSeason={currentSeason}
      initialEpisode={currentEpisodeNum}
    />
  )
}
