export const ISSUE_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
  "DUPLICATE",
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Accepted",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
  DUPLICATE: "Duplicate",
};

export const STATUS_HEX_COLORS: Record<IssueStatus, string> = {
  SUBMITTED: "#9ca3af",
  UNDER_REVIEW: "#f59e0b",
  ACCEPTED: "#3b82f6",
  ASSIGNED: "#3b82f6",
  IN_PROGRESS: "#8b5cf6",
  RESOLVED: "#16a34a",
  REJECTED: "#dc2626",
  DUPLICATE: "#6b7280",
};

export const STATUS_BADGE_CLASSES: Record<IssueStatus, string> = {
  SUBMITTED: "bg-status-submitted",
  UNDER_REVIEW: "bg-status-review",
  ACCEPTED: "bg-status-accepted",
  ASSIGNED: "bg-status-assigned",
  IN_PROGRESS: "bg-status-progress",
  RESOLVED: "bg-status-resolved",
  REJECTED: "bg-status-rejected",
  DUPLICATE: "bg-status-duplicate",
};

/** Happy-path order used by the citizen-facing status timeline. */
export const STATUS_FLOW: readonly IssueStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
];

export function isIssueStatus(value: unknown): value is IssueStatus {
  return (
    typeof value === "string" &&
    (ISSUE_STATUSES as readonly string[]).includes(value)
  );
}

export function statusLabel(status: IssueStatus): string {
  return STATUS_LABELS[status];
}

export function statusIndexInFlow(status: IssueStatus): number {
  return STATUS_FLOW.indexOf(status);
}

export const ISSUE_PRIORITIES = ["low", "medium", "high"] as const;

export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function isIssuePriority(value: unknown): value is IssuePriority {
  return (
    typeof value === "string" &&
    (ISSUE_PRIORITIES as readonly string[]).includes(value)
  );
}

export const USER_ROLES = ["CITIZEN", "ADMIN", "FIELD_WORKER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  CITIZEN: "Citizen",
  ADMIN: "Administrator",
  FIELD_WORKER: "Field Worker",
};

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === "string" && (USER_ROLES as readonly string[]).includes(value)
  );
}
