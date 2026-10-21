import { z } from "zod";

// --- Base / Common Schemas ---
export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string().datetime(),
  environment: z.string(),
  version: z.string(),
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
