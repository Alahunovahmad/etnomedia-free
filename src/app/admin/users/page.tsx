import { prisma } from '@/lib/prisma'
import { Users, Shield, Calendar, Mail, Crown } from 'lucide-react'
import UsersTable from '@/components/admin/UsersTable'

export default async function AdminUsers() {
  // Получаем всех пользователей с статистикой
  const usersData = await prisma.user.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          favorites: true,
          watchHistory: true
        }
      }
    }
  })

  // Форматируем данные для соответствия интерфейсу User
  const users = usersData.map(user => ({
    id: user.id,
    role: user.role,
    createdAt: user.createdAt,
    telegramId: user.telegramId,
    phoneNumber: user.phoneNumber,
    _count: user._count
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Пользователи</h1>
          <p className="text-zinc-400">Управление пользователями и правами доступа</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Все пользователи</h2>
          <span className="text-zinc-400">({users.length})</span>
        </div>
        
        <UsersTable users={users} />
      </div>
    </div>
  )
}
