import express from "express";
import helmet from "helmet";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import type { HealthResponse } from "@watchbox/shared";

import { getDBStatus } from "./db.js";
import { isTmdbConfigured } from "./services/tmdb.service.js";
import { authRouter } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { movieRouter } from "./routes/movie.routes.js";
import { watchlistRouter } from "./routes/watchlist.routes.js";
import { ratingRouter } from "./routes/rating.routes.js";
import { historyRouter } from "./routes/history.routes.js";
import { collectionRouter } from "./routes/collection.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

dotenv.config();

export const app = express();

const isProduction = process.env.NODE_ENV === "production";
const sessionSecret =
  process.env.SESSION_SECRET || "watchbox_super_secret_session_key_32chars_long";

// Trust reverse proxy (Vercel, Render, AWS, etc.) for secure cookies over HTTPS
app.set("trust proxy", 1);

// 1. Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // allow YouTube embed and TMDB image CDN
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS configuration
const allowedOrigin = process.env.CLIENT_ORIGIN;
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like same-origin, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        !allowedOrigin ||
        origin === allowedOrigin ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// 3. Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 4. Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many authentication requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. Session Setup (MongoDB backed when configured, memory fallback in tests/offline)
let sessionStore: session.Store | undefined = undefined;
const mongoUri = process.env.MONGODB_URI;

if (mongoUri && !mongoUri.includes("<") && !mongoUri.includes("your_password")) {
  try {
    sessionStore = MongoStore.create({
      mongoUrl: mongoUri,
      touchAfter: 24 * 3600, // lazy session update once per 24 hours
      collectionName: "sessions",
    });
    sessionStore.on("error", (err) => {
      console.warn(
        "[WatchBox Server] Session store connection notice:",
        err.message
      );
    });
    // Prevent unhandled promise rejection in Node 24 when Mongo is temporarily unreachable
    const rawStore = sessionStore as unknown as {
      clientP?: Promise<unknown>;
      collectionP?: Promise<unknown>;
    };
    rawStore.clientP?.catch((err: Error) => {
      console.warn(
        "[WatchBox Server] MongoStore client connection notice:",
        err.message
      );
    });
    rawStore.collectionP?.catch(() => {
      // Caught to prevent unhandled rejection termination
    });
  } catch (err) {
    console.warn(
      "[WatchBox Server] Could not initialize MongoStore, falling back to memory session:",
      (err as Error).message
    );
  }
}

app.use(
  session({
    name: "watchbox.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  })
);

// 6. Baseline Healthcheck
app.get("/api/health", (_req, res) => {
  const payload: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "0.1.0",
    database: getDBStatus(),
    tmdbConfigured: isTmdbConfigured(),
  };
  res.status(200).json(payload);
});

// 7. Mount Routers
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/users", userRouter);
app.use("/api/movies", movieRouter);
app.use("/api/watchlist", watchlistRouter);
app.use("/api/ratings", ratingRouter);
app.use("/api/history", historyRouter);
app.use("/api/collections", collectionRouter);
app.use("/api/admin", adminRouter);

// 8. 404 handler for API routes
app.use("/api/*", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// 9. Global Error Handler (Do not leak stack traces)
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[WatchBox Uncaught Error]:", err.message);
    res.status(500).json({
      error: "Internal server error",
      message: isProduction ? "An unexpected error occurred" : err.message,
    });
  }
);

export default app;
