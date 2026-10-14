import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { CATEGORY_SEED } from "../lib/categories";

const DEPARTMENT_SEED = [
  "Roads & Transport",
  "Sanitation & Waste",
  "Water & Sewerage",
  "Electrical & Lighting",
  "Public Works",
  "Environment",
];

/** Idempotent one-time seed: run via `npx convex run seed:seedBaseData`. */
export const seedBaseData = internalMutation({
  args: {},
  returns: v.object({
    categoriesCreated: v.number(),
    departmentsCreated: v.number(),
  }),
  handler: async (ctx) => {
    let categoriesCreated = 0;
    for (const category of CATEGORY_SEED) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_name", (q) => q.eq("name", category.name))
        .take(1);
      if (existing.length === 0) {
        await ctx.db.insert("categories", {
          name: category.name,
          description: category.description,
          isActive: true,
        });
        categoriesCreated += 1;
      }
    }

    let departmentsCreated = 0;
    for (const name of DEPARTMENT_SEED) {
      const existing = await ctx.db
        .query("departments")
        .withIndex("by_name", (q) => q.eq("name", name))
        .take(1);
      if (existing.length === 0) {
        await ctx.db.insert("departments", { name });
        departmentsCreated += 1;
      }
    }

    return { categoriesCreated, departmentsCreated };
  },
});
