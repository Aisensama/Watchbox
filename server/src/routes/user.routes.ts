import { Router } from "express";
import { UserProfileUpdateSchema } from "@watchbox/shared";
import { User } from "../models/User.js";
import { Watchlist } from "../models/Watchlist.js";
import { Rating } from "../models/Rating.js";
import { WatchHistory } from "../models/WatchHistory.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { getDBStatus } from "../db.js";

export const userRouter = Router();

// Get profile and stats for the authenticated user
userRouter.get("/profile", requireAuth, async (req, res) => {
  if (getDBStatus() !== "connected") {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }

  try {
    const userId = req.session.userId!;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }

    const [watchlistCount, ratingsCount, historyCount, ratings] = await Promise.all([
      Watchlist.countDocuments({ user: userId }),
      Rating.countDocuments({ user: userId }),
      WatchHistory.countDocuments({ user: userId }),
      Rating.find({ user: userId }).select("score").lean(),
    ]);

    const averageRating =
      ratings.length > 0
        ? Number(
            (ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length).toFixed(1)
          )
        : 0;

    res.status(200).json({
      user: user.toSafeUser(),
      stats: {
        watchlistCount,
        ratingsCount,
        historyCount,
        averageRating,
      },
    });
  } catch (err) {
    console.error("[User Profile Error]:", err);
    res.status(500).json({ error: "Failed to retrieve user profile" });
  }
});

// Update profile
userRouter.patch(
  "/profile",
  requireAuth,
  validateBody(UserProfileUpdateSchema),
  async (req, res) => {
    if (getDBStatus() !== "connected") {
      res.status(503).json({ error: "Database unavailable" });
      return;
    }

    try {
      const userId = req.session.userId!;
      const { displayName, bio, avatar, favoriteGenres } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (displayName !== undefined) user.displayName = displayName;
      if (bio !== undefined) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;
      if (favoriteGenres !== undefined) user.favoriteGenres = favoriteGenres;

      await user.save();
      res.status(200).json({ user: user.toSafeUser() });
    } catch (err) {
      console.error("[User Profile Update Error]:", err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);
