import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Plus, Film } from 'lucide-react'
import EpisodesTable from '@/components/admin/EpisodesTable'

interface EpisodesPageProps {
  params: Promise<{ id: string }>
}

export default async function SeriesEpisodesPage({ params }: EpisodesPageProps) {
  const { id } = await params
  const seriesId = parseInt(id)

  // Получаем сериал с эпизодами
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    include: {
      episodes: {
        orderBy: [
          { season: 'asc' },
          { episodeNumber: 'asc' }
        ]
      }
    }
  })

  if (!series) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">Сериал не найден</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/series"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{series.title}</h1>
            <p className="text-zinc-400">Управление эпизодами</p>
          </div>
        </div>
        
        <Link
          href={`/admin/series/${seriesId}/episodes/add`}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Добавить эпизод
        </Link>
      </div>

      {/* Episodes Table */}
      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Film className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Все эпизоды</h2>
          <span className="text-zinc-400">({series.episodes.length})</span>
        </div>
        
        <EpisodesTable episodes={series.episodes} seriesId={seriesId} />
      </div>
    </div>
  )
}
