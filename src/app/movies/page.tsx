import MovieCard from '@/components/shared/MovieCard'
import { prisma } from '@/lib/prisma'
import { isMaintenanceMode } from '@/lib/settings'
import { getUser } from '@/lib/auth'
import MaintenanceMode from '@/components/MaintenanceMode'
import { Movie } from '@/types'

export const dynamic = 'force-dynamic'

export default async function MoviesPage() {
  // Проверка режима обслуживания
  const maintenanceMode = await isMaintenanceMode()
  const user = await getUser()
  
  if (maintenanceMode && (!user || user.role !== 'ADMIN')) {
    return <MaintenanceMode />
  }

  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Все фильмы</h1>
        
        {movies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Фильмы не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie: Movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
