import app from "../server/dist/app.js";
import { connectDB } from "../server/dist/db.js";

let isDbConnected = false;

export default async function handler(req, res) {
  if (!isDbConnected) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      console.error("[WatchBox Vercel Serverless] DB connection error:", err);
    }
  }

  // Normalize path if Vercel stripped the /api prefix during rewrite
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }

  return app(req, res);
}

export const config = {
  api: {
    externalResolver: true,
  },
};
