import NodeCache from "node-cache";
import type {
  MovieSummary,
  MovieDetail,
  MovieGenre,
  VideoTrailer,
  CastMember,
} from "@watchbox/shared";

// Cache entries for 10 minutes by default, check for expired keys every 60s
const tmdbCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

export class TmdbConfigError extends Error {
  constructor(
    message = "TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN is missing in server/.env"
  ) {
    super(message);
    this.name = "TmdbConfigError";
  }
}

export class TmdbApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "TmdbApiError";
    this.statusCode = statusCode;
  }
}

export const isTmdbConfigured = (): boolean => {
  const token = process.env.TMDB_READ_ACCESS_TOKEN || process.env.TMDB_API_KEY;
  return Boolean(
    token &&
    token.trim().length > 0 &&
    !token.includes("<") &&
    token !== "your_tmdb_api_key_or_token"
  );
};

const getTmdbHeadersAndParams = (): {
  headers: Record<string, string>;
  queryParams: URLSearchParams;
} => {
  const token = (
    process.env.TMDB_READ_ACCESS_TOKEN ||
    process.env.TMDB_API_KEY ||
    ""
  ).trim();

  if (!isTmdbConfigured()) {
    throw new TmdbConfigError();
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const queryParams = new URLSearchParams();

  // If token is a JWT Bearer token (TMDB v4 Read Access Token)
  if (token.startsWith("eyJ")) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    queryParams.set("api_key", token);
  }

  return { headers, queryParams };
};

const fetchFromTmdb = async <T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<T> => {
  const { headers, queryParams } = getTmdbHeadersAndParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.set(key, String(value));
    }
  }

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;
  const cacheKey = url;

  const cached = tmdbCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) {
        throw new TmdbApiError(`Resource not found on TMDB: ${endpoint}`, 404);
      }
      if (res.status === 401) {
        throw new TmdbApiError("Invalid TMDB API key or read token", 401);
      }
      throw new TmdbApiError(
        `TMDB API error ${res.status}: ${res.statusText}`,
        res.status
      );
    }

    const data = (await res.json()) as T;
    tmdbCache.set(cacheKey, data);
    return data;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if ((err as Error).name === "AbortError") {
      throw new TmdbApiError("TMDB request timed out after 8 seconds", 504);
    }
    if (err instanceof TmdbApiError || err instanceof TmdbConfigError) {
      throw err;
    }
    throw new TmdbApiError(
      (err as Error).message || "Failed to communicate with TMDB",
      500
    );
  }
};

interface RawTmdbMovie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  popularity?: number;
}

interface RawTmdbMovieDetail extends RawTmdbMovie {
  runtime?: number | null;
  genres?: { id: number; name: string }[];
  tagline?: string | null;
  status?: string;
  credits?: {
    cast?: {
      id: number;
      name: string;
      character?: string;
      profile_path?: string | null;
    }[];
    crew?: { id: number; name: string; job?: string; department?: string }[];
  };
}

interface RawTmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

const normalizeMovieSummary = (raw: RawTmdbMovie): MovieSummary => ({
  id: raw.id,
  title: raw.title,
  overview: raw.overview || "",
  posterPath: raw.poster_path ?? null,
  backdropPath: raw.backdrop_path ?? null,
  releaseDate: raw.release_date || "",
  voteAverage: Number((raw.vote_average || 0).toFixed(1)),
  voteCount: raw.vote_count || 0,
  genreIds: raw.genre_ids || [],
  popularity: raw.popularity,
});

