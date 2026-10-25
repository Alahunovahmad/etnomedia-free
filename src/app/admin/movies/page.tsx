// Карта файла: список фильмов в админке с пагинацией по 50 записей.
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Film } from 'lucide-react'
import MoviesTable from '@/components/admin/MoviesTable'
import AdminPagination from '@/components/admin/AdminPagination'

const PAGE_SIZE = 50

interface AdminMoviesProps {
  searchParams: Promise<{ page?: string }>
}

// Нормализует номер страницы из query-параметра.
function parsePage(raw?: string): number {
  const page = parseInt(raw || '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

// Страница управления фильмами: полный count + порция текущей страницы.
export default async function AdminMovies({ searchParams }: AdminMoviesProps) {
  const { page: pageParam } = await searchParams
  const page = parsePage(pageParam)
  const skip = (page - 1) * PAGE_SIZE

  const [total, movies] = await Promise.all([
    prisma.movie.count(),
    prisma.movie.findMany({
      skip,
      take: PAGE_SIZE,
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
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const formattedMovies = movies.map((movie: any) => ({
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

      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Film className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Все фильмы</h2>
          <span className="text-zinc-400">({total})</span>
        </div>

        <MoviesTable movies={formattedMovies} />
        <AdminPagination basePath="/admin/movies" page={page} totalPages={totalPages} />
      </div>
    </div>
  )
}
