// Карта файла: список сериалов в админке с пагинацией по 50 записей.
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Tv } from 'lucide-react'
import SeriesTable from '@/components/admin/SeriesTable'
import AdminPagination from '@/components/admin/AdminPagination'

const PAGE_SIZE = 50

interface AdminSeriesProps {
  searchParams: Promise<{ page?: string }>
}

// Нормализует номер страницы из query-параметра.
function parsePage(raw?: string): number {
  const page = parseInt(raw || '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

// Страница управления сериалами: полный count + порция текущей страницы.
export default async function AdminSeries({ searchParams }: AdminSeriesProps) {
  const { page: pageParam } = await searchParams
  const page = parsePage(pageParam)
  const skip = (page - 1) * PAGE_SIZE

  const [total, series] = await Promise.all([
    prisma.series.count(),
    prisma.series.findMany({
      skip,
      take: PAGE_SIZE,
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
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
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

      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Tv className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Все сериалы</h2>
          <span className="text-zinc-400">({total})</span>
        </div>

        <SeriesTable series={series} />
        <AdminPagination basePath="/admin/series" page={page} totalPages={totalPages} />
      </div>
    </div>
  )
}
