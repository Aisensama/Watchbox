import { app } from "./app.js";
import { connectDB, disconnectDB } from "./db.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB if URI is provided
connectDB().catch((err) => {
  console.warn(
    "[WatchBox Server] Initial DB connection attempt encountered:",
    err.message
  );
});

const server = app.listen(PORT, () => {
  console.log(`[WatchBox Server] Listening on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("\n[WatchBox Server] Shutting down gracefully...");
  server.close(async () => {
    await disconnectDB();
    console.log("[WatchBox Server] Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
