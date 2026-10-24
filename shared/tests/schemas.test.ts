import { describe, it, expect } from "vitest";
import {
  HealthResponseSchema,
  UserRoleSchema,
  TmdbIdSchema,
  PaginationQuerySchema,
  RegisterInputSchema,
  RatingInputSchema,
  CreateCollectionInputSchema,
  MovieFilterQuerySchema,
} from "../src/index.js";

describe("Shared Schemas Verification", () => {
  it("validates valid health response payload", () => {
    const valid = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: "test",
      version: "0.1.0",
      database: "connected",
    };
    const parsed = HealthResponseSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid user roles", () => {
    expect(UserRoleSchema.safeParse("user").success).toBe(true);
    expect(UserRoleSchema.safeParse("admin").success).toBe(true);
    expect(UserRoleSchema.safeParse("superadmin").success).toBe(false);
  });

  it("coerces and validates positive TMDB numeric IDs", () => {
    const parsed = TmdbIdSchema.safeParse("550");
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toBe(550);
    }
    expect(TmdbIdSchema.safeParse("-1").success).toBe(false);
    expect(TmdbIdSchema.safeParse("abc").success).toBe(false);
  });

  it("applies defaults to pagination query schema", () => {
    const parsed = PaginationQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  it("validates and normalizes registration input", () => {
    const result = RegisterInputSchema.safeParse({
      email: "  Test.User@example.com ",
      password: "strongpassword123",
      displayName: "  MovieBuff  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test.user@example.com");
      expect(result.data.displayName).toBe("MovieBuff");
    }

    const tooShort = RegisterInputSchema.safeParse({
      email: "valid@example.com",
      password: "short",
      displayName: "M",
    });
    expect(tooShort.success).toBe(false);
  });

  it("enforces rating boundary constraints (1-10)", () => {
    expect(RatingInputSchema.safeParse({ score: 1 }).success).toBe(true);
    expect(RatingInputSchema.safeParse({ score: 10 }).success).toBe(true);
    expect(RatingInputSchema.safeParse({ score: 0 }).success).toBe(false);
    expect(RatingInputSchema.safeParse({ score: 11 }).success).toBe(false);
  });

  it("validates collection slug format", () => {
    const valid = CreateCollectionInputSchema.safeParse({
      title: "Sci-Fi Essentials",
      slug: "sci-fi-essentials-2024",
      description: "Must-watch science fiction cinema through the decades.",
      tmdbMovieIds: [157336, 693134],
    });
    expect(valid.success).toBe(true);

    const invalidSlug = CreateCollectionInputSchema.safeParse({
      title: "Sci-Fi Essentials",
      slug: "SciFi Essentials!",
      description: "Must-watch science fiction cinema.",
    });
    expect(invalidSlug.success).toBe(false);
  });

  it("handles movie filter query parameters", () => {
    const parsed = MovieFilterQuerySchema.parse({
      page: "2",
      genre: "878",
      year: "2024",
      sortBy: "vote_average.desc",
    });
    expect(parsed.page).toBe(2);
    expect(parsed.genre).toBe(878);
    expect(parsed.year).toBe(2024);
    expect(parsed.sortBy).toBe("vote_average.desc");
  });
});
