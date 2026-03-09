import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GenreContent from '@/components/genre/GenreContent'
import { prisma } from '@/lib/prisma'

interface GenrePageProps {
  params: Promise<{ genre: string }>
  searchParams: Promise<{ type?: 'movie' | 'series', page?: string }>
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { genre } = await params
  const genreName = decodeURIComponent(genre).charAt(0).toUpperCase() + decodeURIComponent(genre).slice(1)
  
  return {
    title: `${genreName} - ETNOMEDIA`,
    description: `Фильмы и сериалы в жанре "${genreName}"`
  }
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { genre } = await params
  const { type, page } = await searchParams
  
  const genreName = decodeURIComponent(genre)
  const currentPage = parseInt(page || '1', 10)
  const itemsPerPage = 20
  
  // Поиск фильмов по жанру
  const movies = await prisma.movie.findMany({
    where: {
      genres: {
        contains: genreName,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      posterUrl: true,
      year: true,
      rating: true,
      duration: true,
      genres: true
    },
    orderBy: [
      { rating: 'desc' },
      { year: 'desc' },
      { title: 'asc' }
    ],
    skip: type === 'series' ? 0 : (currentPage - 1) * itemsPerPage,
    take: type === 'series' ? 0 : itemsPerPage
  })

  // Поиск сериалов по жанру
  const series = await prisma.series.findMany({
    where: {
      genres: {
        contains: genreName,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      title: true,
      description: true,
      posterUrl: true,
      year: true,
      rating: true,
      genres: true
    },
    orderBy: [
      { rating: 'desc' },
      { year: 'desc' },
      { title: 'asc' }
    ],
    skip: type === 'movie' ? 0 : (currentPage - 1) * itemsPerPage,
    take: type === 'movie' ? 0 : itemsPerPage
  })

  // Получаем общее количество для пагинации
  const [totalMovies, totalSeries] = await Promise.all([
    prisma.movie.count({
      where: {
        genres: {
          contains: genreName,
          mode: 'insensitive'
        }
      }
    }),
    prisma.series.count({
      where: {
        genres: {
          contains: genreName,
          mode: 'insensitive'
        }
      }
    })
  ])

  // Проверяем, что такой жанр существует
  if (totalMovies === 0 && totalSeries === 0) {
    notFound()
  }

  const totalItems = type === 'movie' ? totalMovies : type === 'series' ? totalSeries : totalMovies + totalSeries
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GenreContent 
          genreName={genreName}
          movies={movies}
          series={series}
          totalMovies={totalMovies}
          totalSeries={totalSeries}
          currentPage={currentPage}
          totalPages={totalPages}
          currentType={type}
        />
      </div>
    </div>
  )
}
