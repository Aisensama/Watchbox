import { Router } from "express";
import { CuratedCollection } from "../models/CuratedCollection.js";
import { tmdbService } from "../services/tmdb.service.js";
import { getDBStatus } from "../db.js";

export const collectionRouter = Router();

// Get published collections
collectionRouter.get("/", async (req, res) => {
  if (getDBStatus() !== "connected") {
    // If DB is offline, return empty list gracefully
    res.status(200).json({ collections: [] });
    return;
  }

  try {
    const filter: Record<string, unknown> = { isPublished: true };
    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    const collections = await CuratedCollection.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Populate preview movies for each collection
    const populated = await Promise.all(
      collections.map(async (col) => {
        let movies: unknown[] = [];
        try {
          movies = await tmdbService.getMoviesByIds(col.tmdbMovieIds.slice(0, 8));
        } catch {
          // ignore
        }
        return {
          id: col._id.toString(),
          title: col.title,
          slug: col.slug,
          description: col.description,
          coverImage: col.coverImage || "",
          tmdbMovieIds: col.tmdbMovieIds,
          isFeatured: col.isFeatured,
          isPublished: col.isPublished,
          createdAt: col.createdAt.toISOString(),
          updatedAt: col.updatedAt.toISOString(),
          movies,
        };
      })
    );

    res.status(200).json({ collections: populated });
  } catch (err) {
    console.error("[Collections Get Error]:", err);
    res.status(500).json({ error: "Failed to retrieve collections" });
  }
});

// Get single collection by slug
collectionRouter.get("/:slug", async (req, res) => {
  if (getDBStatus() !== "connected") {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  try {
    const { slug } = req.params;
    const col = await CuratedCollection.findOne({ slug: slug.toLowerCase() }).lean();

    if (!col) {
      res.status(404).json({ error: "Curated collection not found" });
      return;
    }

    let movies: unknown[] = [];
    try {
      movies = await tmdbService.getMoviesByIds(col.tmdbMovieIds);
    } catch {
      // ignore
    }

    res.status(200).json({
      collection: {
        id: col._id.toString(),
        title: col.title,
        slug: col.slug,
        description: col.description,
        coverImage: col.coverImage || "",
        tmdbMovieIds: col.tmdbMovieIds,
        isFeatured: col.isFeatured,
        isPublished: col.isPublished,
        createdAt: col.createdAt.toISOString(),
        updatedAt: col.updatedAt.toISOString(),
        movies,
      },
    });
  } catch (err) {
    console.error("[Collection Get By Slug Error]:", err);
    res.status(500).json({ error: "Failed to retrieve collection" });
  }
});
