// Карта файла: список пользователей в админке с пагинацией по 50 записей.
import { prisma } from '@/lib/prisma'
import { Users } from 'lucide-react'
import UsersTable from '@/components/admin/UsersTable'
import AdminPagination from '@/components/admin/AdminPagination'
import { UserData, User } from '@/types'

const PAGE_SIZE = 50

interface AdminUsersProps {
  searchParams: Promise<{ page?: string }>
}

// Нормализует номер страницы из query-параметра.
function parsePage(raw?: string): number {
  const page = parseInt(raw || '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

// Страница управления пользователями: полный count + порция текущей страницы.
export default async function AdminUsers({ searchParams }: AdminUsersProps) {
  const { page: pageParam } = await searchParams
  const page = parsePage(pageParam)
  const skip = (page - 1) * PAGE_SIZE

  const [total, usersData] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip,
      take: PAGE_SIZE,
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
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const users: User[] = usersData.map((user: UserData) => ({
    id: user.id,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    telegramId: user.telegramId,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
    _count: user._count
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Пользователи</h1>
          <p className="text-zinc-400">Управление пользователями и правами доступа</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold text-white">Все пользователи</h2>
          <span className="text-zinc-400">({total})</span>
        </div>

        <UsersTable users={users} />
        <AdminPagination basePath="/admin/users" page={page} totalPages={totalPages} />
      </div>
    </div>
  )
}
