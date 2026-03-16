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
  m3u8Url?: string
  seasons?: SeasonData[]
}

interface SeasonData {
  number: number
  episodes: EpisodeData[]
}

interface EpisodeData {
  number: number
  title: string
  description?: string
  m3u8Url: string
  duration?: number
}

export default function AddContentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie')
  const [enrichedData, setEnrichedData] = useState<ContentData | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentStep, setCurrentStep] = useState<'search' | 'edit' | 'episodes'>('search')

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
        const enriched = {
          ...data.data,
          type: contentType,
          seasons: contentType === 'series' ? [{ number: 1, episodes: [] }] : []
        }
        setEnrichedData(enriched)
        setSuccess('Данные успешно получены из Etnomedia')
        setCurrentStep('edit')
      } else {
        setError('Не удалось найти данные в Etnomedia')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const addSeason = () => {
    if (!enrichedData) return
    
    const newSeasonNumber = enrichedData.seasons ? enrichedData.seasons.length + 1 : 1
    setEnrichedData({
      ...enrichedData,
      seasons: [...(enrichedData.seasons || []), { number: newSeasonNumber, episodes: [] }]
    })
  }

  const removeSeason = (seasonNumber: number) => {
    if (!enrichedData || !enrichedData.seasons) return
    
    setEnrichedData({
      ...enrichedData,
      seasons: enrichedData.seasons.filter(s => s.number !== seasonNumber)
    })
  }

  const addEpisode = (seasonNumber: number) => {
    if (!enrichedData || !enrichedData.seasons) return
    
    const season = enrichedData.seasons.find(s => s.number === seasonNumber)
    if (!season) return
    
    const newEpisodeNumber = season.episodes.length + 1
    const updatedSeasons = enrichedData.seasons.map(s => 
      s.number === seasonNumber 
        ? { ...s, episodes: [...s.episodes, { 
            number: newEpisodeNumber, 
            title: `Серия ${newEpisodeNumber}`, 
            m3u8Url: '',
            duration: undefined 
          }] }
        : s
    )
    
    setEnrichedData({ ...enrichedData, seasons: updatedSeasons })
  }

  const removeEpisode = (seasonNumber: number, episodeNumber: number) => {
    if (!enrichedData || !enrichedData.seasons) return
    
    const updatedSeasons = enrichedData.seasons.map(s => 
      s.number === seasonNumber 
        ? { ...s, episodes: s.episodes.filter(e => e.number !== episodeNumber) }
        : s
    )
    
    setEnrichedData({ ...enrichedData, seasons: updatedSeasons })
  }

  const updateEpisode = (seasonNumber: number, episodeNumber: number, field: keyof EpisodeData, value: string | number) => {
    if (!enrichedData || !enrichedData.seasons) return
    
    const updatedSeasons = enrichedData.seasons.map(s => 
      s.number === seasonNumber 
        ? { 
            ...s, 
            episodes: s.episodes.map(e => 
              e.number === episodeNumber 
                ? { ...e, [field]: field === 'number' || field === 'duration' ? parseInt(value.toString()) : value }
                : e
            )
          }
        : s
    )
    
    setEnrichedData({ ...enrichedData, seasons: updatedSeasons })
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
        body: JSON.stringify(enrichedData)
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
        setCurrentStep('search')
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

        {/* Шаги */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            currentStep === 'search' ? 'bg-red-600' : 'bg-gray-700'
          }`}>
            <span className="font-medium">1. Поиск</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            currentStep === 'edit' ? 'bg-red-600' : 'bg-gray-700'
          }`}>
            <span className="font-medium">2. Редактирование</span>
          </div>
          {contentType === 'series' && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              currentStep === 'episodes' ? 'bg-red-600' : 'bg-gray-700'
            }`}>
              <span className="font-medium">3. Серии</span>
            </div>
          )}
        </div>

        {/* Шаг 1: Поиск */}
        {currentStep === 'search' && (
          <div className="bg-gray-900 rounded-lg p-6">
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
        )}

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

        {/* Шаг 2: Редактирование */}
        {currentStep === 'edit' && enrichedData && (
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Редактирование данных</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep('search')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Назад к поиску
                </button>
                {contentType === 'series' && (
                  <button
                    onClick={() => setCurrentStep('episodes')}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                  >
                    Далее к сериям
                  </button>
                )}
                {contentType === 'movie' && (
                  <button
                    onClick={saveToDatabase}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Сохранение...' : 'Сохранить фильм'}
                  </button>
                )}
              </div>
            </div>
            
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
                  <input
                    type="text"
                    value={enrichedData.title}
                    onChange={(e) => setEnrichedData({...enrichedData, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-2xl font-bold"
                  />
                  {enrichedData.year && (
                    <input
                      type="number"
                      value={enrichedData.year}
                      onChange={(e) => setEnrichedData({...enrichedData, year: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                      placeholder="Год"
                    />
                  )}
                  {enrichedData.rating && (
                    <input
                      type="number"
                      step="0.1"
                      value={enrichedData.rating}
                      onChange={(e) => setEnrichedData({...enrichedData, rating: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                      placeholder="Рейтинг"
                    />
                  )}
                  {enrichedData.duration && contentType === 'movie' && (
                    <input
                      type="number"
                      value={enrichedData.duration}
                      onChange={(e) => setEnrichedData({...enrichedData, duration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                      placeholder="Длительность (мин)"
                    />
                  )}
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

                <div>
                  <label className="block text-sm font-medium mb-1">Актеры</label>
                  <input
                    type="text"
                    value={enrichedData.actors}
                    onChange={(e) => setEnrichedData({...enrichedData, actors: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Режиссеры</label>
                  <input
                    type="text"
                    value={enrichedData.directors}
                    onChange={(e) => setEnrichedData({...enrichedData, directors: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Жанры</label>
                  <input
                    type="text"
                    value={enrichedData.genres}
                    onChange={(e) => setEnrichedData({...enrichedData, genres: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                {contentType === 'movie' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">M3U8 URL *</label>
                    <input
                      type="text"
                      value={enrichedData.m3u8Url || ''}
                      onChange={(e) => setEnrichedData({...enrichedData, m3u8Url: e.target.value})}
                      placeholder="Обязательное поле для фильма"
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
          </div>
        )}

        {/* Шаг 3: Серии (только для сериалов) */}
        {currentStep === 'episodes' && enrichedData && contentType === 'series' && (
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Управление сезонами и сериями</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentStep('edit')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Назад к редактированию
                </button>
                <button
                  onClick={saveToDatabase}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Сохранение...' : 'Сохранить сериал'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {enrichedData.seasons?.map((season) => (
                <div key={season.number} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Сезон {season.number}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addEpisode(season.number)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                      >
                        + Добавить серию
                      </button>
                      <button
                        onClick={() => removeSeason(season.number)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                      >
                        Удалить сезон
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {season.episodes.map((episode) => (
                      <div key={episode.number} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Серия {episode.number}</h4>
                          <button
                            onClick={() => removeEpisode(season.number, episode.number)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Название</label>
                            <input
                              type="text"
                              value={episode.title}
                              onChange={(e) => updateEpisode(season.number, episode.number, 'title', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">M3U8 URL *</label>
                            <input
                              type="text"
                              value={episode.m3u8Url}
                              onChange={(e) => updateEpisode(season.number, episode.number, 'm3u8Url', e.target.value)}
                              placeholder="Обязательное поле"
                              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Длительность (мин)</label>
                            <input
                              type="number"
                              value={episode.duration || ''}
                              onChange={(e) => updateEpisode(season.number, episode.number, 'duration', e.target.value)}
                              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-xs font-medium mb-1">Описание</label>
                          <textarea
                            value={episode.description || ''}
                            onChange={(e) => updateEpisode(season.number, episode.number, 'description', e.target.value)}
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm focus:outline-none focus:border-red-500 h-16 resize-none"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {season.episodes.length === 0 && (
                      <div className="text-center py-4 text-gray-400">
                        Нет серий. Нажмите "Добавить серию" чтобы начать.
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <button
                onClick={addSeason}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                + Добавить сезон
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
