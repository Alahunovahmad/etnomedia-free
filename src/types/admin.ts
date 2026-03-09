export interface AdminStats {
  totalMovies: number
  totalUsers: number
  todayViews: number
  recentMovies: Movie[]
}

export interface AdminUser {
  id: number
  email: string
  role: string
  createdAt: Date
  lastLogin?: Date
}

export interface AdminSidebarItem {
  label: string
  href: string
  icon: string
}

export interface MovieFormData {
  title: string
  description: string
  posterUrl?: string
  m3u8Url: string
  rating?: number
  year?: number
  genres?: string
  actors?: string
  directors?: string
  trailerUrl?: string
}

export interface Movie {
  id: number
  title: string
  description?: string
  posterUrl?: string
  m3u8Url: string
  rating?: number
  year?: number
  genres?: string
  actors?: string
  directors?: string
  trailerUrl?: string
  createdAt: Date
  updatedAt: Date
}
