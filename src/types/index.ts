export interface Movie {
  id: number;
  title: string;
  posterUrl: string | null;
  rating: number | null;
  year: number | null;
  genres: string | null;
  description: string | null;
  m3u8Url: string;
  bgImage: string | null;
  duration: number | null;
  trailerUrl: string | null;
  actors: string | null;
  directors: string | null;
  createdAt: Date;
  updatedAt: Date;
  addedById: number | null;
}

export interface Series {
  id: number;
  title: string;
  posterUrl: string | null;
  rating: number | null;
  year: number | null;
  genres: string | null;
  description: string | null;
  bgImage: string | null;
  trailerUrl: string | null;
  actors: string | null;
  directors: string | null;
  createdAt: Date;
  updatedAt: Date;
  addedById: number | null;
  seasons?: Season[];
  episodes?: Episode[];
}

export interface Season {
  id: number;
  seriesId: number;
  seasonNumber: number;
  title: string;
  description: string | null;
  posterUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Episode {
  id: number;
  seriesId: number;
  seasonId: number;
  episodeNumber: number;
  title: string;
  description: string | null;
  m3u8Url: string;
  posterUrl: string | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для исходных данных пользователя из Prisma
export interface UserData {
  id: number;
  telegramId: string | null;
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    favorites: number;
    watchHistory: number;
  };
}

// Интерфейс для отформатированных данных пользователя
export interface User {
  id: number;
  telegramId: string | null;
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    favorites: number;
    watchHistory: number;
  };
}
