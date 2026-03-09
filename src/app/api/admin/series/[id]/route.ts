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
    const seriesId = parseInt(id)

    if (isNaN(seriesId)) {
      return NextResponse.json({ error: 'Invalid series ID' }, { status: 400 })
    }

    // Проверяем существование сериала
    const series = await prisma.series.findUnique({
      where: { id: seriesId }
    })

    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 })
    }

    // Удаляем сериал (каскадно удалятся эпизоды и связанные записи)
    await prisma.series.delete({
      where: { id: seriesId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Сериал успешно удален'
    })

  } catch (error) {
    console.error('Delete series error:', error)
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
    const seriesId = parseInt(id)
    const data = await request.json()

    if (isNaN(seriesId)) {
      return NextResponse.json({ error: 'Invalid series ID' }, { status: 400 })
    }

    // Проверяем существование сериала
    const series = await prisma.series.findUnique({
      where: { id: seriesId }
    })

    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 })
    }

    // Валидация данных
    if (data.rating && (data.rating < 0 || data.rating > 10)) {
      return NextResponse.json({ error: 'Рейтинг должен быть от 0 до 10' }, { status: 400 })
    }

    if (data.year && (data.year < 1900 || data.year > new Date().getFullYear() + 5)) {
      return NextResponse.json({ error: 'Год должен быть в диапазоне от 1900 до текущего года + 5' }, { status: 400 })
    }

    // Обновляем сериал
    const updatedSeries = await prisma.series.update({
      where: { id: seriesId },
      data: {
        title: data.title?.trim() || series.title,
        description: data.description?.trim() || series.description,
        posterUrl: data.posterUrl?.trim() || series.posterUrl,
        bgImage: data.bgImage?.trim() || series.bgImage,
        rating: data.rating !== undefined ? data.rating : series.rating,
        year: data.year !== undefined ? data.year : series.year,
        genres: data.genres?.trim() || series.genres,
        actors: data.actors?.trim() || series.actors,
        directors: data.directors?.trim() || series.directors
      }
    })

    return NextResponse.json({ 
      success: true,
      series: updatedSeries
    })

  } catch (error) {
    console.error('Update series error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
