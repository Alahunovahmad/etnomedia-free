import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем роль пользователя
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const movieId = parseInt(id)

    if (isNaN(movieId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 })
    }

    // Проверяем существование фильма
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    })

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }

    // Удаляем фильм (каскадно удалятся связанные записи)
    await prisma.movie.delete({
      where: { id: movieId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Фильм успешно удален'
    })

  } catch (error) {
    console.error('Delete movie error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем роль пользователя
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const movieId = parseInt(id)
    const data = await request.json()

    if (isNaN(movieId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 })
    }

    // Проверяем существование фильма
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    })

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }

    // Валидация данных
    if (data.rating && (data.rating < 0 || data.rating > 10)) {
      return NextResponse.json({ error: 'Рейтинг должен быть от 0 до 10' }, { status: 400 })
    }

    if (data.year && (data.year < 1900 || data.year > new Date().getFullYear() + 5)) {
      return NextResponse.json({ error: 'Год должен быть в диапазоне от 1900 до текущего года + 5' }, { status: 400 })
    }

    // Обновляем фильм
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: {
        title: data.title?.trim() || movie.title,
        description: data.description?.trim() || movie.description,
        posterUrl: data.posterUrl?.trim() || movie.posterUrl,
        m3u8Url: data.m3u8Url?.trim() || movie.m3u8Url,
        rating: data.rating !== undefined ? data.rating : movie.rating,
        year: data.year !== undefined ? data.year : movie.year,
        genres: data.genres?.trim() || movie.genres,
        actors: data.actors?.trim() || movie.actors,
        directors: data.directors?.trim() || movie.directors,
        trailerUrl: data.trailerUrl?.trim() || movie.trailerUrl
      }
    })

    return NextResponse.json({ 
      success: true,
      movie: updatedMovie
    })

  } catch (error) {
    console.error('Update movie error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
