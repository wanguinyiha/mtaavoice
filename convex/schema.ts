import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  roleValidator,
  statusValidator,
  priorityValidator,
} from "./lib/validators";

export default defineSchema({
  ...authTables,

  // Extended auth user table — also serves as the app profile.
  // Fields inlined (per Convex Auth docs) so they can be extended.
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(roleValidator),
    departmentId: v.optional(v.id("departments")),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
  }).index("by_name", ["name"]),

  departments: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  issues: defineTable({
    title: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    reporterId: v.id("users"),
    status: statusValidator,
    priority: priorityValidator,
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
    duplicateOf: v.optional(v.id("issues")),
    rejectionReason: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_reporter", ["reporterId"])
    .index("by_status", ["status"])
    .index("by_category", ["categoryId"]),

  issueImages: defineTable({
    issueId: v.id("issues"),
    storageId: v.id("_storage"),
    uploadedBy: v.id("users"),
    isEvidence: v.optional(v.boolean()),
  }).index("by_issue", ["issueId"]),

  issueUpdates: defineTable({
    issueId: v.id("issues"),
    authorId: v.id("users"),
    fromStatus: v.optional(statusValidator),
    toStatus: statusValidator,
    note: v.optional(v.string()),
  }).index("by_issue", ["issueId"]),

  assignments: defineTable({
    issueId: v.id("issues"),
    departmentId: v.id("departments"),
    assignedWorkerId: v.optional(v.id("users")),
    assignedById: v.id("users"),
    isActive: v.boolean(),
  })
    .index("by_issue", ["issueId"])
    .index("by_department", ["departmentId"])
    .index("by_worker", ["assignedWorkerId"]),

  comments: defineTable({
    issueId: v.id("issues"),
    authorId: v.id("users"),
    body: v.string(),
  }).index("by_issue", ["issueId"]),

  notifications: defineTable({
    userId: v.id("users"),
    issueId: v.optional(v.id("issues")),
    title: v.string(),
    body: v.string(),
    readAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "readAt"]),
});
