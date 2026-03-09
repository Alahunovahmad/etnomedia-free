'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tv, Play, Edit, Trash2, Calendar, Star, Plus, Film } from 'lucide-react'
import EditModal from './EditModal'

interface Series {
  id: number
  title: string
  description: string | null
  posterUrl: string | null
  year: number | null
  rating: number | null
  genres: string | null
  createdAt: Date
  episodes: Array<{
    id: number
    season: number
    episodeNumber: number
    title: string | null
    m3u8Url: string
  }>
  _count: {
    episodes: number
  }
}

interface SeriesTableProps {
  series: Series[]
}

export default function SeriesTable({ series }: SeriesTableProps) {
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)

  const handleEditSeries = (seriesItem: Series) => {
    setEditingSeries(seriesItem)
  }

  const handleSaveSeries = async (data: Partial<Series>) => {
    try {
      const response = await fetch(`/api/admin/series/${editingSeries?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.message }
      }
    } catch (error) {
      return { success: false, error: 'Ошибка при сохранении' }
    }
  }

  if (series.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <Tv className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-lg mb-2">Сериалы пока не добавлены</p>
        <p className="text-sm">Нажмите "Добавить сериал" чтобы начать</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-zinc-400 border-b border-zinc-800">
              <th className="pb-3 font-medium">Название</th>
              <th className="pb-3 font-medium">Год</th>
              <th className="pb-3 font-medium">Рейтинг</th>
              <th className="pb-3 font-medium">Эпизоды</th>
              <th className="pb-3 font-medium">Добавлен</th>
              <th className="pb-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {series.map((seriesItem: Series) => (
              <tr key={seriesItem.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="py-4">
                  <div className="flex items-start gap-3">
                    {seriesItem.posterUrl && (
                      <img
                        src={seriesItem.posterUrl}
                        alt={seriesItem.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{seriesItem.title}</p>
                      {seriesItem.description && (
                        <p className="text-zinc-400 text-sm line-clamp-2 mt-1">
                          {seriesItem.description}
                        </p>
                      )}
                      {seriesItem.genres && (
                        <p className="text-zinc-500 text-xs mt-1">
                          {seriesItem.genres}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 text-zinc-300">
                  {seriesItem.year || '—'}
                </td>
                <td className="py-4">
                  {seriesItem.rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-white">{seriesItem.rating}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{seriesItem._count.episodes}</span>
                    <span className="text-zinc-400 text-sm">эпизодов</span>
                  </div>
                  {seriesItem.episodes.length > 0 && (
                    <div className="text-zinc-500 text-xs">
                      {Math.max(...seriesItem.episodes.map((e: any) => e.season))} сезон(ов)
                    </div>
                  )}
                </td>
                <td className="py-4 text-zinc-400">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(seriesItem.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-end gap-2">
                    {seriesItem.episodes.length > 0 && (
                      <Link
                        href={`/series/${seriesItem.id}`}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Смотреть сериал"
                        target="_blank"
                      >
                        <Play className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/series/${seriesItem.id}/episodes`}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Управление эпизодами"
                    >
                      <Film className="w-4 h-4" />
                    </Link>
                    <button
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Редактировать сериал"
                      onClick={() => handleEditSeries(seriesItem)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Удалить сериал"
                      onClick={() => handleDelete(seriesItem.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingSeries && (
        <EditModal
          isOpen={true}
          onClose={() => setEditingSeries(null)}
          title="Редактировать сериал"
          initialData={editingSeries}
          fields={[
            { name: 'title', label: 'Название сериала', type: 'text', required: true },
            { name: 'description', label: 'Описание', type: 'textarea' },
            { name: 'posterUrl', label: 'Ссылка на постер', type: 'url' },
            { name: 'bgImage', label: 'Фоновое изображение', type: 'url' },
            { name: 'rating', label: 'Рейтинг', type: 'number' },
            { name: 'year', label: 'Год', type: 'number' },
            { name: 'genres', label: 'Жанры', type: 'text' },
            { name: 'actors', label: 'Актеры', type: 'text' },
            { name: 'directors', label: 'Режиссеры', type: 'text' }
          ]}
          onSave={handleSaveSeries}
        />
      )}
    </>
  )
}

async function handleDelete(seriesId: number) {
  if (confirm('Вы уверены, что хотите удалить этот сериал? Все эпизоды также будут удалены.')) {
    try {
      const response = await fetch(`/api/admin/series/${seriesId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        alert('Сериал успешно удален')
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Ошибка при удалении сериала: ${error.message || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении сериала')
    }
  }
}
