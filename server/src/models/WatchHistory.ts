import type { Document, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IWatchHistory extends Document {
  user: mongoose.Types.ObjectId;
  tmdbId: number;
  movieTitle?: string;
  posterPath?: string;
  watchedAt: Date;
  createdAt: Date;
}

const watchHistorySchema = new Schema<IWatchHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tmdbId: {
      type: Number,
      required: true,
      index: true,
    },
    movieTitle: {
      type: String,
      trim: true,
    },
    posterPath: {
      type: String,
      trim: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound unique index ensuring no duplicate watch history records for the same movie per user in MVP
watchHistorySchema.index({ user: 1, tmdbId: 1 }, { unique: true });

export const WatchHistory: Model<IWatchHistory> =
  mongoose.models.WatchHistory ||
  mongoose.model<IWatchHistory>("WatchHistory", watchHistorySchema);
