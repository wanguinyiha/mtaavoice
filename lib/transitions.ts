import type { IssueStatus } from "./status";

/**
 * Client mirror of convex/lib/transitions.ts so action buttons can be
 * rendered for exactly the transitions the server will accept.
 */
export const ADMIN_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["ACCEPTED", "REJECTED", "DUPLICATE"],
  ACCEPTED: [],
  ASSIGNED: [],
  IN_PROGRESS: [],
  RESOLVED: [],
  REJECTED: [],
  DUPLICATE: [],
};

export function adminTransitions(from: IssueStatus): IssueStatus[] {
  return ADMIN_TRANSITIONS[from] ?? [];
}
