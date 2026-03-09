import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchQuery = query.trim()

    // Поиск фильмов
    const movies = await prisma.movie.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { actors: { contains: searchQuery, mode: 'insensitive' } },
          { directors: { contains: searchQuery, mode: 'insensitive' } },
          { genres: { contains: searchQuery, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        posterUrl: true,
        year: true,
        rating: true
      },
      take: 10
    })

    // Поиск сериалов
    const series = await prisma.series.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { actors: { contains: searchQuery, mode: 'insensitive' } },
          { directors: { contains: searchQuery, mode: 'insensitive' } },
          { genres: { contains: searchQuery, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        posterUrl: true,
        year: true,
        rating: true
      },
      take: 10
    })

    // Объединяем результаты и добавляем тип
    const results = [
      ...movies.map(movie => ({ ...movie, type: 'movie' as const })),
      ...series.map(serie => ({ ...serie, type: 'series' as const }))
    ]

    // Сортируем по релевантности (точное совпадение в начале строки в приоритете)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const queryLower = searchQuery.toLowerCase()
      
      const aStartsWith = aTitle.startsWith(queryLower)
      const bStartsWith = bTitle.startsWith(queryLower)
      
      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1
      
      return 0
    })

    return NextResponse.json({ 
      results: results.slice(0, 10) // Ограничиваем до 10 результатов
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
