import { redirect } from 'next/navigation'
import { MovieFormData } from '@/types/admin'
import AddMovieForm from '@/components/admin/AddMovieForm'

export default function AddMoviePage() {
  async function createMovie(data: MovieFormData) {
    'use server'
    
    try {
      const { prisma } = await import('@/lib/prisma')
      
      // Валидация обязательных полей
      if (!data.title.trim() || !data.m3u8Url.trim()) {
        return {
          success: false,
          error: 'Название и ссылка на видео обязательны'
        }
      }

      // Валидация рейтинга
      if (data.rating && (data.rating < 0 || data.rating > 10)) {
        return {
          success: false,
          error: 'Рейтинг должен быть от 0 до 10'
        }
      }

      // Валидация года
      if (data.year && (data.year < 1900 || data.year > new Date().getFullYear() + 5)) {
        return {
          success: false,
          error: 'Год должен быть в диапазоне от 1900 до текущего года + 5'
        }
      }

      // Создание фильма
      const movie = await prisma.movie.create({
        data: {
          title: data.title.trim(),
          description: data.description?.trim() || null,
          posterUrl: data.posterUrl?.trim() || null,
          m3u8Url: data.m3u8Url.trim(),
          rating: data.rating || null,
          year: data.year || null,
          genres: data.genres?.trim() || null,
          actors: data.actors?.trim() || null,
          directors: data.directors?.trim() || null,
          trailerUrl: data.trailerUrl?.trim() || null
        }
      })

      return {
        success: true,
        movie
      }

    } catch (error) {
      console.error('Create movie error:', error)
      return {
        success: false,
        error: 'Ошибка при создании фильма'
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Добавить фильм</h1>
        <p className="text-zinc-400">Заполните информацию о новом фильме</p>
      </div>

      <div className="bg-zinc-900 rounded-lg p-6">
        <AddMovieForm onSubmit={createMovie} />
      </div>
    </div>
  )
}
