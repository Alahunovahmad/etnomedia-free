'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Movie } from '@/types/admin'
import { Edit, Trash2, Play, Calendar, Star, Film } from 'lucide-react'
import EditModal from './EditModal'

interface MoviesTableProps {
  movies: Movie[]
}

export default function MoviesTable({ movies }: MoviesTableProps) {
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie)
  }

  const handleSaveMovie = async (data: Partial<Movie>) => {
    try {
      const response = await fetch(`/api/admin/movies/${editingMovie?.id}`, {
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

  if (movies.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <Film className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-lg mb-2">Фильмы пока не добавлены</p>
        <p className="text-sm">Нажмите "Добавить фильм" чтобы начать</p>
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
              <th className="pb-3 font-medium">Жанры</th>
              <th className="pb-3 font-medium">Добавлен</th>
              <th className="pb-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="py-4">
                  <div className="flex items-start gap-3">
                    {movie.posterUrl && (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{movie.title}</p>
                      {movie.description && (
                        <p className="text-zinc-400 text-sm line-clamp-2 mt-1">
                          {movie.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 text-zinc-300">
                  {movie.year || '—'}
                </td>
                <td className="py-4">
                  {movie.rating ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-white">{movie.rating}</span>
                    </div>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="py-4 text-zinc-300">
                  <span className="text-sm">
                    {movie.genres ? movie.genres.split(',').slice(0, 2).join(', ') : '—'}
                  </span>
                </td>
                <td className="py-4 text-zinc-400">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(movie.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-end gap-2">
                    {movie.m3u8Url && (
                      <Link
                        href={`/movie/${movie.id}`}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Смотреть фильм"
                        target="_blank"
                      >
                        <Play className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                      title="Редактировать"
                      onClick={() => handleEditMovie(movie)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Удалить"
                      onClick={() => handleDelete(movie.id)}
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
      {editingMovie && (
        <EditModal
          isOpen={true}
          onClose={() => setEditingMovie(null)}
          title="Редактировать фильм"
          initialData={editingMovie}
          fields={[
            { name: 'title', label: 'Название фильма', type: 'text', required: true },
            { name: 'description', label: 'Описание', type: 'textarea' },
            { name: 'posterUrl', label: 'Ссылка на постер', type: 'url' },
            { name: 'm3u8Url', label: 'Ссылка на видео (.m3u8)', type: 'url', required: true },
            { name: 'rating', label: 'Рейтинг', type: 'number' },
            { name: 'year', label: 'Год', type: 'number' },
            { name: 'genres', label: 'Жанры', type: 'text' },
            { name: 'actors', label: 'Актеры', type: 'text' },
            { name: 'directors', label: 'Режиссеры', type: 'text' },
            { name: 'trailerUrl', label: 'Ссылка на трейлер', type: 'url' }
          ]}
          onSave={handleSaveMovie}
        />
      )}
    </>
  )
}

async function handleDelete(movieId: number) {
  if (confirm('Вы уверены, что хотите удалить этот фильм? Это действие нельзя отменить.')) {
    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Показать уведомление и обновить данные
        alert('Фильм успешно удален')
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`Ошибка при удалении фильма: ${error.message || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении фильма')
    }
  }
}
