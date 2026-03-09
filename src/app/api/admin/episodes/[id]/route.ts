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
    const episodeId = parseInt(id)

    if (isNaN(episodeId)) {
      return NextResponse.json({ error: 'Invalid episode ID' }, { status: 400 })
    }

    // Проверяем существование эпизода
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId }
    })

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    }

    // Удаляем эпизод
    await prisma.episode.delete({
      where: { id: episodeId }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Эпизод успешно удален'
    })

  } catch (error) {
    console.error('Delete episode error:', error)
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
    const episodeId = parseInt(id)
    const data = await request.json()

    if (isNaN(episodeId)) {
      return NextResponse.json({ error: 'Invalid episode ID' }, { status: 400 })
    }

    // Проверяем существование эпизода
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId }
    })

    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    }

    // Валидация данных
    if (data.season && data.season < 1) {
      return NextResponse.json({ error: 'Сезон должен быть больше 0' }, { status: 400 })
    }

    if (data.episodeNumber && data.episodeNumber < 1) {
      return NextResponse.json({ error: 'Номер эпизода должен быть больше 0' }, { status: 400 })
    }

    if (data.duration && data.duration < 0) {
      return NextResponse.json({ error: 'Длительность не может быть отрицательной' }, { status: 400 })
    }

    // Обновляем эпизод
    const updatedEpisode = await prisma.episode.update({
      where: { id: episodeId },
      data: {
        title: data.title?.trim() || episode.title,
        season: data.season !== undefined ? data.season : episode.season,
        episodeNumber: data.episodeNumber !== undefined ? data.episodeNumber : episode.episodeNumber,
        m3u8Url: data.m3u8Url?.trim() || episode.m3u8Url,
        posterUrl: data.posterUrl?.trim() || episode.posterUrl,
        duration: data.duration !== undefined ? data.duration : episode.duration
      }
    })

    return NextResponse.json({ 
      success: true,
      episode: updatedEpisode
    })

  } catch (error) {
    console.error('Update episode error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
