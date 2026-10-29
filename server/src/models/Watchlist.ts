import type { Document, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IWatchlist extends Document {
  user: mongoose.Types.ObjectId;
  tmdbId: number;
  movieTitle?: string;
  posterPath?: string;
  addedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
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
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound unique index to guarantee one entry per user and movie
watchlistSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

export const Watchlist: Model<IWatchlist> =
  mongoose.models.Watchlist || mongoose.model<IWatchlist>("Watchlist", watchlistSchema);
