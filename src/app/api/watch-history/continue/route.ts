import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем последнюю запись просмотра
    const lastWatched = await prisma.watchHistory.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        movie: true,
        episode: {
          include: {
            series: true
          }
        }
      }
    })

    if (!lastWatched) {
      return NextResponse.json({ continueWatching: null })
    }

    // Формируем данные для оверлея
    let continueData = null

    if (lastWatched.movie) {
      continueData = {
        type: 'movie',
        id: lastWatched.movie.id,
        title: lastWatched.movie.title,
        timecode: lastWatched.timecode,
        duration: lastWatched.movie.duration || undefined,
        posterUrl: lastWatched.movie.posterUrl || undefined
      }
    } else if (lastWatched.episode && lastWatched.episode.series) {
      continueData = {
        type: 'episode',
        title: lastWatched.episode.series.title,
        timecode: lastWatched.timecode,
        duration: lastWatched.episode.duration || undefined,
        posterUrl: lastWatched.episode.posterUrl || undefined,
        seriesName: lastWatched.episode.series.title,
        season: lastWatched.episode.season,
        episodeNumber: lastWatched.episode.episodeNumber,
        episodeTitle: lastWatched.episode.title || undefined
      }
    }

    return NextResponse.json({ continueWatching: continueData })

  } catch (error) {
    console.error('Continue watching error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
