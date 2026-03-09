import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import GenreGrid from '@/components/genre/GenreGrid'

interface GenrePageProps {
  params: Promise<{ genre: string }>
  searchParams: Promise<{ page?: string }>
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
  const { page } = await searchParams
  
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
    ]
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
    ]
  })

  // Объединяем фильмы и сериалы в один массив
  const allItems = [
    ...movies.map(movie => ({ ...movie, type: 'movie' as const })),
    ...series.map(serie => ({ ...serie, type: 'series' as const }))
  ]

  // Сортируем по рейтингу
  allItems.sort((a, b) => (b.rating || 0) - (a.rating || 0))

  // Пагинация
  const totalItems = allItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = allItems.slice(startIndex, endIndex)

  // Проверяем, что такой жанр существует
  if (totalItems === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GenreGrid 
          genreName={genreName}
          items={paginatedItems}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
