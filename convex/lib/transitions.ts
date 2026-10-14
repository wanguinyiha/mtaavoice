import type { StoredIssueStatus, StoredRole } from "./validators";

/**
 * Role-gated status transitions. The only legal ways to move an issue:
 * - ADMIN: review and disposition submitted reports.
 * - FIELD_WORKER: start and finish assigned work.
 */
export const ADMIN_TRANSITIONS: Record<StoredIssueStatus, StoredIssueStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["ACCEPTED", "REJECTED", "DUPLICATE"],
  ACCEPTED: [],
  ASSIGNED: [],
  IN_PROGRESS: [],
  RESOLVED: [],
  REJECTED: [],
  DUPLICATE: [],
};

export const FIELD_WORKER_TRANSITIONS: Record<
  StoredIssueStatus,
  StoredIssueStatus[]
> = {
  SUBMITTED: [],
  UNDER_REVIEW: [],
  ACCEPTED: [],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
  REJECTED: [],
  DUPLICATE: [],
};

export function allowedTransitions(
  role: StoredRole,
  from: StoredIssueStatus,
): StoredIssueStatus[] {
  if (role === "ADMIN") return ADMIN_TRANSITIONS[from] ?? [];
  if (role === "FIELD_WORKER") return FIELD_WORKER_TRANSITIONS[from] ?? [];
  return [];
}

/** Statuses where the citizen-facing tracker shows a stopped/failed journey. */
export const TERMINAL_BAD_STATUSES: StoredIssueStatus[] = ["REJECTED", "DUPLICATE"];
