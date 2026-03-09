'use client'

import { Shield, Crown, Calendar, Mail, Eye, Heart } from 'lucide-react'

interface User {
  id: number
  role: string
  createdAt: Date
  telegramId?: string | null
  phoneNumber?: string | null
  _count: {
    favorites: number
    watchHistory: number
  }
}

interface UsersTableProps {
  users: User[]
}

export default function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <Shield className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
        <p className="text-lg mb-2">Пользователи пока не зарегистрированы</p>
        <p className="text-sm">Здесь будет отображаться список пользователей</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-zinc-400 border-b border-zinc-800">
            <th className="pb-3 font-medium">Пользователь</th>
            <th className="pb-3 font-medium">Роль</th>
            <th className="pb-3 font-medium">Контакты</th>
            <th className="pb-3 font-medium">Активность</th>
            <th className="pb-3 font-medium">Зарегистрирован</th>
            <th className="pb-3 font-medium text-right">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.telegramId ? user.telegramId.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {user.telegramId ? `Telegram: ${user.telegramId}` : `Пользователь #${user.id}`}
                    </p>
                    <p className="text-zinc-400 text-sm">ID: {user.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  {user.role === 'ADMIN' ? (
                    <>
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-500 font-medium">Админ</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-300">Пользователь</span>
                    </>
                  )}
                </div>
              </td>
              <td className="py-4">
                <div className="space-y-1">
                  {user.phoneNumber && (
                    <div className="flex items-center gap-1 text-sm text-zinc-300">
                      <Mail className="w-3 h-3" />
                      {user.phoneNumber}
                    </div>
                  )}
                  {user.telegramId && (
                    <div className="flex items-center gap-1 text-sm text-zinc-300">
                      <Shield className="w-3 h-3" />
                      Telegram: {user.telegramId}
                    </div>
                  )}
                  {!user.phoneNumber && !user.telegramId && (
                    <span className="text-zinc-500 text-sm">Нет контактов</span>
                  )}
                </div>
              </td>
              <td className="py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span className="text-zinc-300">{user._count.favorites} избранное</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="w-3 h-3 text-blue-500" />
                    <span className="text-zinc-300">{user._count.watchHistory} просмотров</span>
                  </div>
                </div>
              </td>
              <td className="py-4 text-zinc-400">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Изменить роль"
                    onClick={() => handleChangeRole(user.id, user.role)}
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Заблокировать"
                    onClick={() => handleBlockUser(user.id)}
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

async function handleChangeRole(userId: number, currentRole: string) {
  const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
  
  if (confirm(`Вы уверены, что хотите изменить роль пользователя на ${newRole === 'ADMIN' ? 'администратора' : 'пользователя'}?`)) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })
      
      if (response.ok) {
        alert(`Роль пользователя изменена на ${newRole === 'ADMIN' ? 'администратора' : 'пользователя'}`)
        window.location.reload()
      } else {
        alert('Ошибка при изменении роли')
      }
    } catch (error) {
      console.error('Change role error:', error)
      alert('Ошибка при изменении роли')
    }
  }
}

async function handleBlockUser(userId: number) {
  if (confirm('Вы уверены, что хотите заблокировать этого пользователя?')) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        alert('Пользователь заблокирован')
        window.location.reload()
      } else {
        alert('Ошибка при блокировке пользователя')
      }
    } catch (error) {
      console.error('Block user error:', error)
      alert('Ошибка при блокировке пользователя')
    }
  }
}
