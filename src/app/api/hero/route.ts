import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Получаем топ-7 фильмов по рейтингу
    const movies = await prisma.movie.findMany({
      take: 7,
      orderBy: {
        rating: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        rating: true,
        year: true,
        posterUrl: true,
        bgImage: true
      },
      where: {
        rating: {
          not: null
        }
      }
    })

    // Получаем топ-7 сериалов по рейтингу
    const series = await prisma.series.findMany({
      take: 7,
      orderBy: {
        rating: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        rating: true,
        year: true,
        posterUrl: true,
        bgImage: true
      },
      where: {
        rating: {
          not: null
        }
      }
    })

    // Объединяем и сортируем по рейтингу
    const allItems = [
      ...movies.map(item => ({ ...item, type: 'movie' as const })),
      ...series.map(item => ({ ...item, type: 'series' as const }))
    ]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 7)
      .map(item => ({
        ...item,
        rating: item.rating || 0,
        year: item.year || 2024
      }))

    return NextResponse.json(allItems)
  } catch (error) {
    console.error('Error fetching hero items:', error)
    return NextResponse.json([], { status: 500 })
  }
}
