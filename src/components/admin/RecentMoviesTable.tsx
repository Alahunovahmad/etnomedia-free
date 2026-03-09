'use client'

import Link from 'next/link'
import { Movie } from '@/types/admin'
import { Edit, Trash2, Calendar } from 'lucide-react'

interface RecentMoviesTableProps {
  movies: Movie[]
}

export default function RecentMoviesTable({ movies }: RecentMoviesTableProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        <p>Фильмы пока не добавлены</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-zinc-400 border-b border-zinc-800">
            <th className="pb-3 font-medium">Название</th>
            <th className="pb-3 font-medium">Год</th>
            <th className="pb-3 font-medium">Рейтинг</th>
            <th className="pb-3 font-medium">Добавлен</th>
            <th className="pb-3 font-medium text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie: Movie) => (
            <tr key={movie.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
              <td className="py-3">
                <div>
                  <p className="text-white font-medium">{movie.title}</p>
                  {movie.genres && (
                    <p className="text-zinc-400 text-sm">{movie.genres}</p>
                  )}
                </div>
              </td>
              <td className="py-3 text-zinc-300">
                {movie.year || '—'}
              </td>
              <td className="py-3">
                {movie.rating ? (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-white">{movie.rating}</span>
                  </div>
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </td>
              <td className="py-3 text-zinc-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(movie.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </td>
              <td className="py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/movies/${movie.id}/edit`}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
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
  )
}

async function handleDelete(movieId: number) {
  if (confirm('Вы уверены, что хотите удалить этот фильм?')) {
    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Обновить данные или показать уведомление
        window.location.reload()
      } else {
        alert('Ошибка при удалении фильма')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении фильма')
    }
  }
}
