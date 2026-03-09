import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata: Metadata = {
  title: 'ETNOMEDIA - Админ панель',
  description: 'Панель управления контентом и пользователями',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Проверка авторизации и роли
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Проверяем роль пользователя
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true }
  })

  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/?error=access_denied')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
