'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ContentData {
  title: string
  description: string
  poster_url: string | null
  bg_image: string | null
  year: number | null
  rating: number | null
  duration: number | null
  trailer_url: string | null
  actors: string
  directors: string
  genres: string
  type: 'movie' | 'series'
}

export default function AddContentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie')
  const [enrichedData, setEnrichedData] = useState<ContentData | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const searchEtnomedia = async () => {
    if (!searchQuery.trim()) {
      setError('Введите название для поиска')
      return
    }

    setLoading(true)
    setError('')
    setEnrichedData(null)

    try {
      const response = await fetch('/api/admin/etnomedia-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: searchQuery,
          type: contentType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка поиска')
      }

      if (data.success && data.data) {
        setEnrichedData(data.data)
        setSuccess('Данные успешно получены из Etnomedia')
      } else {
        setError('Не удалось найти данные в Etnomedia')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const saveToDatabase = async () => {
    if (!enrichedData) {
      setError('Нет данных для сохранения')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/add-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...enrichedData,
          type: contentType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения')
      }

      setSuccess(`${contentType === 'movie' ? 'Фильм' : 'Сериал'} успешно добавлен в базу!`)
      
      // Очищаем форму через 2 секунды
      setTimeout(() => {
        setSearchQuery('')
        setEnrichedData(null)
        setSuccess('')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Добавление контента</h1>
          <p className="text-gray-400">Поиск и добавление фильмов/сериалов с обогащением данных из Etnomedia</p>
        </div>

        {/* Форма поиска */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Тип контента</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as 'movie' | 'series')}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
              >
                <option value="movie">Фильм</option>
                <option value="series">Сериал</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Название для поиска</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Введите название фильма или сериала..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                onKeyPress={(e) => e.key === 'Enter' && searchEtnomedia()}
              />
            </div>
          </div>

          <button
            onClick={searchEtnomedia}
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Поиск...' : 'Найти в Etnomedia'}
          </button>
        </div>

        {/* Сообщения */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Результаты поиска */}
        {enrichedData && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Найденные данные</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Постер и основная информация */}
              <div>
                {enrichedData.poster_url && (
                  <img
                    src={enrichedData.poster_url}
                    alt={enrichedData.title}
                    className="w-full max-w-sm rounded-lg mb-4"
                  />
                )}
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">{enrichedData.title}</h3>
                  {enrichedData.year && <p className="text-gray-400">Год: {enrichedData.year}</p>}
                  {enrichedData.rating && <p className="text-gray-400">Рейтинг: {enrichedData.rating}</p>}
                  {enrichedData.duration && <p className="text-gray-400">Длительность: {enrichedData.duration} мин</p>}
                  {enrichedData.genres && <p className="text-gray-400">Жанры: {enrichedData.genres}</p>}
                </div>
              </div>

              {/* Детальная информация */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Описание</label>
                  <textarea
                    value={enrichedData.description}
                    onChange={(e) => setEnrichedData({...enrichedData, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 h-24 resize-none"
                  />
                </div>

                {enrichedData.actors && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Актеры</label>
                    <input
                      type="text"
                      value={enrichedData.actors}
                      onChange={(e) => setEnrichedData({...enrichedData, actors: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}

                {enrichedData.directors && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Режиссеры</label>
                    <input
                      type="text"
                      value={enrichedData.directors}
                      onChange={(e) => setEnrichedData({...enrichedData, directors: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">URL постера</label>
                    <input
                      type="text"
                      value={enrichedData.poster_url || ''}
                      onChange={(e) => setEnrichedData({...enrichedData, poster_url: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL фона</label>
                    <input
                      type="text"
                      value={enrichedData.bg_image || ''}
                      onChange={(e) => setEnrichedData({...enrichedData, bg_image: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {enrichedData.trailer_url && (
                  <div>
                    <label className="block text-sm font-medium mb-1">URL трейлера</label>
                    <input
                      type="text"
                      value={enrichedData.trailer_url}
                      onChange={(e) => setEnrichedData({...enrichedData, trailer_url: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={saveToDatabase}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Сохранение...' : `Добавить ${contentType === 'movie' ? 'фильм' : 'сериал'} в базу`}
              </button>
              
              <button
                onClick={() => setEnrichedData(null)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
