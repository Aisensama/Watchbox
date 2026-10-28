import "dotenv/config";
import dns from "node:dns";
try {
  dns.setDefaultResultOrder("ipv4first");
  const servers = dns.getServers();
  if (servers.length === 0 || servers.every((s) => s === "127.0.0.1" || s === "::1")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
} catch {
  // Ignore in environments where not supported
}

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

const server = app.listen(Number(PORT), "0.0.0.0", () => {
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
