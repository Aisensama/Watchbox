import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type {
  MovieSummary,
  MovieDetail,
  VideoTrailer,
  MovieGenre,
  DnaResponse,
  MovieFilterQuery,
} from "@watchbox/shared";

interface PaginatedMoviesResponse {
  results: MovieSummary[];
  page: number;
  totalPages: number;
}

export const useTrendingMovies = (page = 1) => {
  return useQuery({
    queryKey: ["movies", "trending", page],
    queryFn: () => apiClient<PaginatedMoviesResponse>(`/movies/trending?page=${page}`),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePopularMovies = (page = 1) => {
  return useQuery({
    queryKey: ["movies", "popular", page],
    queryFn: () => apiClient<PaginatedMoviesResponse>(`/movies/popular?page=${page}`),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopRatedMovies = (page = 1) => {
  return useQuery({
    queryKey: ["movies", "top-rated", page],
    queryFn: () => apiClient<PaginatedMoviesResponse>(`/movies/top-rated?page=${page}`),
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpcomingMovies = (page = 1) => {
  return useQuery({
    queryKey: ["movies", "upcoming", page],
    queryFn: () => apiClient<PaginatedMoviesResponse>(`/movies/upcoming?page=${page}`),
    staleTime: 10 * 60 * 1000,
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ["movies", "genres"],
    queryFn: () => apiClient<{ genres: MovieGenre[] }>("/movies/genres"),
    staleTime: 60 * 60 * 1000,
  });
};

export const useSearchMovies = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["movies", "search", query, page],
    queryFn: () =>
      apiClient<PaginatedMoviesResponse>(
        `/movies/search?query=${encodeURIComponent(query)}&page=${page}`
      ),
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDiscoverMovies = (filters: MovieFilterQuery) => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.genre) params.set("genre", String(filters.genre));
  if (filters.year) params.set("year", String(filters.year));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);

  return useQuery({
    queryKey: ["movies", "discover", filters],
    queryFn: () =>
      apiClient<PaginatedMoviesResponse>(`/movies/discover?${params.toString()}`),
    staleTime: 3 * 60 * 1000,
  });
};

export const useMovieDetails = (id?: number) => {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: () => apiClient<MovieDetail>(`/movies/${id}`),
    enabled: Boolean(id && id > 0),
    staleTime: 15 * 60 * 1000,
  });
};

export const useMovieVideos = (id?: number) => {
  return useQuery({
    queryKey: ["movie", id, "videos"],
    queryFn: () =>
      apiClient<{ trailers: VideoTrailer[]; primaryTrailer: VideoTrailer | null }>(
        `/movies/${id}/videos`
      ),
    enabled: Boolean(id && id > 0),
    staleTime: 15 * 60 * 1000,
  });
};

export const useDnaRecommendations = () => {
  return useQuery({
    queryKey: ["movies", "dna"],
    queryFn: () => apiClient<DnaResponse>("/movies/dna"),
    staleTime: 5 * 60 * 1000,
  });
};
