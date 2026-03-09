import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminStats } from '@/types/admin'
import { Movie } from '@/types'
import StatsCard from '@/components/admin/StatsCard'
import RecentMoviesTable from '@/components/admin/RecentMoviesTable'
import { 
  Film, 
  Users, 
  Eye, 
  TrendingUp 
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Получаем статистику
  const stats: AdminStats = await getAdminStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Дашборд</h1>
        <p className="text-zinc-400">Обзор статистики и последние изменения</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Всего фильмов"
          value={stats.totalMovies}
          icon={<Film className="w-6 h-6" />}
          trend={undefined}
        />
        
        <StatsCard
          title="Всего пользователей"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6" />}
          trend={undefined}
        />
        
        <StatsCard
          title="Просмотров сегодня"
          value={stats.todayViews}
          icon={<Eye className="w-6 h-6" />}
          trend={undefined}
        />
        
        <StatsCard
          title="Активность"
          value="Высокая"
          icon={<TrendingUp className="w-6 h-6" />}
          trend={undefined}
        />
      </div>

      {/* Recent Movies */}
      <div className="bg-zinc-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Последние добавленные фильмы</h2>
        <RecentMoviesTable movies={stats.recentMovies} />
      </div>
    </div>
  )
}

async function getAdminStats(): Promise<AdminStats> {
  try {
    const [
      totalMovies,
      totalUsers,
      todayViews,
      recentMovies
    ] = await Promise.all([
      // Всего фильмов
      prisma.movie.count(),
      
      // Всего пользователей
      prisma.user.count(),
      
      // Просмотров сегодня
      prisma.watchHistory.count({
        where: {
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Последние фильмы
      prisma.movie.findMany({
        take: 10,
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
          bgImage: true,
          duration: true,
          addedById: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ])

    return {
      totalMovies,
      totalUsers,
      todayViews,
      recentMovies: recentMovies.map((movie: Movie) => ({
        ...movie,
        description: movie.description || '',
        posterUrl: movie.posterUrl || '',
        m3u8Url: movie.m3u8Url || '',
        genres: movie.genres || '',
        actors: movie.actors || '',
        directors: movie.directors || '',
        trailerUrl: movie.trailerUrl || undefined,
        rating: movie.rating || undefined,
        year: movie.year || undefined,
        bgImage: movie.bgImage || null,
        duration: movie.duration || null,
        addedById: movie.addedById || null
      }))
    }
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    
    // Возвращаем дефолтные значения при ошибке
    return {
      totalMovies: 0,
      totalUsers: 0,
      todayViews: 0,
      recentMovies: []
    }
  }
}
