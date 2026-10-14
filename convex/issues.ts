import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  requireAdmin,
  requireRole,
  requireUser,
  type AuthedUser,
  type Ctx,
} from "./lib/helpers";
import { allowedTransitions } from "./lib/transitions";
import { priorityValidator, statusValidator } from "./lib/validators";

const MAX_IMAGES = 5;

const listItemValidator = v.object({
  _id: v.id("issues"),
  title: v.string(),
  description: v.string(),
  status: statusValidator,
  priority: priorityValidator,
  latitude: v.union(v.number(), v.null()),
  longitude: v.union(v.number(), v.null()),
  address: v.union(v.string(), v.null()),
  duplicateOf: v.union(v.id("issues"), v.null()),
  rejectionReason: v.union(v.string(), v.null()),
  createdAt: v.number(),
  updatedAt: v.union(v.number(), v.null()),
  categoryName: v.union(v.string(), v.null()),
  imageUrls: v.array(v.string()),
});

const updateValidator = v.object({
  _id: v.id("issueUpdates"),
  fromStatus: v.union(statusValidator, v.null()),
  toStatus: statusValidator,
  note: v.union(v.string(), v.null()),
  authorName: v.union(v.string(), v.null()),
  createdAt: v.number(),
});

const detailValidator = v.object({
  _id: v.id("issues"),
  title: v.string(),
  description: v.string(),
  status: statusValidator,
  priority: priorityValidator,
  latitude: v.union(v.number(), v.null()),
  longitude: v.union(v.number(), v.null()),
  address: v.union(v.string(), v.null()),
  duplicateOf: v.union(v.id("issues"), v.null()),
  duplicateOfTitle: v.union(v.string(), v.null()),
  rejectionReason: v.union(v.string(), v.null()),
  resolvedAt: v.union(v.number(), v.null()),
  createdAt: v.number(),
  updatedAt: v.union(v.number(), v.null()),
  categoryName: v.union(v.string(), v.null()),
  imageUrls: v.array(v.string()),
  images: v.array(
    v.object({
      _id: v.id("issueImages"),
      storageId: v.id("_storage"),
      url: v.union(v.string(), v.null()),
    }),
  ),
  updates: v.array(updateValidator),
  activeAssignment: v.union(
    v.null(),
    v.object({
      _id: v.id("assignments"),
      departmentId: v.id("departments"),
      departmentName: v.union(v.string(), v.null()),
      workerId: v.union(v.id("users"), v.null()),
      workerName: v.union(v.string(), v.null()),
      createdAt: v.number(),
    }),
  ),
});

