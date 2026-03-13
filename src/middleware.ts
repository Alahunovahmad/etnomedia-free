import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Пропускаем все запросы, но добавляем кастомные заголовки
  const response = NextResponse.next()

  // Добавляем заголовок для идентификации запросов к watch-progress
  if (request.nextUrl.pathname.startsWith('/api/watch-progress/batch')) {
    response.headers.set('x-silent-request', 'true')
  }

  return response
}

export const config = {
  matcher: '/api/watch-progress/batch/:path*',
}
