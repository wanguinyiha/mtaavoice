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

/** Role-appropriate detail page for an issue (notifications deep-link here). */
export function detailPathForRole(role: UserRole, issueId: string): string {
  switch (role) {
    case "ADMIN":
      return `/admin/reports/${issueId}`;
    case "FIELD_WORKER":
      return `/field-worker/assignments/${issueId}`;
    default:
      return `/reports/${issueId}`;
  }
}
