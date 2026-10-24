import type { Request, Response, NextFunction } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.session.userRole !== "admin") {
    res.status(403).json({ error: "Admin authorization required" });
    return;
  }

  next();
};
