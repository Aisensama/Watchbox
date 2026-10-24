import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB, disconnectDB } from "../db.js";
import { User } from "../models/User.js";
import { CuratedCollection } from "../models/CuratedCollection.js";

dotenv.config();

const seed = async () => {
  console.log("[WatchBox Seed] Starting admin and curated collection bootstrap...");

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    console.error(
      "[WatchBox Seed] Error: ADMIN_EMAIL and ADMIN_PASSWORD must be defined in server/.env to run the bootstrap."
    );
    process.exit(1);
  }

  const conn = await connectDB();
  if (!conn) {
    console.error(
      "[WatchBox Seed] Error: Could not connect to MongoDB. Verify MONGODB_URI."
    );
    process.exit(1);
  }

  try {
    // 1. Seed or Promote Admin User
    let admin = await User.findOne({ email: adminEmail });
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    if (admin) {
      admin.role = "admin";
      admin.passwordHash = passwordHash;
      await admin.save();
      console.log(
        `[WatchBox Seed] Existing user '${adminEmail}' successfully updated with admin role.`
      );
    } else {
      admin = new User({
        email: adminEmail,
        displayName: "WatchBox Administrator",
        passwordHash,
        role: "admin",
        bio: "Lead curator and platform administrator.",
        favoriteGenres: [878, 28, 53],
      });
      await admin.save();
      console.log(
        `[WatchBox Seed] New administrator account created for '${adminEmail}'.`
      );
    }

    // 2. Seed Starter Curated Collections if none exist
    const collectionCount = await CuratedCollection.countDocuments();
    if (collectionCount === 0) {
      console.log("[WatchBox Seed] Seeding starter curated collections...");
      const starterCollections = [
        {
          title: "Mind-Bending Sci-Fi & Cosmic Horizons",
          slug: "mind-bending-sci-fi",
          description:
            "Journey through wormholes, dystopian futures, and metaphysical realities with these cinema-defining sci-fi journeys.",
          coverImage: "https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
          tmdbMovieIds: [157336, 693134, 335984, 264660, 329865, 603],
          isFeatured: true,
          isPublished: true,
        },
        {
          title: "Top Rated Modern Masterpieces",
          slug: "top-rated-masterpieces",
          description:
            "Award-winning cinematic tours-de-force with legendary performances and visionary directing.",
          coverImage: "https://image.tmdb.org/t/p/w1280/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
          tmdbMovieIds: [872585, 278, 238, 155, 496243, 680],
          isFeatured: true,
          isPublished: true,
        },
        {
          title: "High-Octane Action & Thrills",
          slug: "action-thrills-hub",
          description:
            "Relentless adrenaline, choreographed stunts, and tense edge-of-your-seat confrontations.",
          coverImage: "https://image.tmdb.org/t/p/w1280/yDHYTfaA9g6c4h2n099m6Wc3jHn.jpg",
          tmdbMovieIds: [533535, 786892, 414906, 76341, 603692],
          isFeatured: true,
          isPublished: true,
        },
      ];

      await CuratedCollection.insertMany(starterCollections);
      console.log(
        `[WatchBox Seed] Seeded ${starterCollections.length} starter curated collections.`
      );
    } else {
      console.log(
        `[WatchBox Seed] Curated collections already exist (${collectionCount} found).`
      );
    }

    console.log("[WatchBox Seed] Bootstrap completed successfully.");
  } catch (err) {
    console.error("[WatchBox Seed] Error during seed:", err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seed();
