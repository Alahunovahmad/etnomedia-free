import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Tv, Play, Edit, Trash2, Calendar, Star } from 'lucide-react'
import SeriesTable from '@/components/admin/SeriesTable'

export default async function AdminSeries() {
  // Получаем все сериалы с эпизодами
  const series = await prisma.series.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      episodes: {
        orderBy: [
          { season: 'asc' },
          { episodeNumber: 'asc' }
        ]
      },
      _count: {
        select: {
          episodes: true
        }
      }
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Сериалы</h1>
          <p className="text-zinc-400">Управление сериалами и эпизодами</p>
        </div>
        
        <Link
          href="/admin/series/add"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить сериал
        </Link>
      </div>

      {/* Series Table */}
      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Tv className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Все сериалы</h2>
          <span className="text-zinc-400">({series.length})</span>
        </div>
        
        <SeriesTable series={series} />
      </div>
    </div>
  )
}
