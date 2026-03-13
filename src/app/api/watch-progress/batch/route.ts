import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const movieIds = searchParams.get('movieIds')
    
    if (!movieIds) {
      return NextResponse.json({ error: 'movieIds parameter required' }, { status: 400 })
    }

    const ids = movieIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
    
    if (ids.length === 0) {
      return NextResponse.json({})
    }

    // Получаем прогресс для всех фильмов одним запросом
    const watchHistory = await prisma.watchHistory.findMany({
      where: {
        movieId: {
          in: ids
        }
      },
      select: {
        movieId: true,
        timecode: true
      }
    })

    // Конвертируем в объект для удобного использования
    const progress: Record<number, number> = {}
    watchHistory.forEach(item => {
      if (item.movieId !== null) {
        progress[item.movieId] = item.timecode
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    // Не выводим ошибки в консоль для чистоты логов
    return NextResponse.json({}, { status: 500 })
  }
}
