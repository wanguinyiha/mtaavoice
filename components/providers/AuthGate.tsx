"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/Spinner";
import { homePathForRole } from "@/lib/nav";
import type { UserRole } from "@/lib/status";

/**
 * Client-side route guard. Authorization is still enforced server-side in
 * every Convex function — this only keeps the UI out of the wrong area.
 */
export function AuthGate({
  role,
  children,
}: {
  role?: UserRole;
  children: ReactNode;
}) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.getCurrent);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || me === undefined) return;
    if (!isAuthenticated || me === null) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (role !== undefined && me.role !== role) {
      router.replace(homePathForRole(me.role));
    }
  }, [isLoading, isAuthenticated, me, role, router, pathname]);

  if (isLoading || me === undefined || me === null) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size={28} label="Loading your account" />
      </div>
    );
  }

  if (role !== undefined && me.role !== role) {
    return null;
  }

  return <>{children}</>;
}
