import { Router } from "express";
import { TmdbIdSchema } from "@watchbox/shared";
import { WatchHistory } from "../models/WatchHistory.js";
import { requireAuth } from "../middleware/auth.js";
import { tmdbService } from "../services/tmdb.service.js";
import { getDBStatus } from "../db.js";

export const historyRouter = Router();

historyRouter.use(requireAuth, (_req, res, next) => {
  if (getDBStatus() !== "connected") {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }
  next();
});

// Get user watch history
historyRouter.get("/", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const history = await WatchHistory.find({ user: userId })
      .sort({ watchedAt: -1 })
      .lean();

    const movieIds = history.map((h) => h.tmdbId);
    let movieMap = new Map();
    try {
      const movies = await tmdbService.getMoviesByIds(movieIds);
      movieMap = new Map(movies.map((m) => [m.id, m]));
    } catch {
      // ignore
    }

    const populated = history.map((item) => ({
      id: item._id.toString(),
      userId: item.user.toString(),
      tmdbId: item.tmdbId,
      watchedAt: item.watchedAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
      movie: movieMap.get(item.tmdbId) || null,
    }));

    res.status(200).json({ history: populated });
  } catch (err) {
    console.error("[Watch History Get Error]:", err);
    res.status(500).json({ error: "Failed to retrieve watch history" });
  }
});

// Record movie as watched
historyRouter.post("/:tmdbId", async (req, res) => {
  const parsedId = TmdbIdSchema.safeParse(req.params.tmdbId);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid TMDB movie ID format" });
    return;
  }

  try {
    const userId = req.session.userId!;
    const tmdbId = parsedId.data;
    const watchedAt = req.body?.watchedAt ? new Date(req.body.watchedAt) : new Date();

    // Look up movie details for rich database storage
    let movieTitle = req.body?.movieTitle;
    let posterPath = req.body?.posterPath;
    if (!movieTitle) {
      try {
        const details = await tmdbService.getMovieDetails(tmdbId);
        movieTitle = details?.title || undefined;
        posterPath = details?.posterPath || undefined;
      } catch {
        // ignore
      }
    }

    const existing = await WatchHistory.findOne({ user: userId, tmdbId });
    if (existing) {
      existing.watchedAt = watchedAt;
      if (movieTitle && !existing.movieTitle) existing.movieTitle = movieTitle;
      if (posterPath && !existing.posterPath) existing.posterPath = posterPath;
      await existing.save();
      res.status(200).json({
        message: "Watch date updated",
        item: {
          id: existing._id.toString(),
          userId: existing.user.toString(),
          tmdbId: existing.tmdbId,
          movieTitle: existing.movieTitle,
          posterPath: existing.posterPath,
          watchedAt: existing.watchedAt.toISOString(),
          createdAt: existing.createdAt.toISOString(),
        },
      });
      return;
    }

    const item = new WatchHistory({
      user: userId,
      tmdbId,
      movieTitle,
      posterPath,
      watchedAt,
    });

    await item.save();

    res.status(201).json({
      message: "Movie recorded in watch history",
      item: {
        id: item._id.toString(),
        userId: item.user.toString(),
        tmdbId: item.tmdbId,
        movieTitle: item.movieTitle,
        posterPath: item.posterPath,
        watchedAt: item.watchedAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[Watch History Add Error]:", err);
    res.status(500).json({ error: "Failed to record watch history" });
  }
});

// Remove entry from watch history
historyRouter.delete("/:tmdbId", async (req, res) => {
  const parsedId = TmdbIdSchema.safeParse(req.params.tmdbId);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid TMDB movie ID format" });
    return;
  }

  try {
    const userId = req.session.userId!;
    const tmdbId = parsedId.data;

    const result = await WatchHistory.findOneAndDelete({ user: userId, tmdbId });
    if (!result) {
      res.status(404).json({ error: "Movie not found in watch history" });
      return;
    }

    res.status(200).json({ message: "Removed from watch history", tmdbId });
  } catch (err) {
    console.error("[Watch History Delete Error]:", err);
    res.status(500).json({ error: "Failed to remove from watch history" });
  }
});
