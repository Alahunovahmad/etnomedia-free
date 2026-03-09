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
    const { movieId, timecode } = body

    // Валидация данных
    if (!movieId || timecode === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: movieId, timecode' 
      }, { status: 400 })
    }

    if (typeof movieId !== 'number' || typeof timecode !== 'number') {
      return NextResponse.json({ 
        error: 'Invalid data types: movieId must be number, timecode must be number' 
      }, { status: 400 })
    }

    if (timecode < 0) {
      return NextResponse.json({ 
        error: 'Timecode cannot be negative' 
      }, { status: 400 })
    }

    // Сначала ищем существующую запись
    const existingHistory = await prisma.watchHistory.findFirst({
      where: {
        userId: user.id,
        movieId: movieId
      }
    })

    let watchHistory;
    if (existingHistory) {
      // Обновляем существующую запись
      watchHistory = await prisma.watchHistory.update({
        where: { id: existingHistory.id },
        data: {
          timecode: timecode,
          updatedAt: new Date()
        }
      })
    } else {
      // Создаем новую запись
      watchHistory = await prisma.watchHistory.create({
        data: {
          userId: user.id,
          movieId: movieId,
          timecode: timecode
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      watchHistory: {
        id: watchHistory.id,
        movieId: watchHistory.movieId,
        timecode: watchHistory.timecode,
        updatedAt: watchHistory.updatedAt
      }
    })

  } catch (error) {
    console.error('Save watch history error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
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

    if (!movieId) {
      return NextResponse.json({ 
        error: 'Missing movieId parameter' 
      }, { status: 400 })
    }

    const movieIdNum = parseInt(movieId)
    if (isNaN(movieIdNum)) {
      return NextResponse.json({ 
        error: 'Invalid movieId' 
      }, { status: 400 })
    }

    // Получаем прогресс просмотра для конкретного фильма
    const watchHistory = await prisma.watchHistory.findFirst({
      where: {
        userId: user.id,
        movieId: movieIdNum
      }
    })

    return NextResponse.json({ 
      success: true,
      watchHistory: watchHistory ? {
        id: watchHistory.id,
        movieId: watchHistory.movieId,
        timecode: watchHistory.timecode,
        updatedAt: watchHistory.updatedAt
      } : null
    })

  } catch (error) {
    console.error('Get watch history error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
