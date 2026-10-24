import mongoose from "mongoose";

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
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(
      `[WatchBox Database] MongoDB connected successfully: ${conn.connection.host}`
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
