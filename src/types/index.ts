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
