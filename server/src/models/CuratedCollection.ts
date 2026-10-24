import type { Document, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface ICuratedCollection extends Document {
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  tmdbMovieIds: number[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const curatedCollectionSchema = new Schema<ICuratedCollection>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    coverImage: {
      type: String,
      default: "",
    },
    tmdbMovieIds: {
      type: [Number],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CuratedCollection: Model<ICuratedCollection> =
  mongoose.models.CuratedCollection ||
  mongoose.model<ICuratedCollection>("CuratedCollection", curatedCollectionSchema);
