import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/helpers";

export const getCurrent = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("users"),
      fullName: v.union(v.string(), v.null()),
      email: v.union(v.string(), v.null()),
      role: v.union(
        v.literal("CITIZEN"),
        v.literal("ADMIN"),
        v.literal("FIELD_WORKER"),
      ),
      departmentId: v.union(v.id("departments"), v.null()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (user === null) return null;
    return {
      _id: user._id,
      fullName: user.name ?? null,
      email: user.email ?? null,
      role: user.role ?? "CITIZEN",
      departmentId: user.departmentId ?? null,
      createdAt: user._creationTime,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 2 || name.length > 80) {
        throw new Error("Name must be between 2 and 80 characters");
      }
      await ctx.db.patch(userId, { name });
    }
    if (args.phone !== undefined) {
      const phone = args.phone.trim();
      await ctx.db.patch(userId, { phone: phone.length > 0 ? phone : undefined });
    }
    // Role and department are intentionally not updatable here.
    return null;
  },
});
