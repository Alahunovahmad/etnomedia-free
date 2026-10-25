// Карта файла: ссылки «Назад / Далее» для списков админ-панели.
import Link from 'next/link'

interface AdminPaginationProps {
  basePath: string
  page: number
  totalPages: number
}

// Рендерит навигацию по страницам списка в админке.
export default function AdminPagination({
  basePath,
  page,
  totalPages
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const prevHref = `${basePath}?page=${page - 1}`
  const nextHref = `${basePath}?page=${page + 1}`

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
      {page > 1 ? (
        <Link
          href={prevHref}
          className="text-sm text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
        >
          Назад
        </Link>
      ) : (
        <span className="text-sm text-zinc-600 px-4 py-2">Назад</span>
      )}

      <span className="text-sm text-zinc-400">
        Страница {page} из {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={nextHref}
          className="text-sm text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
        >
          Далее
        </Link>
      ) : (
        <span className="text-sm text-zinc-600 px-4 py-2">Далее</span>
      )}
    </div>
  )
}
