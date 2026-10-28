import { Router } from "express";
import {
  tmdbService,
  TmdbConfigError,
  TmdbApiError,
  isTmdbConfigured,
} from "../services/tmdb.service.js";
import { getDnaRecommendations } from "../services/dna.service.js";
import { TmdbIdSchema, MovieFilterQuerySchema } from "@watchbox/shared";

export const movieRouter = Router();

// Set Cache-Control header for instant browser caching (5 minutes fresh, 10 minutes stale-while-revalidate)
movieRouter.use((req, res, next) => {
  if (req.method === "GET") {
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  }
  next();
});

// Handle TMDB errors in a uniform way
const handleTmdbError = (
  err: unknown,
  res: { status: (code: number) => { json: (data: unknown) => void } }
) => {
  if (err instanceof TmdbConfigError) {
    res.status(503).json({
      error: "TMDB service not configured",
      details: "Please set TMDB_API_KEY or TMDB_READ_ACCESS_TOKEN in server/.env",
    });
    return;
  }
  if (err instanceof TmdbApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  res
    .status(500)
    .json({ error: (err as Error).message || "An unexpected movie error occurred" });
};

// Check TMDB configuration status
movieRouter.get("/status", (_req, res) => {
  res.status(200).json({
    configured: isTmdbConfigured(),
  });
});

// Image Proxy to reliably serve TMDB posters and bypass ISP/DNS/adblocker blocks in regions like India
movieRouter.get("/image-proxy", async (req, res) => {
  try {
    const imagePath = String(req.query.path || "");
    const size = String(req.query.size || "w500");
    if (!imagePath || imagePath.includes("..")) {
      res.redirect(
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60"
      );
      return;
    }
    const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    const targetUrl = `https://image.tmdb.org/t/p/${size}${cleanPath}`;

    res.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const tmdbRes = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WatchBox/1.0",
      },
    });
    clearTimeout(timeout);

    if (tmdbRes.ok) {
      const contentType = tmdbRes.headers.get("content-type") || "image/jpeg";
      res.set("Content-Type", contentType);
      const buffer = await tmdbRes.arrayBuffer();
      res.send(Buffer.from(buffer));
      return;
    }
  } catch (err) {
    // If TMDB image fetch fails, redirect to curated unsplash movie fallback
  }
  res.redirect(
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60"
  );
});

// Trending movies
movieRouter.get("/trending", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const data = await tmdbService.getTrendingMovies(page);
    res.status(200).json(data);
  } catch (err) {
    handleTmdbError(err, res);
  }
});

// Popular movies
movieRouter.get("/popular", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const data = await tmdbService.getPopularMovies(page);
    res.status(200).json(data);
  } catch (err) {
    handleTmdbError(err, res);
  }
});

// Top-rated movies
movieRouter.get("/top-rated", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const data = await tmdbService.getTopRatedMovies(page);
    res.status(200).json(data);
  } catch (err) {
    handleTmdbError(err, res);
  }
});

// Upcoming movies
movieRouter.get("/upcoming", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const data = await tmdbService.getUpcomingMovies(page);
    res.status(200).json(data);
  } catch (err) {
    handleTmdbError(err, res);
  }
});

// Movie Genres
movieRouter.get("/genres", async (_req, res) => {
  try {
    const genres = await tmdbService.getGenres();
    res.status(200).json({ genres });
  } catch (err) {
    handleTmdbError(err, res);
  }
});

// Search movies
movieRouter.get("/search", async (req, res) => {
  try {
    const query = String(req.query.query || req.query.q || "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);

    if (!query) {
      res.status(200).json({ results: [], page: 1, totalPages: 0 });
      return;
    }

    const data = await tmdbService.searchMovies(query, page);
    res.status(200).json(data);
  } catch (err) {
    handleTmdbError(err, res);
  }
});

// Explore / Discover with filters
movieRouter.get("/discover", async (req, res) => {
  try {
    const parsedQuery = MovieFilterQuerySchema.parse(req.query);

    // If search term is present in discover, delegate to search
    if (parsedQuery.search && parsedQuery.search.length > 0) {
      const data = await tmdbService.searchMovies(
        parsedQuery.search,
        parsedQuery.page,
        parsedQuery.type
      );
      res.status(200).json(data);
      return;
    }

    const data = await tmdbService.discoverMovies({
      page: parsedQuery.page,
      genre: parsedQuery.genre,
      year: parsedQuery.year,
      sortBy: parsedQuery.sortBy,
      type: parsedQuery.type,
    });
    res.status(200).json(data);
  } catch (err) {
    handleTmdbError(err, res);
  }
});

// WatchBox DNA Recommendations
movieRouter.get("/dna", async (req, res) => {
  try {
    const userId = req.session?.userId;
    const recommendations = await getDnaRecommendations(userId);
    res.status(200).json(recommendations);
  } catch (err) {
    handleTmdbError(err, res);
  }
});

// Movie Details
movieRouter.get("/:id", async (req, res) => {
  const parsedId = TmdbIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid TMDB movie ID format" });
    return;
  }

  try {
    const movie = await tmdbService.getMovieDetails(parsedId.data);
    res.status(200).json(movie);
  } catch (err) {
    handleTmdbError(err, res);
  }
});

// Movie Videos (Trailers)
movieRouter.get("/:id/videos", async (req, res) => {
  const parsedId = TmdbIdSchema.safeParse(req.params.id);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid TMDB movie ID format" });
    return;
  }

  try {
    const videos = await tmdbService.getMovieVideos(parsedId.data);
    // Find official YouTube trailers first, then any trailer, then teaser
    const officialTrailer = videos.find(
      (v) =>
        v.site.toLowerCase() === "youtube" &&
        v.type.toLowerCase() === "trailer" &&
        v.official
    );
    const anyTrailer = videos.find(
      (v) => v.site.toLowerCase() === "youtube" && v.type.toLowerCase() === "trailer"
    );
    const anyVideo = videos.find((v) => v.site.toLowerCase() === "youtube");

    res.status(200).json({
      trailers: videos,
      primaryTrailer: officialTrailer || anyTrailer || anyVideo || null,
    });
  } catch (err) {
    handleTmdbError(err, res);
  }
});
