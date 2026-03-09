import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Film } from 'lucide-react'
import MoviesTable from '@/components/admin/MoviesTable'

export default async function AdminMovies() {
  // Получаем последние 20 фильмов
  const movies = await prisma.movie.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      posterUrl: true,
      m3u8Url: true,
      rating: true,
      year: true,
      genres: true,
      actors: true,
      directors: true,
      trailerUrl: true,
      createdAt: true,
      updatedAt: true
    }
  })

  // Форматируем данные для соответствия типу Movie
  const formattedMovies = movies.map(movie => ({
    ...movie,
    description: movie.description || '',
    posterUrl: movie.posterUrl || '',
    m3u8Url: movie.m3u8Url || '',
    genres: movie.genres || '',
    actors: movie.actors || '',
    directors: movie.directors || '',
    trailerUrl: movie.trailerUrl || undefined,
    rating: movie.rating || undefined,
    year: movie.year || undefined
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Фильмы</h1>
          <p className="text-zinc-400">Управление фильмами и сериалами</p>
        </div>
        
        <Link
          href="/admin/movies/add"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить фильм
        </Link>
      </div>

      {/* Movies Table */}
      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Film className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Все фильмы</h2>
          <span className="text-zinc-400">({formattedMovies.length})</span>
        </div>
        
        <MoviesTable movies={formattedMovies} />
      </div>
    </div>
  )
}
