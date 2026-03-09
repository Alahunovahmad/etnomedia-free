'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Film, 
  Tv, 
  Users, 
  Settings,
  LogOut,
  Shield
} from 'lucide-react'
import { AdminSidebarItem } from '@/types/admin'

const sidebarItems: AdminSidebarItem[] = [
  {
    label: 'Дашборд',
    href: '/admin',
    icon: 'LayoutDashboard'
  },
  {
    label: 'Фильмы',
    href: '/admin/movies',
    icon: 'Film'
  },
  {
    label: 'Сериалы',
    href: '/admin/series',
    icon: 'Tv'
  },
  {
    label: 'Пользователи',
    href: '/admin/users',
    icon: 'Users'
  },
  {
    label: 'Настройки',
    href: '/admin/settings',
    icon: 'Settings'
  }
]

const iconMap = {
  LayoutDashboard,
  Film,
  Tv,
  Users,
  Settings
}

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-zinc-900 min-h-screen border-r border-zinc-800">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ETNOMEDIA</h1>
            <p className="text-xs text-zinc-400">Админ панель</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = iconMap[item.icon as keyof typeof iconMap]

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-red-600/20 text-red-500 border-l-2 border-red-500'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Выйти к сайту</span>
        </Link>
      </div>
    </aside>
  )
}
