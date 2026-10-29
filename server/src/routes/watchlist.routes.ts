import { Router } from "express";
import { TmdbIdSchema, AddWatchlistInputSchema } from "@watchbox/shared";
import { Watchlist } from "../models/Watchlist.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { tmdbService } from "../services/tmdb.service.js";
import { getDBStatus } from "../db.js";

export const watchlistRouter = Router();

// Middleware ensuring DB is connected
watchlistRouter.use(requireAuth, (_req, res, next) => {
  if (getDBStatus() !== "connected") {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }
  next();
});

// Get user watchlist
watchlistRouter.get("/", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const items = await Watchlist.find({ user: userId }).sort({ addedAt: -1 }).lean();

    // Populate TMDB movie summary for each item if TMDB is configured
    const movieIds = items.map((i) => i.tmdbId);
    let movieMap = new Map();
    try {
      const movies = await tmdbService.getMoviesByIds(movieIds);
      movieMap = new Map(movies.map((m) => [m.id, m]));
    } catch {
      // If TMDB is unavailable, return raw item IDs
    }

    const populated = items.map((item) => ({
      id: item._id.toString(),
      userId: item.user.toString(),
      tmdbId: item.tmdbId,
      addedAt: item.addedAt.toISOString(),
      movie: movieMap.get(item.tmdbId) || null,
    }));

    res.status(200).json({ items: populated });
  } catch (err) {
    console.error("[Watchlist Get Error]:", err);
    res.status(500).json({ error: "Failed to retrieve watchlist" });
  }
});

// Add movie to watchlist
watchlistRouter.post("/", validateBody(AddWatchlistInputSchema), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { tmdbId } = req.body;

    const existing = await Watchlist.findOne({ user: userId, tmdbId });
    if (existing) {
      res.status(200).json({
        message: "Movie is already in your watchlist",
        item: {
          id: existing._id.toString(),
          userId: existing.user.toString(),
          tmdbId: existing.tmdbId,
          addedAt: existing.addedAt.toISOString(),
        },
      });
      return;
    }

    // Fetch movie summary if available
    let movie = null;
    let movieTitle: string | undefined;
    let posterPath: string | undefined;
    try {
      movie = await tmdbService.getMovieDetails(tmdbId);
      movieTitle = movie?.title || undefined;
      posterPath = movie?.posterPath || undefined;
    } catch {
      // ignore
    }

    const item = new Watchlist({
      user: userId,
      tmdbId,
      movieTitle,
      posterPath,
      addedAt: new Date(),
    });

    await item.save();

    res.status(201).json({
      message: "Added to watchlist",
      item: {
        id: item._id.toString(),
        userId: item.user.toString(),
        tmdbId: item.tmdbId,
        movieTitle: item.movieTitle,
        posterPath: item.posterPath,
        addedAt: item.addedAt.toISOString(),
        movie,
      },
    });
  } catch (err) {
    console.error("[Watchlist Add Error]:", err);
    res.status(500).json({ error: "Failed to add movie to watchlist" });
  }
});

// Remove movie from watchlist
watchlistRouter.delete("/:tmdbId", async (req, res) => {
  const parsedId = TmdbIdSchema.safeParse(req.params.tmdbId);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid TMDB movie ID format" });
    return;
  }

  try {
    const userId = req.session.userId!;
    const tmdbId = parsedId.data;

    const result = await Watchlist.findOneAndDelete({ user: userId, tmdbId });
    if (!result) {
      res.status(404).json({ error: "Movie not found in watchlist" });
      return;
    }

    res.status(200).json({ message: "Removed from watchlist", tmdbId });
  } catch (err) {
    console.error("[Watchlist Delete Error]:", err);
    res.status(500).json({ error: "Failed to remove movie from watchlist" });
  }
});
