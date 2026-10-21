import { describe, it, expect } from "vitest";
import {
  HealthResponseSchema,
  UserRoleSchema,
  TmdbIdSchema,
  PaginationQuerySchema,
} from "../src/index.js";

describe("Shared Schemas Baseline Verification", () => {
  it("validates valid health response payload", () => {
    const valid = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: "test",
      version: "0.1.0",
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
});
