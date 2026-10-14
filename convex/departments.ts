import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireUser } from "./lib/helpers";

const departmentValidator = v.object({
  _id: v.id("departments"),
  name: v.string(),
});

export const list = query({
  args: {},
  returns: v.array(departmentValidator),
  handler: async (ctx) => {
    await requireUser(ctx);
    const rows = await ctx.db
      .query("departments")
      .withIndex("by_name")
      .take(50);
    return rows.map(({ _id, name }) => ({ _id, name }));
  },
});

export const create = mutation({
  args: { name: v.string() },
  returns: v.object({ _id: v.id("departments") }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const name = args.name.trim();
    if (name.length < 2 || name.length > 80) {
      throw new Error("Department name must be between 2 and 80 characters");
    }
    const existing = await ctx.db
      .query("departments")
      .withIndex("by_name", (q) => q.eq("name", name))
      .take(1);
    if (existing.length > 0) {
      throw new Error("A department with this name already exists");
    }
    const _id = await ctx.db.insert("departments", { name });
    return { _id };
  },
});

export const rename = mutation({
  args: { id: v.id("departments"), name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(args.id);
    if (existing === null) throw new Error("Department not found");
    const name = args.name.trim();
    if (name.length < 2 || name.length > 80) {
      throw new Error("Department name must be between 2 and 80 characters");
    }
    if (name !== existing.name) {
      const clash = await ctx.db
        .query("departments")
        .withIndex("by_name", (q) => q.eq("name", name))
        .take(1);
      if (clash.length > 0) {
        throw new Error("A department with this name already exists");
      }
    }
    await ctx.db.patch(args.id, { name });
    return null;
  },
});
