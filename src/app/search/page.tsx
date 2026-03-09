import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SearchResults from '@/components/search/SearchResults'
import { prisma } from '@/lib/prisma'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams
  
  if (!q) {
    return {
      title: 'Поиск - ETNOMEDIA',
      description: 'Поиск фильмов и сериалов'
    }
  }

  return {
    title: `Поиск: "${q}" - ETNOMEDIA`,
    description: `Результаты поиска по запросу "${q}"`
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams

  if (!q || q.trim().length < 2) {
    notFound()
  }

  const searchQuery = q.trim()

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
      description: true,
      posterUrl: true,
      year: true,
      rating: true,
      duration: true,
      genres: true
    },
    orderBy: [
      { rating: 'desc' },
      { year: 'desc' }
    ]
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
      description: true,
      posterUrl: true,
      year: true,
      rating: true,
      genres: true
    },
    orderBy: [
      { rating: 'desc' },
      { year: 'desc' }
    ]
  })

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchResults 
          query={searchQuery}
          movies={movies}
          series={series}
        />
      </div>
    </div>
  )
}
