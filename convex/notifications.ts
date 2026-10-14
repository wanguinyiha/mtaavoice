import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/helpers";

const notificationValidator = v.object({
  _id: v.id("notifications"),
  issueId: v.union(v.id("issues"), v.null()),
  title: v.string(),
  body: v.string(),
  readAt: v.union(v.number(), v.null()),
  createdAt: v.number(),
});

export const listMine = query({
  args: {},
  returns: v.array(notificationValidator),
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
    return rows.map(({ _id, issueId, title, body, readAt, _creationTime }) => ({
      _id,
      issueId: issueId ?? null,
      title,
      body,
      readAt: readAt ?? null,
      createdAt: _creationTime,
    }));
  },
});

export const unreadCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", userId).eq("readAt", undefined),
      )
      .take(100);
    return rows.length;
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    const notification = await ctx.db.get(args.id);
    if (notification === null) throw new Error("Notification not found");
    if (notification.userId !== userId) {
      throw new Error("Not authorized to update this notification");
    }
    if (notification.readAt === undefined) {
      await ctx.db.patch(args.id, { readAt: Date.now() });
    }
    return null;
  },
});

export const markAllRead = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", userId).eq("readAt", undefined),
      )
      .take(100);
    const now = Date.now();
    for (const notification of unread) {
      await ctx.db.patch(notification._id, { readAt: now });
    }
    return unread.length;
  },
});
