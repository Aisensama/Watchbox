import type { UserRole } from "@watchbox/shared";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    userRole?: UserRole;
  }
}
