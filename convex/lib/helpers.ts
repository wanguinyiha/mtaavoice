import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { StoredRole } from "./validators";

export type Ctx = QueryCtx | MutationCtx;

export type AuthedUser = {
  userId: Id<"users">;
  user: Doc<"users">;
  role: StoredRole;
};

/** Resolve the authenticated user or throw. Never trust client-supplied identity. */
export async function requireUser(ctx: Ctx): Promise<AuthedUser> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  const user = await ctx.db.get(userId);
  if (user === null) {
    throw new Error("User profile not found");
  }
  const role: StoredRole = user.role ?? "CITIZEN";
  return { userId, user, role };
}

/** Resolve the authenticated user and assert one of the given roles. */
export async function requireRole(
  ctx: Ctx,
  roles: readonly StoredRole[],
): Promise<AuthedUser> {
  const authed = await requireUser(ctx);
  if (!roles.includes(authed.role)) {
    throw new Error("Not authorized for this action");
  }
  return authed;
}

export async function requireAdmin(ctx: Ctx): Promise<AuthedUser> {
  return requireRole(ctx, ["ADMIN"]);
}

export const ADMIN_ONLY: readonly StoredRole[] = ["ADMIN"];
export const STAFF_ROLES: readonly StoredRole[] = ["ADMIN", "FIELD_WORKER"];
