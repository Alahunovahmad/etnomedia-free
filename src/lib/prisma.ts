// @ts-ignore
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

/**
 * Singleton паттерн для Prisma Client (стандарт Next.js).
 * В Prisma 7 использование адаптера (PrismaPg) обязательно для Node.js среды.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Создаем пул соединений PostgreSQL. 
// DATABASE_URL должен быть в вашем файле .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Логирование для отладки в режиме разработки
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma