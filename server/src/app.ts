import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import type { HealthResponse } from "@watchbox/shared";

dotenv.config();

export const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Baseline healthcheck route
app.get("/api/health", (_req, res) => {
  const payload: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "0.1.0",
  };
  res.status(200).json(payload);
});
