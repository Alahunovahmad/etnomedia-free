'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Eye, Film, TrendingUp, TrendingDown, Minus } from 'lucide-react'

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

interface AnalyticsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: number
  subtitle?: string
}

function AnalyticsCard({ title, value, icon, trend, trendValue, subtitle }: AnalyticsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-red-500/10 rounded-lg">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trendValue && `${Math.abs(trendValue)}%`}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-zinc-400 text-sm">{title}</p>
        {subtitle && <p className="text-zinc-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter'>('week')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics(selectedPeriod)
  }, [selectedPeriod])

  const fetchAnalytics = async (period: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?period=${period}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const periods = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'quarter', label: '3 месяца' }
  ]

  const getPeriodLabel = () => {
    return periods.find(p => p.value === selectedPeriod)?.label || 'Неделя'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 animate-pulse">
              <div className="h-20 bg-zinc-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-zinc-900 rounded-lg p-12 border border-zinc-800 text-center">
        <p className="text-zinc-400">Не удалось загрузить аналитику</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Период selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Аналитика</h2>
          <p className="text-zinc-400">Детальная статистика за {getPeriodLabel().toLowerCase()}</p>
        </div>
        <div className="flex gap-2">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Просмотры"
          value={data.totalViews.toLocaleString()}
          icon={<Eye className="w-6 h-6 text-red-500" />}
          trend={data.viewGrowth > 0 ? 'up' : data.viewGrowth < 0 ? 'down' : 'neutral'}
          trendValue={data.viewGrowth}
          subtitle="За выбранный период"
        />
        
        <AnalyticsCard
          title="Уникальные пользователи"
          value={data.uniqueUsers.toLocaleString()}
          icon={<Users className="w-6 h-6 text-red-500" />}
          subtitle="Активные пользователи"
        />
        
        <AnalyticsCard
          title="Новые пользователи"
          value={data.newUsers.toLocaleString()}
          icon={<TrendingUp className="w-6 h-6 text-red-500" />}
          trend={data.userGrowth > 0 ? 'up' : data.userGrowth < 0 ? 'down' : 'neutral'}
          trendValue={data.userGrowth}
          subtitle="Зарегистрировались"
        />
        
        <AnalyticsCard
          title="Фильмов в базе"
          value={data.totalMovies.toLocaleString()}
          icon={<Film className="w-6 h-6 text-red-500" />}
          subtitle="Всего контента"
        />
      </div>

      {/* Топ фильмы */}
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h3 className="text-lg font-semibold text-white mb-4">Популярные фильмы</h3>
        <div className="space-y-3">
          {data.topMovies.map((movie, index) => (
            <div key={movie.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
                  <span className="text-red-500 font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="text-white font-medium">{movie.title}</p>
                  <p className="text-zinc-400 text-sm">ID: {movie.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{movie.views.toLocaleString()}</p>
                <p className="text-zinc-400 text-sm">просмотров</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4">Вовлеченность</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Среднее просмотров на пользователя</span>
              <span className="text-white font-semibold">
                {data.uniqueUsers > 0 ? (data.totalViews / data.uniqueUsers).toFixed(1) : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Конверсия в регистрацию</span>
              <span className="text-white font-semibold">
                {data.uniqueUsers > 0 ? ((data.newUsers / data.uniqueUsers) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-4">Рост</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Рост пользователей</span>
              <span className={`font-semibold ${
                data.userGrowth > 0 ? 'text-green-500' : data.userGrowth < 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {data.userGrowth > 0 ? '+' : ''}{data.userGrowth}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Рост просмотров</span>
              <span className={`font-semibold ${
                data.viewGrowth > 0 ? 'text-green-500' : data.viewGrowth < 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {data.viewGrowth > 0 ? '+' : ''}{data.viewGrowth}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
