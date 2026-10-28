import { Router } from "express";
import { CuratedCollection } from "../models/CuratedCollection.js";
import { tmdbService } from "../services/tmdb.service.js";
import { getDBStatus } from "../db.js";

export const collectionRouter = Router();

const STARTER_COLLECTIONS = [
  {
    id: "col-1",
    title: "Mind-Bending Sci-Fi & Cosmic Horizons",
    slug: "mind-bending-sci-fi",
    description:
      "Journey through wormholes, dystopian futures, and metaphysical realities with these cinema-defining sci-fi journeys.",
    coverImage: "/api/movies/image-proxy?size=w1280&path=/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    tmdbMovieIds: [157336, 693134, 335984, 264660, 329865, 603],
    isFeatured: true,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    movies: [],
  },
  {
    id: "col-2",
    title: "Top Rated Modern Masterpieces",
    slug: "top-rated-masterpieces",
    description:
      "Award-winning cinematic tours-de-force with legendary performances and visionary directing.",
    coverImage: "/api/movies/image-proxy?size=w1280&path=/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
    tmdbMovieIds: [872585, 278, 238, 155, 496243, 680],
    isFeatured: true,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    movies: [],
  },
  {
    id: "col-3",
    title: "High-Octane Action & Thrills",
    slug: "action-thrills-hub",
    description:
      "Relentless adrenaline, choreographed stunts, and tense edge-of-your-seat confrontations.",
    coverImage: "/api/movies/image-proxy?size=w1280&path=/yDHYTfaA9g6c4h2n099m6Wc3jHn.jpg",
    tmdbMovieIds: [533535, 786892, 414906, 76341, 603692],
    isFeatured: true,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    movies: [],
  },
];

// Get published collections
collectionRouter.get("/", async (req, res) => {
  if (getDBStatus() !== "connected") {
    // If DB is offline, return starter collections gracefully
    res.status(200).json({ collections: STARTER_COLLECTIONS });
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
