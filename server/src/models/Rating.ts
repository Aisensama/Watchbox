import type { Document, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IRating extends Document {
  user: mongoose.Types.ObjectId;
  tmdbId: number;
  score: number;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
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
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    reviewNote: {
      type: String,
      maxlength: 500,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one rating per user and movie
ratingSchema.index({ user: 1, tmdbId: 1 }, { unique: true });

export const Rating: Model<IRating> =
  mongoose.models.Rating || mongoose.model<IRating>("Rating", ratingSchema);
