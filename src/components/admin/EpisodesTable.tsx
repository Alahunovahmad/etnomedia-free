'use client'

import { useState } from 'react'
import { Edit, Trash2, Play, Calendar, Clock } from 'lucide-react'
import EditModal from './EditModal'

interface Episode {
  id: number
  season: number
  episodeNumber: number
  title: string | null
  m3u8Url: string
  posterUrl: string | null
  duration: number | null
  createdAt: Date
}

interface EpisodesTableProps {
  episodes: Episode[]
  seriesId: number
}

export default function EpisodesTable({ episodes, seriesId }: EpisodesTableProps) {
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)

  const handleEditEpisode = (episode: Episode) => {
    setEditingEpisode(episode)
  }

  const handleSaveEpisode = async (data: Partial<Episode>) => {
    try {
      const response = await fetch(`/api/admin/episodes/${editingEpisode?.id}`, {
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

  if (episodes.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <Play className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-lg mb-2">Эпизоды пока не добавлены</p>
        <p className="text-sm">Нажмите "Добавить эпизод" чтобы начать</p>
      </div>
    )
  }

  // Группируем эпизоды по сезонам
  const episodesBySeason = episodes.reduce((acc, episode) => {
    if (!acc[episode.season]) {
      acc[episode.season] = []
    }
    acc[episode.season].push(episode)
    return acc
  }, {} as Record<number, Episode[]>)

  return (
    <>
      <div className="space-y-6">
        {Object.entries(episodesBySeason).map(([season, seasonEpisodes]: [string, Episode[]]) => (
          <div key={season}>
            <h3 className="text-lg font-semibold text-white mb-3">
              Сезон {season} ({seasonEpisodes.length} эпизодов)
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-zinc-400 border-b border-zinc-800">
                    <th className="pb-3 font-medium">Эпизод</th>
                    <th className="pb-3 font-medium">Название</th>
                    <th className="pb-3 font-medium">Длительность</th>
                    <th className="pb-3 font-medium">Добавлен</th>
                    <th className="pb-3 font-medium text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonEpisodes.map((episode: Episode) => (
                    <tr key={episode.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {episode.posterUrl && (
                            <img
                              src={episode.posterUrl}
                              alt={episode.title || `Эпизод ${episode.episodeNumber}`}
                              className="w-16 h-10 object-cover rounded"
                            />
                          )}
                          <span className="text-white font-medium">
                            {episode.episodeNumber}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="text-white font-medium">
                            {episode.title || `Эпизод ${episode.episodeNumber}`}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 text-zinc-300">
                        {episode.duration ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {Math.floor(episode.duration / 60)} мин
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="py-4 text-zinc-400">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(episode.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          {episode.m3u8Url && (
                            <a
                              href={`/series/${seriesId}?season=${episode.season}&episode=${episode.episodeNumber}`}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                              title="Смотреть эпизод"
                              target="_blank"
                            >
                              <Play className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                            title="Редактировать"
                            onClick={() => handleEditEpisode(episode)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Удалить"
                            onClick={() => handleDelete(episode.id)}
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
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingEpisode && (
        <EditModal
          isOpen={true}
          onClose={() => setEditingEpisode(null)}
          title={`Редактировать эпизод ${editingEpisode.season}x${editingEpisode.episodeNumber}`}
          initialData={editingEpisode}
          fields={[
            { name: 'title', label: 'Название эпизода', type: 'text' },
            { name: 'season', label: 'Сезон', type: 'number', required: true },
            { name: 'episodeNumber', label: 'Номер эпизода', type: 'number', required: true },
            { name: 'm3u8Url', label: 'Ссылка на видео (.m3u8)', type: 'url', required: true },
            { name: 'posterUrl', label: 'Ссылка на постер', type: 'url' },
            { name: 'duration', label: 'Длительность (секунды)', type: 'number' }
          ]}
          onSave={handleSaveEpisode}
        />
      )}
    </>
  )
}

async function handleDelete(episodeId: number) {
  if (confirm('Вы уверены, что хотите удалить этот эпизод?')) {
    try {
      const response = await fetch(`/api/admin/episodes/${episodeId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        alert('Эпизод успешно удален')
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Ошибка при удалении эпизода: ${error.message || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении эпизода')
    }
  }
}