export const tmdbService = {
  getTrendingMovies: async (
    page = 1
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    const data = await fetchFromTmdb<{
      results: RawTmdbMovie[];
      page: number;
      total_pages: number;
    }>("/trending/movie/day", { page });
    return {
      results: data.results.map(normalizeMovieSummary),
      page: data.page,
      totalPages: data.total_pages,
    };
  },

  getPopularMovies: async (
    page = 1
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    const data = await fetchFromTmdb<{
      results: RawTmdbMovie[];
      page: number;
      total_pages: number;
    }>("/movie/popular", { page });
    return {
      results: data.results.map(normalizeMovieSummary),
      page: data.page,
      totalPages: data.total_pages,
    };
  },

  getTopRatedMovies: async (
    page = 1
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    const data = await fetchFromTmdb<{
      results: RawTmdbMovie[];
      page: number;
      total_pages: number;
    }>("/movie/top_rated", { page });
    return {
      results: data.results.map(normalizeMovieSummary),
      page: data.page,
      totalPages: data.total_pages,
    };
  },

  getUpcomingMovies: async (
    page = 1
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    const data = await fetchFromTmdb<{
      results: RawTmdbMovie[];
      page: number;
      total_pages: number;
    }>("/movie/upcoming", { page });
    return {
      results: data.results.map(normalizeMovieSummary),
      page: data.page,
      totalPages: data.total_pages,
    };
  },

  getGenres: async (): Promise<MovieGenre[]> => {
    const data = await fetchFromTmdb<{ genres: { id: number; name: string }[] }>(
      "/genre/movie/list"
    );
    return data.genres;
  },

  searchMovies: async (
    query: string,
    page = 1
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    if (!query.trim()) {
      return { results: [], page: 1, totalPages: 0 };
    }
    const data = await fetchFromTmdb<{
      results: RawTmdbMovie[];
      page: number;
      total_pages: number;
    }>("/search/movie", { query: query.trim(), page, include_adult: "false" });
    return {
      results: data.results.map(normalizeMovieSummary),
      page: data.page,
      totalPages: data.total_pages,
    };
  },

  discoverMovies: async (filters: {
    page?: number;
    genre?: number;
    year?: number;
    sortBy?: string;
  }): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    const params: Record<string, string | number> = {
      page: filters.page || 1,
      include_adult: "false",
    };

    if (filters.genre) {
      params["with_genres"] = filters.genre;
    }
    if (filters.year) {
      params["primary_release_year"] = filters.year;
    }
    if (filters.sortBy) {
      params["sort_by"] = filters.sortBy;
    }

    const data = await fetchFromTmdb<{
      results: RawTmdbMovie[];
      page: number;
      total_pages: number;
    }>("/discover/movie", params);

    return {
      results: data.results.map(normalizeMovieSummary),
      page: data.page,
      totalPages: data.total_pages,
    };
  },

  getMovieDetails: async (id: number): Promise<MovieDetail> => {
    const data = await fetchFromTmdb<RawTmdbMovieDetail>(`/movie/${id}`, {
      append_to_response: "credits",
    });

    const cast: CastMember[] = (data.credits?.cast || []).slice(0, 15).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character || "",
      profilePath: c.profile_path ?? null,
    }));

    const directorObj = data.credits?.crew?.find(
      (c) => c.job === "Director" || c.department === "Directing"
    );

    return {
      ...normalizeMovieSummary(data),
      runtime: data.runtime ?? null,
      genres: data.genres || [],
      tagline: data.tagline ?? null,
      status: data.status,
      cast,
      director: directorObj?.name ?? null,
    };
  },

  getMovieVideos: async (id: number): Promise<VideoTrailer[]> => {
    const data = await fetchFromTmdb<{ results: RawTmdbVideo[] }>(`/movie/${id}/videos`);
    return (data.results || []).map((v) => ({
      id: v.id,
      key: v.key,
      name: v.name,
      site: v.site,
      type: v.type,
      official: Boolean(v.official),
    }));
  },

  getMoviesByIds: async (ids: number[]): Promise<MovieSummary[]> => {
    if (!ids || ids.length === 0) return [];
    const results = await Promise.all(
      ids.slice(0, 30).map(async (id) => {
        try {
          const detail = await tmdbService.getMovieDetails(id);
          return detail;
        } catch {
          return null;
        }
      })
    );
    return results.filter((m): m is MovieDetail => m !== null);
  },

  clearCache: (): void => {
    tmdbCache.flushAll();
  },
};
