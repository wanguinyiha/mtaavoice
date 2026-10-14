import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

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
