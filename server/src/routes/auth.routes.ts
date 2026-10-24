import { Router } from "express";
import bcrypt from "bcrypt";
import { RegisterInputSchema, LoginInputSchema } from "@watchbox/shared";
import { User } from "../models/User.js";
import { validateBody } from "../middleware/validate.js";
import { getDBStatus } from "../db.js";

export const authRouter = Router();

// Middleware to check database connectivity for auth routes
const checkDbConnection = (
  _req: unknown,
  res: { status: (code: number) => { json: (data: unknown) => void } },
  next: () => void
) => {
  if (getDBStatus() !== "connected") {
    res.status(503).json({
      error: "Database unavailable",
      details: "Database is not connected. Please verify MONGODB_URI in server/.env",
    });
    return;
  }
  next();
};

// Register
authRouter.post(
  "/register",
  validateBody(RegisterInputSchema),
  checkDbConnection,
  async (req, res) => {
    try {
      const { email, password, displayName } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: "An account with this email already exists" });
        return;
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = new User({
        email,
        displayName,
        passwordHash,
        role: "user",
      });

      await newUser.save();

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          res.status(500).json({ error: "Session creation failed" });
          return;
        }

        req.session.userId = newUser._id.toString();
        req.session.userRole = newUser.role;

        req.session.save((saveErr) => {
          if (saveErr) {
            res.status(500).json({ error: "Session save failed" });
            return;
          }
          res.status(201).json({ user: newUser.toSafeUser() });
        });
      });
    } catch (err) {
      console.error("[Auth Register Error]:", err);
      res.status(500).json({ error: "Registration failed. Please try again later." });
    }
  }
);

// Login
authRouter.post(
  "/login",
  validateBody(LoginInputSchema),
  checkDbConnection,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      // Regenerate session to prevent session fixation
      req.session.regenerate((err) => {
        if (err) {
          res.status(500).json({ error: "Session initialization failed" });
          return;
        }

        req.session.userId = user._id.toString();
        req.session.userRole = user.role;

        req.session.save((saveErr) => {
          if (saveErr) {
            res.status(500).json({ error: "Session save failed" });
            return;
          }
          res.status(200).json({ user: user.toSafeUser() });
        });
      });
    } catch (err) {
      console.error("[Auth Login Error]:", err);
      res.status(500).json({ error: "Login failed. Please try again later." });
    }
  }
);

// Logout
authRouter.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
        return;
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  } else {
    res.status(200).json({ message: "Logged out successfully" });
  }
});

// Get current session user
authRouter.get("/me", async (req, res) => {
  if (!req.session?.userId) {
    res.status(200).json({ user: null });
    return;
  }

  if (getDBStatus() !== "connected") {
    res.status(200).json({ user: null });
    return;
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      res.status(200).json({ user: null });
      return;
    }
    res.status(200).json({ user: user.toSafeUser() });
  } catch (err) {
    console.error("[Auth Me Error]:", err);
    res.status(500).json({ error: "Failed to retrieve user session" });
  }
});