async function enrichListItem(ctx: Ctx, issue: Doc<"issues">) {
  const category = await ctx.db.get(issue.categoryId);
  const images = await ctx.db
    .query("issueImages")
    .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
    .take(MAX_IMAGES);
  const imageUrls: string[] = [];
  for (const image of images) {
    const url = await ctx.storage.getUrl(image.storageId);
    if (url !== null) imageUrls.push(url);
  }
  return {
    _id: issue._id,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    latitude: issue.latitude ?? null,
    longitude: issue.longitude ?? null,
    address: issue.address ?? null,
    duplicateOf: issue.duplicateOf ?? null,
    rejectionReason: issue.rejectionReason ?? null,
    createdAt: issue._creationTime,
    updatedAt: issue.updatedAt ?? null,
    categoryName: category?.name ?? null,
    imageUrls,
  };
}

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    categoryId: v.id("categories"),
    priority: priorityValidator,
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
    imageStorageIds: v.array(v.id("_storage")),
  },
  returns: v.object({ issueId: v.id("issues") }),
  handler: async (ctx, args) => {
    const { userId } = await requireRole(ctx, ["CITIZEN"]);

    const title = args.title.trim();
    if (title.length < 3 || title.length > 120) {
      throw new Error("Title must be between 3 and 120 characters");
    }
    const description = args.description.trim();
    if (description.length < 1 || description.length > 2000) {
      throw new Error("Description must be between 1 and 2000 characters");
    }
    const category = await ctx.db.get(args.categoryId);
    if (category === null || !category.isActive) {
      throw new Error("Selected category is not available");
    }
    if (
      (args.latitude === undefined) !== (args.longitude === undefined)
    ) {
      throw new Error("Provide both latitude and longitude, or neither");
    }
    if (
      args.latitude !== undefined &&
      (args.latitude < -90 || args.latitude > 90)
    ) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (
      args.longitude !== undefined &&
      (args.longitude < -180 || args.longitude > 180)
    ) {
      throw new Error("Longitude must be between -180 and 180");
    }
    const hasAddress = (args.address?.trim().length ?? 0) > 0;
    if (args.latitude === undefined && !hasAddress) {
      throw new Error(
        "Confirm your location: use GPS coordinates or describe the location",
      );
    }
    if (args.imageStorageIds.length > MAX_IMAGES) {
      throw new Error(`You can attach at most ${MAX_IMAGES} photos`);
    }

    const now = Date.now();
    const issueId = await ctx.db.insert("issues", {
      title,
      description,
      categoryId: args.categoryId,
      reporterId: userId,
      status: "SUBMITTED",
      priority: args.priority,
      latitude: args.latitude,
      longitude: args.longitude,
      address: args.address?.trim() || undefined,
      updatedAt: now,
    });

    await ctx.db.insert("issueUpdates", {
      issueId,
      authorId: userId,
      toStatus: "SUBMITTED",
      note: "Report submitted",
    });

    for (const storageId of args.imageStorageIds) {
      await ctx.db.insert("issueImages", {
        issueId,
        storageId,
        uploadedBy: userId,
      });
    }

    await ctx.db.insert("notifications", {
      userId,
      issueId,
      title: "Report submitted",
      body: `Your report "${title}" was submitted and is awaiting review.`,
    });

    return { issueId };
  },
});

export const listMine = query({
  args: {},
  returns: v.array(listItemValidator),
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_reporter", (q) => q.eq("reporterId", userId))
      .order("desc")
      .take(50);
    const result = [];
    for (const issue of issues) {
      result.push(await enrichListItem(ctx, issue));
    }
    return result;
  },
});

export const listAll = query({
  args: { status: v.optional(statusValidator) },
  returns: v.array(listItemValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const base =
      args.status === undefined
        ? ctx.db.query("issues").order("desc")
        : ctx.db
            .query("issues")
            .withIndex("by_status", (q) => q.eq("status", args.status!))
            .order("desc");
    const issues = await base.take(50);
    const result = [];
    for (const issue of issues) {
      result.push(await enrichListItem(ctx, issue));
    }
    return result;
  },
});

export const listAssigned = query({
  args: {},
  returns: v.array(listItemValidator),
  handler: async (ctx) => {
    const authed = await requireRole(ctx, ["FIELD_WORKER", "ADMIN"]);
    if (authed.role !== "FIELD_WORKER") {
      throw new Error("Only field workers have assigned work");
    }
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_worker", (q) => q.eq("assignedWorkerId", authed.userId))
      .take(50);
    const result = [];
    for (const assignment of assignments) {
      if (!assignment.isActive) continue;
      const issue = await ctx.db.get(assignment.issueId);
      if (issue === null) continue;
      result.push(await enrichListItem(ctx, issue));
    }
    return result;
  },
});

export const get = query({
  args: { issueId: v.id("issues") },
  returns: v.union(v.null(), detailValidator),
  handler: async (ctx, args) => {
    const authed = await requireUser(ctx);
    const issue = await ctx.db.get(args.issueId);
    if (issue === null) return null;

    const isStaff = authed.role === "ADMIN" || authed.role === "FIELD_WORKER";
    if (issue.reporterId !== authed.userId && !isStaff) {
      throw new Error("Not authorized to view this issue");
    }
    if (authed.role === "FIELD_WORKER" && issue.reporterId !== authed.userId) {
      await assertFieldWorkerCanAccess(ctx, authed, issue._id);
    }

    return await buildDetail(ctx, issue);
  },
});

