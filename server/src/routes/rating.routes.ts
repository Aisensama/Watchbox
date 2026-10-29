import { Router } from "express";
import { TmdbIdSchema, RatingInputSchema } from "@watchbox/shared";
import { Rating } from "../models/Rating.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { tmdbService } from "../services/tmdb.service.js";
import { getDBStatus } from "../db.js";

export const ratingRouter = Router();

ratingRouter.use(requireAuth, (_req, res, next) => {
  if (getDBStatus() !== "connected") {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }
  next();
});

// Get all ratings for authenticated user
ratingRouter.get("/", async (req, res) => {
  try {
    const userId = req.session.userId!;
    const ratings = await Rating.find({ user: userId }).sort({ updatedAt: -1 }).lean();

    const movieIds = ratings.map((r) => r.tmdbId);
    let movieMap = new Map();
    try {
      const movies = await tmdbService.getMoviesByIds(movieIds);
      movieMap = new Map(movies.map((m) => [m.id, m]));
    } catch {
      // ignore
    }

    const populated = ratings.map((r) => ({
      id: r._id.toString(),
      userId: r.user.toString(),
      tmdbId: r.tmdbId,
      score: r.score,
      reviewNote: r.reviewNote || "",
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      movie: movieMap.get(r.tmdbId) || null,
    }));

    res.status(200).json({ ratings: populated });
  } catch (err) {
    console.error("[Rating Get Error]:", err);
    res.status(500).json({ error: "Failed to retrieve ratings" });
  }
});

// Upsert rating for a movie
ratingRouter.put("/:tmdbId", validateBody(RatingInputSchema), async (req, res) => {
  const parsedId = TmdbIdSchema.safeParse(req.params.tmdbId);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid TMDB movie ID format" });
    return;
  }

  try {
    const userId = req.session.userId!;
    const tmdbId = parsedId.data;
    const { score, reviewNote } = req.body;

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

    const updateDoc: Record<string, unknown> = {
      score,
      reviewNote: reviewNote || "",
      updatedAt: new Date(),
    };
    if (movieTitle) updateDoc.movieTitle = movieTitle;
    if (posterPath) updateDoc.posterPath = posterPath;

    const rating = await Rating.findOneAndUpdate(
      { user: userId, tmdbId },
      updateDoc,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Rating saved successfully",
      rating: {
        id: rating._id.toString(),
        userId: rating.user.toString(),
        tmdbId: rating.tmdbId,
        score: rating.score,
        reviewNote: rating.reviewNote,
        createdAt: rating.createdAt.toISOString(),
        updatedAt: rating.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[Rating Upsert Error]:", err);
    res.status(500).json({ error: "Failed to save rating" });
  }
});

// Delete rating
ratingRouter.delete("/:tmdbId", async (req, res) => {
  const parsedId = TmdbIdSchema.safeParse(req.params.tmdbId);
  if (!parsedId.success) {
    res.status(400).json({ error: "Invalid TMDB movie ID format" });
    return;
  }

  try {
    const userId = req.session.userId!;
    const tmdbId = parsedId.data;

    const result = await Rating.findOneAndDelete({ user: userId, tmdbId });
    if (!result) {
      res.status(404).json({ error: "Rating not found" });
      return;
    }

    res.status(200).json({ message: "Rating deleted successfully", tmdbId });
  } catch (err) {
    console.error("[Rating Delete Error]:", err);
    res.status(500).json({ error: "Failed to delete rating" });
  }
});
