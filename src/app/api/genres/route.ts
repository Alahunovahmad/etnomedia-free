import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Получаем все уникальные жанры из фильмов
    const movies = await prisma.movie.findMany({
      where: {
        genres: {
          not: null
        }
      },
      select: {
        genres: true
      }
    })

    // Получаем все уникальные жанры из сериалов
    const series = await prisma.series.findMany({
      where: {
        genres: {
          not: null
        }
      },
      select: {
        genres: true
      }
    })

    // Собираем все жанры в один массив
    const allGenres = new Set<string>()

    // Добавляем жанры из фильмов
    movies.forEach(movie => {
      if (movie.genres) {
        movie.genres.split(',').forEach(genre => {
          const trimmedGenre = genre.trim()
          if (trimmedGenre) {
            allGenres.add(trimmedGenre)
          }
        })
      }
    })

    // Добавляем жанры из сериалов
    series.forEach(serie => {
      if (serie.genres) {
        serie.genres.split(',').forEach(genre => {
          const trimmedGenre = genre.trim()
          if (trimmedGenre) {
            allGenres.add(trimmedGenre)
          }
        })
      }
    })

    // Преобразуем в массив и сортируем по алфавиту
    const sortedGenres = Array.from(allGenres).sort((a, b) => a.localeCompare(b, 'ru'))

    // Добавляем счетчики для каждого жанра
    const genresWithCounts = await Promise.all(
      sortedGenres.map(async (genre) => {
        // Считаем фильмы с этим жанром
        const movieCount = await prisma.movie.count({
          where: {
            genres: {
              contains: genre,
              mode: 'insensitive'
            }
          }
        })

        // Считаем сериалы с этим жанром
        const seriesCount = await prisma.series.count({
          where: {
            genres: {
              contains: genre,
              mode: 'insensitive'
            }
          }
        })

        return {
          name: genre,
          movieCount,
          seriesCount,
          totalCount: movieCount + seriesCount
        }
      })
    )

    // Сортируем по общему количеству (популярности)
    genresWithCounts.sort((a, b) => b.totalCount - a.totalCount)

    return NextResponse.json({
      genres: genresWithCounts,
      totalGenres: genresWithCounts.length
    })

  } catch (error) {
    console.error('Genres API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
