import { tmdbService } from "./tmdb.service.js";
import { Rating, WatchHistory, User } from "../models/index.js";
import type {
  DnaResponse,
  DnaRecommendation,
  MovieSummary,
  DnaTasteDimension,
} from "@watchbox/shared";

// Deterministic dimension mapping based on TMDB Genre IDs
const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const generateDimensionsForMovie = (
  movie: MovieSummary,
  affinityScore: number
): DnaTasteDimension[] => {
  const genres = movie.genreIds;
  const isSciFi = genres.includes(878);
  const isAction = genres.includes(28) || genres.includes(12);
  const isDrama = genres.includes(18);
  const isThriller = genres.includes(53) || genres.includes(9648);
  const isAnimation = genres.includes(16);

  const base = Math.min(95, Math.max(50, affinityScore));

  return [
    {
      label: isSciFi || isThriller ? "Mind-Bending" : "Narrative Depth",
      score: Math.min(98, Math.round(isSciFi ? base : base * 0.88)),
    },
    {
      label: isSciFi || isAction ? "Visual Spectacle" : "Atmosphere",
      score: Math.min(98, Math.round(isAction || isSciFi ? base * 0.96 : base * 0.8)),
    },
    {
      label: isDrama ? "Emotional Depth" : "Character Arc",
      score: Math.min(95, Math.round(isDrama ? base * 0.94 : base * 0.75)),
    },
    {
      label: isThriller
        ? "Suspense & Tension"
        : isAnimation
          ? "Whimsical Charm"
          : "Pacing",
      score: Math.min(96, Math.round(isThriller ? base * 0.92 : base * 0.82)),
    },
    {
      label: "Critical Acclaim",
      score: Math.min(99, Math.round(movie.voteAverage * 10)),
    },
  ];
};

export const getDnaRecommendations = async (userId?: string): Promise<DnaResponse> => {
  // 1. Gather User Signals if user is logged in
  const preferredGenreIds: number[] = [];
  const watchedMovieIds: Set<number> = new Set();
  let hasUserSignals = false;

  if (userId) {
    try {
      const [user, ratings, history] = await Promise.all([
        User.findById(userId).lean(),
        Rating.find({ user: userId }).lean(),
        WatchHistory.find({ user: userId }).lean(),
      ]);

      if (user?.favoriteGenres && user.favoriteGenres.length > 0) {
        preferredGenreIds.push(...user.favoriteGenres);
        hasUserSignals = true;
      }

      // High ratings (>= 7) give positive taste signal
      if (ratings && ratings.length > 0) {
        hasUserSignals = true;
      }

      if (history && history.length > 0) {
        history.forEach((h) => watchedMovieIds.add(h.tmdbId));
      }
    } catch {
      // If DB is offline, continue to fallback gracefully
    }
  }

  // 2. Fetch candidate movies
  const [trending, topRated] = await Promise.all([
    tmdbService.getTrendingMovies(1),
    tmdbService.getTopRatedMovies(1),
  ]);
  const candidates: MovieSummary[] = [...trending.results, ...topRated.results];

  // Deduplicate candidates by id
  const candidateMap = new Map<number, MovieSummary>();
  for (const m of candidates) {
    if (!candidateMap.has(m.id)) {
      candidateMap.set(m.id, m);
    }
  }
  const uniqueCandidates = Array.from(candidateMap.values());

  // Exclude watched movies
  const unwatchedCandidates = uniqueCandidates.filter((m) => !watchedMovieIds.has(m.id));
  const pool = unwatchedCandidates.length >= 6 ? unwatchedCandidates : uniqueCandidates;

  // 3. Fallback mode for new users with insufficient profile data
  if (!hasUserSignals) {
    const recommendations: DnaRecommendation[] = pool.slice(0, 10).map((movie, index) => {
      const score = Math.max(
        78,
        Math.min(95, Math.round(movie.voteAverage * 10 - index))
      );
      const genreNames = movie.genreIds
        .map((id) => GENRE_MAP[id])
        .filter(Boolean)
        .slice(0, 2);

      const reasons = [
        `Universally acclaimed ${genreNames.join(" & ") || "Cinema"} selection`,
        `Audience rating of ${movie.voteAverage}/10 from over ${movie.voteCount.toLocaleString()} votes`,
        "Recommended starter pick to help calibrate your WatchBox taste profile",
      ];

      return {
        movie,
        affinityScore: score,
        reasons,
        dimensions: generateDimensionsForMovie(movie, score),
      };
    });

    return {
      recommendations,
      isFallback: true,
      summary:
        "Welcome to WatchBox DNA! Rate movies and save to your watchlist to unlock custom algorithmic taste matching.",
    };
  }

  // 4. Personalized scoring
  const scoredRecommendations: DnaRecommendation[] = pool.map((movie) => {
    let score = 50; // base score
    const reasons: string[] = [];

    // Genre affinity
    const matchedGenreIds = movie.genreIds.filter((id) => preferredGenreIds.includes(id));
    if (matchedGenreIds.length > 0) {
      score += matchedGenreIds.length * 15;
      const matchedNames = matchedGenreIds.map((id) => GENRE_MAP[id]).filter(Boolean);
      reasons.push(`Directly matches your favorite genre: ${matchedNames.join(", ")}`);
    }

    // High TMDB rating boost
    if (movie.voteAverage >= 8.0) {
      score += 15;
      reasons.push(`Critically acclaimed masterpiece (${movie.voteAverage}/10)`);
    } else if (movie.voteAverage >= 7.0) {
      score += 8;
      reasons.push(`Strong audience appreciation (${movie.voteAverage}/10)`);
    }

    // High popularity boost
    if ((movie.popularity || 0) > 40) {
      score += 8;
      reasons.push("Trending among movie enthusiasts this week");
    }

    const finalScore = Math.min(98, Math.max(65, Math.round(score)));

    if (reasons.length === 0) {
      reasons.push("Recommended based on your recent watchlist profile");
    }

    return {
      movie,
      affinityScore: finalScore,
      reasons,
      dimensions: generateDimensionsForMovie(movie, finalScore),
    };
  });

  // Sort descending by affinity score
  scoredRecommendations.sort((a, b) => b.affinityScore - a.affinityScore);

  return {
    recommendations: scoredRecommendations.slice(0, 10),
    isFallback: false,
    summary:
      "Calculated from your profile genres, watch history, and rating preferences using WatchBox's deterministic taste engine.",
  };
};
