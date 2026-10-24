import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("Server API Integration Tests", () => {
  it("GET /api/health returns 200 with database and TMDB status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.version).toBe("0.1.0");
    expect(["connected", "connecting", "disconnected"]).toContain(res.body.database);
    expect(typeof res.body.tmdbConfigured).toBe("boolean");
  });

  it("GET /api/movies/status returns configuration flag", async () => {
    const res = await request(app).get("/api/movies/status");
    expect(res.status).toBe(200);
    expect(typeof res.body.configured).toBe("boolean");
  });

  it("GET /api/movies/:id rejects invalid non-numeric ID with 400", async () => {
    const res = await request(app).get("/api/movies/not-a-number");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid TMDB movie ID");
  });

  it("Protected routes return 401 when unauthenticated", async () => {
    const profileRes = await request(app).get("/api/users/profile");
    expect(profileRes.status).toBe(401);
    expect(profileRes.body.error).toBe("Authentication required");

    const watchlistRes = await request(app).get("/api/watchlist");
    expect(watchlistRes.status).toBe(401);

    const ratingsRes = await request(app).get("/api/ratings");
    expect(ratingsRes.status).toBe(401);

    const historyRes = await request(app).get("/api/history");
    expect(historyRes.status).toBe(401);
  });

  it("Admin routes return 401/403 when unauthenticated or non-admin", async () => {
    const adminUsersRes = await request(app).get("/api/admin/users");
    expect(adminUsersRes.status).toBe(401);

    const adminColRes = await request(app).post("/api/admin/collections").send({
      title: "Test",
    });
    expect(adminColRes.status).toBe(401);
  });

  it("POST /api/auth/register validates payload with Zod", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "invalid-email",
      password: "short",
      displayName: "A",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it("POST /api/auth/login validates empty credentials with 400", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "",
      password: "",
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/auth/me returns null user when no session is present", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it("GET /api/collections returns published list even when empty", async () => {
    const res = await request(app).get("/api/collections");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.collections)).toBe(true);
  });
});
