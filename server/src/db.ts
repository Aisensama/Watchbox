import dns from "node:dns";
import mongoose from "mongoose";

// Ensure resilient DNS resolution for MongoDB Atlas SRV resolution across all platforms & networks
try {
  dns.setDefaultResultOrder("ipv4first");
  const existing = dns.getServers();
  const validServers = existing.filter((s) => s !== "127.0.0.1" && s !== "::1");
  dns.setServers([
    ...validServers,
    "172.16.2.1",
    "192.168.0.1",
    "192.168.1.1",
    "1.1.1.1",
    "8.8.8.8",
  ]);
} catch {
  // ignore in non-Node or restricted environments
}

let isConnecting = false;

export const getDBStatus = (): "connected" | "connecting" | "disconnected" => {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 1:
      return "connected";
    case 2:
      return "connecting";
    default:
      return "disconnected";
  }
};

export const connectDB = async (
  uriOverride?: string
): Promise<typeof mongoose | null> => {
  const uri = uriOverride || process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      "[WatchBox Database] Warning: MONGODB_URI is not set. Database operations will be unavailable until configured."
    );
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (isConnecting) {
    return null;
  }

  try {
    isConnecting = true;
    console.log("[WatchBox Database] Connecting to MongoDB...");
    let conn: typeof mongoose | null = null;
    try {
      conn = await mongoose.connect(uri, {
        dbName: "watchbox",
        serverSelectionTimeoutMS: 8000,
        autoIndex: true,
      });
    } catch (primaryErr) {
      const errMsg = (primaryErr as Error).message || "";
      if (errMsg.includes("querySrv") || errMsg.includes("ECONNREFUSED") || errMsg.includes("ENOTFOUND")) {
        console.warn(
          "[WatchBox Database] SRV DNS resolution failed, connecting via direct replica set hosts..."
        );
        const directUri = uri.replace(
          /mongodb\+srv:\/\/([^@]+)@cluster0\.udgw4mi\.mongodb\.net\/?([^?]*)/,
          "mongodb://$1@ac-diaofvn-shard-00-00.udgw4mi.mongodb.net:27017,ac-diaofvn-shard-00-01.udgw4mi.mongodb.net:27017,ac-diaofvn-shard-00-02.udgw4mi.mongodb.net:27017/watchbox?ssl=true&replicaSet=atlas-qb1jvg-shard-0&authSource=admin"
        );
        conn = await mongoose.connect(directUri, {
          dbName: "watchbox",
          serverSelectionTimeoutMS: 8000,
          autoIndex: true,
        });
      } else {
        throw primaryErr;
      }
    }
    console.log(
      `[WatchBox Database] MongoDB connected successfully to database: "${conn.connection.name}" on ${conn.connection.host}`
    );
    return conn;
  } catch (err) {
    console.error(
      "[WatchBox Database] MongoDB connection failed:",
      (err as Error).message
    );
    return null;
  } finally {
    isConnecting = false;
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("[WatchBox Database] MongoDB disconnected.");
  }
};
