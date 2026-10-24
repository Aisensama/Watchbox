import type { Document, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { SafeUser, UserRole } from "@watchbox/shared";

export interface IUser extends Document {
  email: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  favoriteGenres: number[];
  createdAt: Date;
  updatedAt: Date;
  toSafeUser(): SafeUser;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
    favoriteGenres: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toSafeUser = function (): SafeUser {
  return {
    id: this._id.toString(),
    email: this.email,
    displayName: this.displayName,
    role: this.role as UserRole,
    avatar: this.avatar || undefined,
    bio: this.bio || undefined,
    favoriteGenres: this.favoriteGenres || [],
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
