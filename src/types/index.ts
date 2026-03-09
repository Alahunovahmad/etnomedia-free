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
