"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/cn";
import { detailPathForRole } from "@/lib/nav";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const me = useQuery(api.users.getCurrent);
  const unread = useQuery(api.notifications.unreadCount);
  const notifications = useQuery(api.notifications.listMine);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (
        containerRef.current !== null &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function onOpenNotification(id: Id<"notifications">, issueId: string | null) {
    setOpen(false);
    if (me === null || me === undefined) return;
    try {
      await markRead({ id });
    } catch {
      // Notification may already be read — navigation still proceeds.
    }
    if (issueId !== null) {
      router.push(detailPathForRole(me.role, issueId));
    } else {
      router.push("/notifications");
    }
  }

  const recent = (notifications ?? []).slice(0, 6);
  const count = unread ?? 0;
  const hasUnread = count > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={
          hasUnread
            ? `Notifications, ${count} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
          open
            ? "border-brand/40 bg-brand/5 text-brand"
            : "border-line-strong text-neutral-600 hover:border-brand/40 hover:text-brand",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 3.926-.62 1.983 1.983 0 0 1 1.664-2.213c.424-.166.848-.327 1.272-.486m-6.385-3.528a1.983 1.983 0 0 1-1.664-2.213 23.85 23.85 0 0 0-3.926.62 1.983 1.983 0 0 0-1.453 1.826c-.135.63-.064 1.28.166 1.879a24.13 24.13 0 0 0 2.01 4.165m5.675-3.845a1.983 1.983 0 0 0-1.664-2.213 23.85 23.85 0 0 0-3.926.62m5.934-.064a19.87 19.87 0 0 1-5.934.064"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6" />
        </svg>
        {hasUnread ? (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold leading-none text-white"
            aria-hidden="true"
          >
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-[10px] border border-line bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-bold text-neutral-900">Notifications</p>
            {count > 0 ? (
              <button
                type="button"
                onClick={() => {
                  void markAllRead();
                }}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">
                Nothing yet — status updates on your reports land here.
              </p>
            ) : (
              recent.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => {
                    void onOpenNotification(
                      notification._id,
                      notification.issueId,
                    );
                  }}
                  className={cn(
                    "block w-full border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface",
                    notification.readAt === null && "bg-brand/5",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {notification.readAt === null ? (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-brand"
                        aria-label="Unread"
                      />
                    ) : null}
                    <span
                      className={cn(
                        "line-clamp-1 text-sm text-neutral-900",
                        notification.readAt === null && "font-semibold",
                      )}
                    >
                      {notification.title}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-neutral-500">
                    {notification.body}
                  </span>
                  <span className="mt-1 block text-[11px] text-neutral-400">
                    {timeAgo(notification.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-line px-4 py-2.5 text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/notifications");
              }}
              className="text-xs font-semibold text-brand hover:underline"
            >
              View all notifications
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
