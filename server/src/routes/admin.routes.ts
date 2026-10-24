import { Router } from "express";
import { User } from "../models/User.js";
import { CuratedCollection } from "../models/CuratedCollection.js";
import { requireAdmin } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  CreateCollectionInputSchema,
  UpdateCollectionInputSchema,
  UserRoleSchema,
} from "@watchbox/shared";
import { getDBStatus } from "../db.js";

export const adminRouter = Router();

// Protect all admin endpoints
adminRouter.use(requireAdmin, (_req, res, next) => {
  if (getDBStatus() !== "connected") {
    res.status(503).json({ error: "Database unavailable" });
    return;
  }
  next();
});

// List all users with safe fields
adminRouter.get("/users", async (_req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("-passwordHash")
      .lean();
    const safeUsers = users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      avatar: u.avatar || undefined,
      bio: u.bio || undefined,
      favoriteGenres: u.favoriteGenres || [],
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    res.status(200).json({ users: safeUsers });
  } catch (err) {
    console.error("[Admin Users Error]:", err);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
});

// Update user role with last-admin protection
adminRouter.patch("/users/:userId/role", async (req, res) => {
  const { userId } = req.params;
  const parsedRole = UserRoleSchema.safeParse(req.body.role);

  if (!parsedRole.success) {
    res.status(400).json({ error: "Invalid role. Role must be 'user' or 'admin'." });
    return;
  }

  const newRole = parsedRole.data;

  try {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Protection: prevent demoting the last admin
    if (targetUser.role === "admin" && newRole !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        res.status(400).json({
          error:
            "Action rejected: Cannot demote the last remaining administrator account.",
        });
        return;
      }
    }

    targetUser.role = newRole;
    await targetUser.save();

    res.status(200).json({
      message: `User role updated to ${newRole}`,
      user: targetUser.toSafeUser(),
    });
  } catch (err) {
    console.error("[Admin Update Role Error]:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

// Create curated collection
adminRouter.post(
  "/collections",
  validateBody(CreateCollectionInputSchema),
  async (req, res) => {
    try {
      const {
        title,
        slug,
        description,
        coverImage,
        tmdbMovieIds,
        isFeatured,
        isPublished,
      } = req.body;

      const existing = await CuratedCollection.findOne({ slug: slug.toLowerCase() });
      if (existing) {
        res.status(400).json({ error: "A collection with this slug already exists" });
        return;
      }

      const collection = new CuratedCollection({
        title,
        slug: slug.toLowerCase(),
        description,
        coverImage: coverImage || "",
        tmdbMovieIds: tmdbMovieIds || [],
        isFeatured: Boolean(isFeatured),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      });

      await collection.save();

      res.status(201).json({
        message: "Collection created successfully",
        collection: {
          id: collection._id.toString(),
          title: collection.title,
          slug: collection.slug,
          description: collection.description,
          coverImage: collection.coverImage,
          tmdbMovieIds: collection.tmdbMovieIds,
          isFeatured: collection.isFeatured,
          isPublished: collection.isPublished,
          createdAt: collection.createdAt.toISOString(),
          updatedAt: collection.updatedAt.toISOString(),
        },
      });
    } catch (err) {
      console.error("[Admin Create Collection Error]:", err);
      res.status(500).json({ error: "Failed to create collection" });
    }
  }
);

// Update curated collection
adminRouter.put(
  "/collections/:id",
  validateBody(UpdateCollectionInputSchema),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.slug) {
        const existing = await CuratedCollection.findOne({
          slug: updates.slug.toLowerCase(),
          _id: { $ne: id },
        });
        if (existing) {
          res
            .status(400)
            .json({ error: "Another collection is already using this slug" });
          return;
        }
        updates.slug = updates.slug.toLowerCase();
      }

      const collection = await CuratedCollection.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!collection) {
        res.status(404).json({ error: "Collection not found" });
        return;
      }

      res.status(200).json({
        message: "Collection updated successfully",
        collection: {
          id: collection._id.toString(),
          title: collection.title,
          slug: collection.slug,
          description: collection.description,
          coverImage: collection.coverImage,
          tmdbMovieIds: collection.tmdbMovieIds,
          isFeatured: collection.isFeatured,
          isPublished: collection.isPublished,
          createdAt: collection.createdAt.toISOString(),
          updatedAt: collection.updatedAt.toISOString(),
        },
      });
    } catch (err) {
      console.error("[Admin Update Collection Error]:", err);
      res.status(500).json({ error: "Failed to update collection" });
    }
  }
);

// Delete curated collection
adminRouter.delete("/collections/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CuratedCollection.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ error: "Collection not found" });
      return;
    }

    res.status(200).json({ message: "Collection deleted successfully", id });
  } catch (err) {
    console.error("[Admin Delete Collection Error]:", err);
    res.status(500).json({ error: "Failed to delete collection" });
  }
});
