import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminStats } from '@/types/admin'
import { Movie } from '@/types'
import StatsCard from '@/components/admin/StatsCard'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'
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

      {/* Analytics */}
      <AnalyticsDashboard />
    </div>
  )
}

async function getAdminStats(): Promise<AdminStats> {
  try {
    const [
      totalMovies,
      totalUsers,
      todayViews
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
      })
    ])

    return {
      totalMovies,
      totalUsers,
      todayViews,
      recentMovies: [] // Пустой массив, так как не используется
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
