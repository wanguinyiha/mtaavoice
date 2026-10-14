import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/helpers";

/**
 * One-time admin bootstrap / role management.
 * Run from the Convex dashboard or CLI, e.g.:
 *   npx convex run admin:setUserRole '{"email":"you@example.com","role":"ADMIN"}'
 * Users can never change their own role through the app.
 */
export const setUserRole = internalMutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal("CITIZEN"),
      v.literal("ADMIN"),
      v.literal("FIELD_WORKER"),
    ),
    departmentId: v.optional(v.id("departments")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .take(1);
    if (users.length === 0) {
      throw new Error("No user with that email — sign up in the app first");
    }
    await ctx.db.patch(users[0]._id, {
      role: args.role,
      ...(args.departmentId !== undefined
        ? { departmentId: args.departmentId }
        : {}),
    });
    return null;
  },
});

export const stats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    byStatus: v.object({
      SUBMITTED: v.number(),
      UNDER_REVIEW: v.number(),
      ACCEPTED: v.number(),
      ASSIGNED: v.number(),
      IN_PROGRESS: v.number(),
      RESOLVED: v.number(),
      REJECTED: v.number(),
      DUPLICATE: v.number(),
    }),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query("issues").take(500);
    const byStatus = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      ACCEPTED: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
      DUPLICATE: 0,
    };
    for (const row of rows) {
      byStatus[row.status] += 1;
    }
    return { total: rows.length, byStatus };
  },
});

