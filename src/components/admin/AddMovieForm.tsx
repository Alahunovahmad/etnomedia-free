'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MovieFormData } from '@/types/admin'
import { ArrowLeft, Save, Film, Star, Calendar, Link, FileText } from 'lucide-react'

interface AddMovieFormProps {
  onSubmit: (data: MovieFormData) => Promise<{
    success: boolean
    error?: string
    movie?: any
  }>
}

export default function AddMovieForm({ onSubmit }: AddMovieFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    description: '',
    posterUrl: '',
    m3u8Url: '',
    rating: undefined,
    year: undefined,
    genres: '',
    actors: '',
    directors: '',
    trailerUrl: ''
  })

  const handleInputChange = (field: keyof MovieFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await onSubmit(formData)
      
      if (result.success) {
        // Показываем уведомление и перенаправляем
        alert('Фильм успешно добавлен!')
        router.push('/admin/movies')
      } else {
        setErrors({ general: result.error || 'Ошибка при добавлении фильма' })
      }
    } catch (error) {
      setErrors({ general: 'Произошла ошибка. Попробуйте еще раз.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Общая ошибка */}
      {errors.general && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
          {errors.general}
        </div>
      )}

      {/* Основная информация */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Film className="w-5 h-5" />
          Основная информация
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Название фильма *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.title ? 'border-red-500' : 'border-zinc-700'
            }`}
            placeholder="Введите название фильма"
            required
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            placeholder="Краткое описание фильма"
          />
        </div>
      </div>

      {/* Медиа */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Link className="w-5 h-5" />
          Медиа файлы
        </h3>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Ссылка на постер
          </label>
          <input
            type="url"
            value={formData.posterUrl}
            onChange={(e) => handleInputChange('posterUrl', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="https://example.com/poster.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Ссылка на видео (.m3u8) *
          </label>
          <input
            type="url"
            value={formData.m3u8Url}
            onChange={(e) => handleInputChange('m3u8Url', e.target.value)}
            className={`w-full px-4 py-2 bg-zinc-800 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 ${
              errors.m3u8Url ? 'border-red-500' : 'border-zinc-700'
            }`}
            placeholder="https://example.com/video.m3u8"
            required
          />
          {errors.m3u8Url && (
            <p className="text-red-500 text-sm mt-1">{errors.m3u8Url}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Ссылка на трейлер
          </label>
          <input
            type="url"
            value={formData.trailerUrl}
            onChange={(e) => handleInputChange('trailerUrl', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="https://example.com/trailer.mp4"
          />
        </div>
      </div>

      {/* Детали */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Детали
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <Star className="inline w-4 h-4 mr-1" />
              Рейтинг
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.rating || ''}
              onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="7.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Год
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear() + 5}
              value={formData.year || ''}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="2024"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Жанры
          </label>
          <input
            type="text"
            value={formData.genres}
            onChange={(e) => handleInputChange('genres', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Боевик, Триллер, Драма"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Актеры
          </label>
          <input
            type="text"
            value={formData.actors}
            onChange={(e) => handleInputChange('actors', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Иван Иванов, Петр Петров"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Режиссеры
          </label>
          <input
            type="text"
            value={formData.directors}
            onChange={(e) => handleInputChange('directors', e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Сидоров Сидор"
          />
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Отмена
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Сохранение...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Добавить фильм
            </>
          )}
        </button>
      </div>
    </form>
  )
}
