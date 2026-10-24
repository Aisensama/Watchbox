import { z } from "zod";

// --- Base / Common Schemas ---
export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string().datetime(),
  environment: z.string(),
  version: z.string(),
  database: z.enum(["connected", "connecting", "disconnected"]).optional(),
  tmdbConfigured: z.boolean().optional(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// --- User Roles ---
export const UserRoleSchema = z.enum(["user", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// --- ID Validation ---
export const TmdbIdSchema = z.coerce
  .number()
  .int()
  .positive("TMDB ID must be a positive integer");
export type TmdbId = z.infer<typeof TmdbIdSchema>;

// --- Pagination Query ---
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// --- Authentication & User Schemas ---
export const RegisterInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long"),
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be under 50 characters"),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const UserProfileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be under 50 characters")
    .optional(),
  bio: z.string().max(300, "Bio must be under 300 characters").optional(),
  avatar: z.string().max(500).optional(),
  favoriteGenres: z.array(z.number().int().positive()).optional(),
});
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;

export const SafeUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  role: UserRoleSchema,
  avatar: z.string().optional(),
  bio: z.string().optional(),
  favoriteGenres: z.array(z.number()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SafeUser = z.infer<typeof SafeUserSchema>;

// --- Movies & TMDB Schemas ---
export const MovieGenreSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});
export type MovieGenre = z.infer<typeof MovieGenreSchema>;

export const MovieSummarySchema = z.object({
  id: z.number().int(),
  title: z.string(),
  overview: z.string(),
  posterPath: z.string().nullable().optional(),
  backdropPath: z.string().nullable().optional(),
  releaseDate: z.string().default(""),
  voteAverage: z.number().default(0),
  voteCount: z.number().default(0),
  genreIds: z.array(z.number()).default([]),
  popularity: z.number().optional(),
});
export type MovieSummary = z.infer<typeof MovieSummarySchema>;

export const CastMemberSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  character: z.string().default(""),
  profilePath: z.string().nullable().optional(),
});
export type CastMember = z.infer<typeof CastMemberSchema>;

export const MovieDetailSchema = MovieSummarySchema.extend({
  runtime: z.number().nullable().optional(),
  genres: z.array(MovieGenreSchema).default([]),
  tagline: z.string().nullable().optional(),
  status: z.string().optional(),
  cast: z.array(CastMemberSchema).default([]),
  director: z.string().nullable().optional(),
});
export type MovieDetail = z.infer<typeof MovieDetailSchema>;

export const VideoTrailerSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean().default(false),
});
export type VideoTrailer = z.infer<typeof VideoTrailerSchema>;

export const MovieFilterQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  genre: z.coerce.number().int().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  sortBy: z
    .enum([
      "popularity.desc",
      "vote_average.desc",
      "primary_release_date.desc",
      "title.asc",
    ])
    .default("popularity.desc"),
  search: z.string().trim().optional(),
});
export type MovieFilterQuery = z.infer<typeof MovieFilterQuerySchema>;

// --- Personal Feature Schemas ---
export const WatchlistItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tmdbId: z.number().int(),
  addedAt: z.string(),
  movie: MovieSummarySchema.optional(),
});
export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;

export const AddWatchlistInputSchema = z.object({
  tmdbId: TmdbIdSchema,
});
export type AddWatchlistInput = z.infer<typeof AddWatchlistInputSchema>;

export const RatingInputSchema = z.object({
  score: z.coerce
    .number()
    .int()
    .min(1, "Score must be at least 1")
    .max(10, "Score cannot exceed 10"),
  reviewNote: z
    .string()
    .trim()
    .max(500, "Review must be under 500 characters")
    .optional(),
});
export type RatingInput = z.infer<typeof RatingInputSchema>;

export const RatingItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tmdbId: z.number().int(),
  score: z.number().int().min(1).max(10),
  reviewNote: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  movie: MovieSummarySchema.optional(),
});
export type RatingItem = z.infer<typeof RatingItemSchema>;

export const WatchHistoryItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tmdbId: z.number().int(),
  watchedAt: z.string(),
  createdAt: z.string(),
  movie: MovieSummarySchema.optional(),
});
export type WatchHistoryItem = z.infer<typeof WatchHistoryItemSchema>;

export const AddWatchHistoryInputSchema = z.object({
  tmdbId: TmdbIdSchema,
  watchedAt: z.string().datetime().optional(),
});
export type AddWatchHistoryInput = z.infer<typeof AddWatchHistoryInputSchema>;

// --- Curated Collections ---
export const CuratedCollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  coverImage: z.string().optional(),
  tmdbMovieIds: z.array(z.number().int()).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
  movies: z.array(MovieSummarySchema).optional(),
});
export type CuratedCollection = z.infer<typeof CuratedCollectionSchema>;

export const CreateCollectionInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title is too long"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description is too long"),
  coverImage: z.string().trim().optional(),
  tmdbMovieIds: z.array(z.number().int()).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});
export type CreateCollectionInput = z.infer<typeof CreateCollectionInputSchema>;

export const UpdateCollectionInputSchema = CreateCollectionInputSchema.partial();
export type UpdateCollectionInput = z.infer<typeof UpdateCollectionInputSchema>;

// --- WatchBox DNA Schemas ---
export const DnaTasteDimensionSchema = z.object({
  label: z.string(),
  score: z.number().min(0).max(100),
});
export type DnaTasteDimension = z.infer<typeof DnaTasteDimensionSchema>;

export const DnaRecommendationSchema = z.object({
  movie: MovieSummarySchema,
  affinityScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  dimensions: z.array(DnaTasteDimensionSchema),
});
export type DnaRecommendation = z.infer<typeof DnaRecommendationSchema>;

export const DnaResponseSchema = z.object({
  recommendations: z.array(DnaRecommendationSchema),
  isFallback: z.boolean(),
  summary: z.string(),
});
export type DnaResponse = z.infer<typeof DnaResponseSchema>;
