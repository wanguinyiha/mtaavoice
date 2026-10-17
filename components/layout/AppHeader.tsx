"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/cn";
import { homePathForRole } from "@/lib/nav";
import { NotificationsBell } from "./NotificationsBell";

type NavItem = { href: string; label: string };

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  CITIZEN: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/report", label: "Report" },
    { href: "/reports", label: "My Reports" },
    { href: "/map", label: "Map" },
    { href: "/profile", label: "Profile" },
  ],
  ADMIN: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/queue", label: "Review Queue" },
    { href: "/admin/reports", label: "All Reports" },
    { href: "/admin/departments", label: "Departments" },
    { href: "/profile", label: "Profile" },
  ],
  FIELD_WORKER: [
    { href: "/field-worker", label: "Dashboard" },
    { href: "/field-worker/assignments", label: "My Assignments" },
    { href: "/profile", label: "Profile" },
  ],
};

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.users.getCurrent);

  const role =
    !isLoading && isAuthenticated && me !== null && me !== undefined
      ? me.role
      : null;
  const items = role !== null ? (NAV_BY_ROLE[role] ?? []) : [];
  const home = role !== null ? homePathForRole(role) : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href={home} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
            </svg>
          </span>
          <span className="text-lg font-bold text-neutral-900">MtaaVoice</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-5 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === item.href
                  ? "text-brand"
                  : "text-neutral-600 hover:text-brand",
              )}
            >
              {item.label}
            </Link>
          ))}
          {role === "CITIZEN" ? (
            <Link
              href="/report"
              className="inline-flex items-center rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              + Report an Issue
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationsBell />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="app-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong text-neutral-700 md:hidden"
          >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
          </button>
        </div>
      </div>

      <div
        id="app-mobile-nav"
        className={cn(
          "border-t border-line bg-white md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          aria-label="Mobile"
          className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-3 sm:px-6"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface",
                pathname === item.href
                  ? "bg-surface text-brand"
                  : "text-neutral-700",
              )}
            >
              {item.label}
            </Link>
          ))}
          {role === "CITIZEN" ? (
            <Link
              href="/report"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-brand px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-strong"
            >
              + Report an Issue
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
