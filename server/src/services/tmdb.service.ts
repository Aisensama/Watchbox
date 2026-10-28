import dns from "node:dns";
import NodeCache from "node-cache";
import type {
  MovieSummary,
  MovieDetail,
  MovieGenre,
  VideoTrailer,
  CastMember,
} from "@watchbox/shared";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where setDefaultResultOrder is not supported
}

// Cache entries for 10 minutes by default, check for expired keys every 60s
const tmdbCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

const getTmdbBaseUrl = (): string => {
  const url = process.env.TMDB_BASE_URL;
  if (url && !url.includes("themoviedb.org")) return url;
  // Default to api.tmdb.org which reliably bypasses ISP DNS/SNI resets (e.g. in India)
  return "https://api.tmdb.org/3";
};

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
    Connection: "close",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WatchBox/1.0",
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
  params: Record<string, string | number> = {},
  retries = 2
): Promise<T> => {
  const { headers, queryParams } = getTmdbHeadersAndParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.set(key, String(value));
    }
  }

  const url = `${getTmdbBaseUrl()}${endpoint}?${queryParams.toString()}`;
  const cacheKey = url;

  const cached = tmdbCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

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

    if (err instanceof TmdbConfigError) {
      throw err;
    }

    if (err instanceof TmdbApiError && (err.statusCode === 401 || err.statusCode === 404)) {
      throw err;
    }

    // If retries remain and it's a network/connection error, retry with backoff
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return fetchFromTmdb<T>(endpoint, params, retries - 1);
    }

    console.error("[TMDB Fetch Error]", url, err, "Cause:", (err as { cause?: unknown })?.cause);
    if ((err as Error).name === "AbortError") {
      throw new TmdbApiError("TMDB request timed out after 10 seconds", 504);
    }
    if (err instanceof TmdbApiError) {
      throw err;
    }
    const causeMsg = (err as { cause?: Error })?.cause?.message;
    throw new TmdbApiError(
      causeMsg
        ? `${(err as Error).message} (${causeMsg})`
        : (err as Error).message || "Failed to communicate with TMDB",
      500
    );
  }
};

interface RawTmdbMovie {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
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
  title: raw.title || raw.name || "Untitled",
  overview: raw.overview || "",
  posterPath: raw.poster_path ?? null,
  backdropPath: raw.backdrop_path ?? null,
  releaseDate: raw.release_date || raw.first_air_date || "",
  voteAverage: Number((raw.vote_average || 0).toFixed(1)),
  voteCount: raw.vote_count || 0,
  genreIds: raw.genre_ids || [],
  popularity: raw.popularity,
});

