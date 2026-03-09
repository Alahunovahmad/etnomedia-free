import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface AnalyticsData {
  period: string
  totalViews: number
  uniqueUsers: number
  newUsers: number
  totalMovies: number
  topMovies: Array<{
    id: number
    title: string
    views: number
  }>
  userGrowth: number
  viewGrowth: number
}

function getDateRange(period: string) {
  const now = new Date()
  const start = new Date()
  
  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      start.setDate(now.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      start.setMonth(now.getMonth() - 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'quarter':
      start.setMonth(now.getMonth() - 3)
      start.setHours(0, 0, 0, 0)
      break
    default:
      start.setDate(now.getDate() - 7)
      start.setHours(0, 0, 0, 0)
  }
  
  return { start, end: now }
}

function getPreviousDateRange(period: string) {
  const now = new Date()
  const end = new Date()
  const start = new Date()
  
  switch (period) {
    case 'day':
      end.setDate(now.getDate() - 1)
      end.setHours(23, 59, 59, 999)
      start.setDate(now.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'week':
      end.setDate(now.getDate() - 7)
      end.setHours(23, 59, 59, 999)
      start.setDate(now.getDate() - 14)
      start.setHours(0, 0, 0, 0)
      break
    case 'month':
      end.setMonth(now.getMonth() - 1)
      end.setHours(23, 59, 59, 999)
      start.setMonth(now.getMonth() - 2)
      start.setHours(0, 0, 0, 0)
      break
    case 'quarter':
      end.setMonth(now.getMonth() - 3)
      end.setHours(23, 59, 59, 999)
      start.setMonth(now.getMonth() - 6)
      start.setHours(0, 0, 0, 0)
      break
  }
  
  return { start, end }
}

async function getAnalyticsForPeriod(period: string): Promise<AnalyticsData> {
  const { start, end } = getDateRange(period)
  const { start: prevStart, end: prevEnd } = getPreviousDateRange(period)
  
  try {
    // Текущий период
    const [
      totalViews,
      uniqueUsers,
      newUsers,
      totalMovies,
      topMovies,
      prevViews,
      prevNewUsers
    ] = await Promise.all([
      // Просмотры за период
      prisma.watchHistory.count({
        where: {
          updatedAt: {
            gte: start,
            lte: end
          }
        }
      }),
      
      // Уникальные пользователи за период
      prisma.watchHistory.findMany({
        where: {
          updatedAt: {
            gte: start,
            lte: end
          }
        },
        select: { userId: true },
        distinct: ['userId']
      }).then(users => users.length),
      
      // Новые пользователи за период
      prisma.user.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      
      // Всего фильмов
      prisma.movie.count(),
      
      // Топ фильмы за период
      prisma.watchHistory.groupBy({
        by: ['movieId'],
        where: {
          movieId: { not: null },
          updatedAt: {
            gte: start,
            lte: end
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }).then(async (results) => {
        const movieIds = results.map(r => r.movieId).filter((id): id is number => id !== null)
        const movies = await prisma.movie.findMany({
          where: { id: { in: movieIds } },
          select: { id: true, title: true }
        })
        
        return results.map(result => {
          const movie = movies.find(m => m.id === result.movieId)
          return {
            id: result.movieId!, // movieId не null из-за фильтра
            title: movie?.title || 'Неизвестный фильм',
            views: result._count.id
          }
        })
      }),
      
      // Просмотры за предыдущий период
      prisma.watchHistory.count({
        where: {
          updatedAt: {
            gte: prevStart,
            lte: prevEnd
          }
        }
      }),
      
      // Новые пользователи за предыдущий период
      prisma.user.count({
        where: {
          createdAt: {
            gte: prevStart,
            lte: prevEnd
          }
        }
      })
    ])
    
    // Расчет роста
    const viewGrowth = prevViews > 0 ? ((totalViews - prevViews) / prevViews) * 100 : 0
    const userGrowth = prevNewUsers > 0 ? ((newUsers - prevNewUsers) / prevNewUsers) * 100 : 0
    
    return {
      period,
      totalViews,
      uniqueUsers,
      newUsers,
      totalMovies,
      topMovies,
      userGrowth: Math.round(userGrowth * 10) / 10,
      viewGrowth: Math.round(viewGrowth * 10) / 10
    }
  } catch (error) {
    console.error('Analytics error:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'
    
    if (!['day', 'week', 'month', 'quarter'].includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
    }

    const data = await getAnalyticsForPeriod(period)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
