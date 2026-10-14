import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/helpers";

const categoryValidator = v.object({
  _id: v.id("categories"),
  name: v.string(),
  description: v.union(v.string(), v.null()),
  isActive: v.boolean(),
});

export const list = query({
  args: {},
  returns: v.array(categoryValidator),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("categories")
      .withIndex("by_name")
      .take(100);
    return rows
      .filter((row) => row.isActive)
      .map(({ _id, name, description, isActive }) => ({
        _id,
        name,
        description: description ?? null,
        isActive,
      }));
  },
});

export const listAll = query({
  args: {},
  returns: v.array(categoryValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("categories")
      .withIndex("by_name")
      .take(100);
    return rows.map(({ _id, name, description, isActive }) => ({
      _id,
      name,
      description: description ?? null,
      isActive,
    }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.object({ _id: v.id("categories") }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (name.length < 2 || name.length > 60) {
      throw new Error("Category name must be between 2 and 60 characters");
    }
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_name", (q) => q.eq("name", name))
      .take(1);
    if (existing.length > 0) {
      throw new Error("A category with this name already exists");
    }
    const _id = await ctx.db.insert("categories", {
      name,
      description: args.description?.trim() || undefined,
      isActive: true,
    });
    return { _id };
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (existing === null) throw new Error("Category not found");
    const patch: {
      name?: string;
      description?: string | undefined;
      isActive?: boolean;
    } = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 2 || name.length > 60) {
        throw new Error("Category name must be between 2 and 60 characters");
      }
      if (name !== existing.name) {
        const clash = await ctx.db
          .query("categories")
          .withIndex("by_name", (q) => q.eq("name", name))
          .take(1);
        if (clash.length > 0) {
          throw new Error("A category with this name already exists");
        }
      }
      patch.name = name;
    }
    if (args.description !== undefined) {
      patch.description = args.description.trim() || undefined;
    }
    if (args.isActive !== undefined) {
      patch.isActive = args.isActive;
    }
    await ctx.db.patch(args.id, patch);
    return null;
  },
});
