import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("CITIZEN"),
  v.literal("ADMIN"),
  v.literal("FIELD_WORKER"),
);

export const statusValidator = v.union(
  v.literal("SUBMITTED"),
  v.literal("UNDER_REVIEW"),
  v.literal("ACCEPTED"),
  v.literal("ASSIGNED"),
  v.literal("IN_PROGRESS"),
  v.literal("RESOLVED"),
  v.literal("REJECTED"),
  v.literal("DUPLICATE"),
);

export const priorityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

export const issueStatusValues = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "ACCEPTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
  "DUPLICATE",
] as const;

export type StoredIssueStatus = (typeof issueStatusValues)[number];

export const roleValues = ["CITIZEN", "ADMIN", "FIELD_WORKER"] as const;

export type StoredRole = (typeof roleValues)[number];
