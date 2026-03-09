import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { movieId, episodeId, currentTime, seriesId, season, episodeNumber } = body

    if (!movieId && !episodeId) {
      return NextResponse.json({ error: 'Movie ID or Episode ID required' }, { status: 400 })
    }

    if (currentTime === undefined) {
      return NextResponse.json({ error: 'Current time required' }, { status: 400 })
    }

    // Удаляем старую запись для этого фильма/эпизода
    await prisma.watchHistory.deleteMany({
      where: {
        userId: user.id,
        movieId: movieId || null,
        episodeId: episodeId || null,
      }
    })

    // Создаем новую запись
    const watchHistory = await prisma.watchHistory.create({
      data: {
        userId: user.id,
        movieId: movieId || null,
        episodeId: episodeId || null,
        timecode: currentTime
      },
      include: {
        movie: true,
        episode: {
          include: {
            series: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, watchHistory })

  } catch (error) {
    console.error('Watch history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const episodeId = searchParams.get('episodeId')

    let watchHistory

    if (movieId) {
      watchHistory = await prisma.watchHistory.findFirst({
        where: {
          userId: user.id,
          movieId: parseInt(movieId)
        }
      })
    } else if (episodeId) {
      watchHistory = await prisma.watchHistory.findFirst({
        where: {
          userId: user.id,
          episodeId: parseInt(episodeId)
        }
      })
    } else {
      // Получаем всю историю просмотра
      watchHistory = await prisma.watchHistory.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })
    }

    return NextResponse.json({ watchHistory })

  } catch (error) {
    console.error('Watch history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