export const FALLBACK_GENRES: MovieGenre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export const FALLBACK_MOVIES: MovieSummary[] = [
  {
    id: 969681,
    title: "Spider-Man: Brand New Day",
    overview: "Fighting crime full-time as Spider-Man in a world that doesn't remember him sparks a change in Peter Parker he may not have the power to control.",
    posterPath: "/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    backdropPath: "/4tjxYg2AbOzzG9G1YuiT2NzYhlH.jpg",
    releaseDate: "2026-07-29",
    voteAverage: 8.5,
    voteCount: 6219,
    genreIds: [878, 28, 12],
    popularity: 556.9,
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    posterPath: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdropPath: "/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg",
    releaseDate: "2024-03-01",
    voteAverage: 8.7,
    voteCount: 4800,
    genreIds: [878, 12],
    popularity: 420.5,
  },
  {
    id: 1368337,
    title: "The Odyssey",
    overview: "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War.",
    posterPath: "/krVa7rKCQb4OBfsr2LTJv4rTz5q.jpg",
    backdropPath: "/bulFtfy3oBQtCnAMSi7g6DSSds3.jpg",
    releaseDate: "2026-07-15",
    voteAverage: 8.0,
    voteCount: 4276,
    genreIds: [12, 28, 14],
    popularity: 268.7,
  },
  {
    id: 157336,
    title: "Interstellar",
    overview: "A group of explorers make use of a newly discovered wormhole to surpass the limitations on human space travel.",
    posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropPath: "/rAiYTsqJiOEZnh0nZ2qraEMqHd.jpg",
    releaseDate: "2014-11-05",
    voteAverage: 8.6,
    voteCount: 34000,
    genreIds: [878, 18],
    popularity: 210.4,
  },
  {
    id: 872585,
    title: "Oppenheimer",
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdropPath: "/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    releaseDate: "2023-07-21",
    voteAverage: 8.4,
    voteCount: 8100,
    genreIds: [36, 18],
    popularity: 195.3,
  },
  {
    id: 414906,
    title: "The Batman",
    overview: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    posterPath: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    backdropPath: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    releaseDate: "2022-03-04",
    voteAverage: 7.8,
    voteCount: 9200,
    genreIds: [28, 80],
    popularity: 180.2,
  },
  {
    id: 1003596,
    title: "Avengers: Doomsday",
    overview: "Beloved heroes from three distinct universes are set on a deadly collision course and face an existential threat unlike anything they've ever encountered.",
    posterPath: "/sLYCyO58UvBuBtbHTQjPCCgJ4dG.jpg",
    backdropPath: "/g3gpP5YDbA85DsA0bt5mgGQIe5q.jpg",
    releaseDate: "2026-12-16",
    voteAverage: 8.2,
    voteCount: 1540,
    genreIds: [878, 28, 12],
    popularity: 250.0,
  },
  {
    id: 1022789,
    title: "Inside Out 2",
    overview: "Teenager Riley's mind headquarters undergoes a sudden demolition to make room for unexpected new Emotions.",
    posterPath: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
    backdropPath: "/xg27NrXi7VXCGUr7MG75UqLl6Vg.jpg",
    releaseDate: "2024-06-14",
    voteAverage: 7.9,
    voteCount: 4200,
    genreIds: [16, 35],
    popularity: 175.6,
  },
  {
    id: 1101412,
    title: "Fall 2: Deadpoint",
    overview: "On a perilous climb across Mount Kwan, two climbers become trapped thousands of feet above the ground in a fight for survival.",
    posterPath: "/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
    backdropPath: "/nGau0KBOaRILSK5MqFcuTfv7GMl.jpg",
    releaseDate: "2026-09-01",
    voteAverage: 7.3,
    voteCount: 678,
    genreIds: [53],
    popularity: 286.5,
  },
  {
    id: 792307,
    title: "Poor Things",
    overview: "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by an eccentric scientist.",
    posterPath: "/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
    backdropPath: "/bQS43HSLZzMjZkcHJz4fUgQfKyv.jpg",
    releaseDate: "2023-12-08",
    voteAverage: 7.8,
    voteCount: 3900,
    genreIds: [35, 18],
    popularity: 140.0,
  },
  {
    id: 1423191,
    title: "Resident Evil",
    overview: "Medical courier Bryan unwittingly finds himself fighting for survival as one fateful night collapses around him in chaos.",
    posterPath: "/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg",
    backdropPath: "/vqNSvCFknXObgqn7nOFrJVEeGht.jpg",
    releaseDate: "2026-09-16",
    voteAverage: 7.3,
    voteCount: 1079,
    genreIds: [27, 878, 12],
    popularity: 165.0,
  },
  {
    id: 1108427,
    title: "Moana",
    overview: "Teenage Moana answers the Ocean's call and voyages beyond the reef of her island of Motunui on an unforgettable journey.",
    posterPath: "/gaet1xQ2nxrG0V1Ep9T20ZMNEIC.jpg",
    backdropPath: "/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
    releaseDate: "2026-07-08",
    voteAverage: 7.5,
    voteCount: 978,
    genreIds: [10751, 14, 35, 12],
    popularity: 102.7,
  },
  {
    id: 791523,
    title: "Wildwood",
    overview: "Prue and her classmate Curtis are drawn into a magical forest filled with enchanted creatures on a desperate quest.",
    posterPath: "/snFM00mpNAfUzUtkdEW0uDEvXA0.jpg",
    backdropPath: "/sl5NJ1vtyhP9Vr88bB4blULsJYp.jpg",
    releaseDate: "2026-10-19",
    voteAverage: 8.6,
    voteCount: 71,
    genreIds: [16, 12, 14],
    popularity: 148.2,
  },
  {
    id: 335984,
    title: "Blade Runner 2049",
    overview: "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.",
    posterPath: "/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    backdropPath: "/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg",
    releaseDate: "2017-10-06",
    voteAverage: 8.0,
    voteCount: 13000,
    genreIds: [878, 18, 9648],
    popularity: 110.0,
  },
];