export const setStatus = mutation({
  args: {
    issueId: v.id("issues"),
    toStatus: statusValidator,
    note: v.optional(v.string()),
    reason: v.optional(v.string()),
    duplicateOf: v.optional(v.id("issues")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authed = await requireRole(ctx, ["ADMIN", "FIELD_WORKER"]);
    const issue = await ctx.db.get(args.issueId);
    if (issue === null) throw new Error("Issue not found");

    const allowed = allowedTransitions(authed.role, issue.status);
    if (!allowed.includes(args.toStatus)) {
      throw new Error(
        `Cannot move an issue from ${issue.status} to ${args.toStatus}`,
      );
    }

    if (authed.role === "FIELD_WORKER") {
      await assertFieldWorkerCanAccess(ctx, authed, issue._id, true);
    }

    if (args.toStatus === "REJECTED") {
      const reason = args.reason?.trim() ?? "";
      if (reason.length < 3 || reason.length > 500) {
        throw new Error("A rejection reason of 3-500 characters is required");
      }
    }
    if (args.toStatus === "DUPLICATE") {
      if (args.duplicateOf === undefined) {
        throw new Error("Select the original issue this one duplicates");
      }
      if (args.duplicateOf === issue._id) {
        throw new Error("An issue cannot be a duplicate of itself");
      }
      const original = await ctx.db.get(args.duplicateOf);
      if (original === null) throw new Error("Original issue not found");
    }

    const now = Date.now();
    await ctx.db.patch(issue._id, {
      status: args.toStatus,
      updatedAt: now,
      ...(args.toStatus === "REJECTED"
        ? { rejectionReason: args.reason?.trim() }
        : {}),
      ...(args.toStatus === "DUPLICATE" ? { duplicateOf: args.duplicateOf } : {}),
      ...(args.toStatus === "RESOLVED" ? { resolvedAt: now } : {}),
    });

    await ctx.db.insert("issueUpdates", {
      issueId: issue._id,
      authorId: authed.userId,
      fromStatus: issue.status,
      toStatus: args.toStatus,
      note: args.note?.trim() || undefined,
    });

    const label = args.toStatus.replace(/_/g, " ");
    await ctx.db.insert("notifications", {
      userId: issue.reporterId,
      issueId: issue._id,
      title: `Report ${label}`,
      body:
        args.toStatus === "REJECTED"
          ? `Your report "${issue.title}" was rejected: ${args.reason?.trim()}`
          : `Your reported issue "${issue.title}" is now ${label}.`,
    });

    return null;
  },
});

export const assign = mutation({
  args: {
    issueId: v.id("issues"),
    departmentId: v.id("departments"),
    workerId: v.optional(v.id("users")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authed = await requireAdmin(ctx);
    const issue = await ctx.db.get(args.issueId);
    if (issue === null) throw new Error("Issue not found");
    if (!["ACCEPTED", "ASSIGNED", "IN_PROGRESS"].includes(issue.status)) {
      throw new Error(
        "Only accepted (or already assigned) issues can be assigned",
      );
    }
    const department = await ctx.db.get(args.departmentId);
    if (department === null) throw new Error("Department not found");

    let worker: Doc<"users"> | null = null;
    if (args.workerId !== undefined) {
      worker = await ctx.db.get(args.workerId);
      if (worker === null) throw new Error("Field worker not found");
      if ((worker.role ?? "CITIZEN") !== "FIELD_WORKER") {
        throw new Error("The selected user is not a field worker");
      }
      if (
        worker.departmentId !== undefined &&
        worker.departmentId !== args.departmentId
      ) {
        throw new Error(
          "That field worker belongs to a different department",
        );
      }
      if (worker.departmentId === undefined) {
        await ctx.db.patch(worker._id, { departmentId: args.departmentId });
      }
    }

    const existing = await ctx.db
      .query("assignments")
      .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
      .take(10);
    for (const assignment of existing) {
      if (assignment.isActive) {
        await ctx.db.patch(assignment._id, { isActive: false });
      }
    }

    await ctx.db.insert("assignments", {
      issueId: issue._id,
      departmentId: args.departmentId,
      assignedWorkerId: args.workerId,
      assignedById: authed.userId,
      isActive: true,
    });

    const now = Date.now();
    if (issue.status === "ACCEPTED") {
      await ctx.db.patch(issue._id, { status: "ASSIGNED", updatedAt: now });
    } else {
      await ctx.db.patch(issue._id, { updatedAt: now });
    }

    const workerLabel = worker?.name ? ` and ${worker.name}` : "";
    await ctx.db.insert("issueUpdates", {
      issueId: issue._id,
      authorId: authed.userId,
      fromStatus: issue.status,
      toStatus: "ASSIGNED",
      note: `Assigned to ${department.name}${workerLabel}`,
    });

    await ctx.db.insert("notifications", {
      userId: issue.reporterId,
      issueId: issue._id,
      title: "Report assigned",
      body: `Your reported issue "${issue.title}" was assigned to ${department.name}.`,
    });

    if (worker !== null) {
      await ctx.db.insert("notifications", {
        userId: worker._id,
        issueId: issue._id,
        title: "New assignment",
        body: `You have been assigned: ${issue.title}`,
      });
    }

    return null;
  },
});

async function assertFieldWorkerCanAccess(
  ctx: Ctx,
  authed: AuthedUser,
  issueId: Id<"issues">,
  requirePersonalAssignment = false,
): Promise<void> {
  const assignments = await ctx.db
    .query("assignments")
    .withIndex("by_issue", (q) => q.eq("issueId", issueId))
    .take(10);
  const active = assignments.filter((a) => a.isActive);
  const personal = active.some((a) => a.assignedWorkerId === authed.userId);
  if (requirePersonalAssignment) {
    if (!personal) {
      throw new Error("You are not assigned to this issue");
    }
    return;
  }
  const departmental =
    authed.user.departmentId !== undefined &&
    active.some((a) => a.departmentId === authed.user.departmentId);
  if (!personal && !departmental) {
    throw new Error("Not authorized to view this issue");
  }
}

async function buildDetail(ctx: QueryCtx, issue: Doc<"issues">) {
  const category = await ctx.db.get(issue.categoryId);
  const images = await ctx.db
    .query("issueImages")
    .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
    .take(10);
  const imageList = [];
  const imageUrls: string[] = [];
  for (const image of images) {
    const url = await ctx.storage.getUrl(image.storageId);
    imageList.push({ _id: image._id, storageId: image.storageId, url });
    if (url !== null) imageUrls.push(url);
  }

  const updateRows = await ctx.db
    .query("issueUpdates")
    .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
    .order("asc")
    .take(100);
  const updates = [];
  for (const row of updateRows) {
    const author = await ctx.db.get(row.authorId);
    updates.push({
      _id: row._id,
      fromStatus: row.fromStatus ?? null,
      toStatus: row.toStatus,
      note: row.note ?? null,
      authorName: author?.name ?? null,
      createdAt: row._creationTime,
    });
  }

  const duplicateOfTitle =
    issue.duplicateOf !== undefined
      ? ((await ctx.db.get(issue.duplicateOf))?.title ?? null)
      : null;

  const assignmentRows = await ctx.db
    .query("assignments")
    .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
    .take(10);
  const activeAssignmentRow = assignmentRows.find((a) => a.isActive);
  let activeAssignment = null;
  if (activeAssignmentRow !== undefined) {
    const department = await ctx.db.get(activeAssignmentRow.departmentId);
    const worker =
      activeAssignmentRow.assignedWorkerId !== undefined
        ? await ctx.db.get(activeAssignmentRow.assignedWorkerId)
        : null;
    activeAssignment = {
      _id: activeAssignmentRow._id,
      departmentId: activeAssignmentRow.departmentId,
      departmentName: department?.name ?? null,
      workerId: activeAssignmentRow.assignedWorkerId ?? null,
      workerName: worker?.name ?? null,
      createdAt: activeAssignmentRow._creationTime,
    };
  }

  return {
    _id: issue._id,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    priority: issue.priority,
    latitude: issue.latitude ?? null,
    longitude: issue.longitude ?? null,
    address: issue.address ?? null,
    duplicateOf: issue.duplicateOf ?? null,
    duplicateOfTitle,
    rejectionReason: issue.rejectionReason ?? null,
    resolvedAt: issue.resolvedAt ?? null,
    createdAt: issue._creationTime,
    updatedAt: issue.updatedAt ?? null,
    categoryName: category?.name ?? null,
    imageUrls,
    images: imageList,
    updates,
    activeAssignment,
  };
}
