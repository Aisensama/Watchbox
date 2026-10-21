import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import { HealthResponseSchema } from "@watchbox/shared";

describe("Server Baseline Healthcheck Integration", () => {
  it("GET /api/health returns 200 and matches HealthResponseSchema", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    const parseResult = HealthResponseSchema.safeParse(res.body);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.status).toBe("ok");
      expect(parseResult.data.version).toBe("0.1.0");
    }
  });
});
