import type { UserRole } from "./status";

/** Where each role lands after login (and when guarding routes). */
export function homePathForRole(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "FIELD_WORKER":
      return "/field-worker";
    default:
      return "/dashboard";
  }
}