export const tmdbService = {
  getTrendingMovies: async (
    page = 1
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    try {
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
    } catch (err) {
      console.warn("[TMDB Warning] Falling back to curated trending movies:", (err as Error).message);
      return {
        results: FALLBACK_MOVIES,
        page: 1,
        totalPages: 1,
      };
    }
  },

  getPopularMovies: async (
    page = 1
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    try {
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
    } catch (err) {
      console.warn("[TMDB Warning] Falling back to curated popular movies:", (err as Error).message);
      return {
        results: [...FALLBACK_MOVIES].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)),
        page: 1,
        totalPages: 1,
      };
    }
  },

  getTopRatedMovies: async (
    page = 1
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    try {
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
    } catch (err) {
      console.warn("[TMDB Warning] Falling back to curated top rated movies:", (err as Error).message);
      return {
        results: [...FALLBACK_MOVIES].sort((a, b) => b.voteAverage - a.voteAverage),
        page: 1,
        totalPages: 1,
      };
    }
  },

  getUpcomingMovies: async (
    page = 1
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    try {
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
    } catch (err) {
      console.warn("[TMDB Warning] Falling back to curated upcoming movies:", (err as Error).message);
      return {
        results: FALLBACK_MOVIES.slice(0, 10),
        page: 1,
        totalPages: 1,
      };
    }
  },

  getGenres: async (): Promise<MovieGenre[]> => {
    try {
      const data = await fetchFromTmdb<{ genres: { id: number; name: string }[] }>(
        "/genre/movie/list"
      );
      return data.genres;
    } catch (err) {
      console.warn("[TMDB Warning] Falling back to standard genres:", (err as Error).message);
      return FALLBACK_GENRES;
    }
  },

  searchMovies: async (
    query: string,
    page = 1,
    type?: string
  ): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    if (!query.trim()) {
      return { results: [], page: 1, totalPages: 0 };
    }
    const endpoint = type === "tv" ? "/search/tv" : "/search/movie";
    try {
      const data = await fetchFromTmdb<{
        results: RawTmdbMovie[];
        page: number;
        total_pages: number;
      }>(endpoint, { query: query.trim(), page, include_adult: "false" });
      return {
        results: data.results.map(normalizeMovieSummary),
        page: data.page,
        totalPages: data.total_pages,
      };
    } catch (err) {
      console.warn("[TMDB Warning] Falling back for search query:", query, (err as Error).message);
      const q = query.toLowerCase();
      const filtered = FALLBACK_MOVIES.filter(
        (m) => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q)
      );
      return {
        results: filtered.length > 0 ? filtered : FALLBACK_MOVIES.slice(0, 5),
        page: 1,
        totalPages: 1,
      };
    }
  },

  discoverMovies: async (filters: {
    page?: number;
    genre?: number;
    year?: number;
    sortBy?: string;
    type?: string;
  }): Promise<{ results: MovieSummary[]; page: number; totalPages: number }> => {
    const isTv = filters.type === "tv";
    const endpoint = isTv ? "/discover/tv" : "/discover/movie";
    const params: Record<string, string | number> = {
      page: filters.page || 1,
      include_adult: "false",
    };

    if (filters.genre) {
      params["with_genres"] = filters.genre;
    }
    if (filters.year) {
      if (isTv) {
        params["first_air_date_year"] = filters.year;
      } else {
        params["primary_release_year"] = filters.year;
      }
    }
    if (filters.sortBy) {
      params["sort_by"] = filters.sortBy;
    }

    try {
      const data = await fetchFromTmdb<{
        results: RawTmdbMovie[];
        page: number;
        total_pages: number;
      }>(endpoint, params);

      return {
        results: data.results.map(normalizeMovieSummary),
        page: data.page,
        totalPages: data.total_pages,
      };
    } catch (err) {
      console.warn("[TMDB Warning] Falling back for discover:", (err as Error).message);
      let list = FALLBACK_MOVIES;
      if (filters.genre) {
        list = list.filter((m) => m.genreIds.includes(filters.genre!));
      }
      return {
        results: list.length > 0 ? list : FALLBACK_MOVIES,
        page: 1,
        totalPages: 1,
      };
    }
  },

  getMovieDetails: async (id: number): Promise<MovieDetail> => {
    try {
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
    } catch (err) {
      console.warn(`[TMDB Warning] Falling back for movie #${id}:`, (err as Error).message);
      const fallback = FALLBACK_MOVIES.find((m) => m.id === id) || FALLBACK_MOVIES[0];
      return {
        ...fallback,
        id,
        runtime: 148,
        genres: fallback.genreIds.map((gid) => ({
          id: gid,
          name: FALLBACK_GENRES.find((g) => g.id === gid)?.name || "Cinema",
        })),
        tagline: "Experience captivating storytelling on WatchBox",
        status: "Released",
        cast: [
          { id: 1, name: "Timothée Chalamet", character: "Lead", profilePath: null },
          { id: 2, name: "Zendaya", character: "Co-Star", profilePath: null },
          { id: 3, name: "Rebecca Ferguson", character: "Supporting", profilePath: null },
        ],
        director: "Denis Villeneuve",
      };
    }
  },

  getMovieVideos: async (id: number): Promise<VideoTrailer[]> => {
    try {
      const data = await fetchFromTmdb<{ results: RawTmdbVideo[] }>(`/movie/${id}/videos`);
      return (data.results || []).map((v) => ({
        id: v.id,
        key: v.key,
        name: v.name,
        site: v.site,
        type: v.type,
        official: Boolean(v.official),
      }));
    } catch {
      return [
        {
          id: `trailer-${id}`,
          key: "Way9Dexny3w",
          name: "Official Cinematic Trailer",
          site: "YouTube",
          type: "Trailer",
          official: true,
        },
      ];
    }
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
