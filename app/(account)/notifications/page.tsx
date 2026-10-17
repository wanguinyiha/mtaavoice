"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { detailPathForRole } from "@/lib/nav";

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function NotificationsPage() {
  const router = useRouter();
  const me = useQuery(api.users.getCurrent);
  const notifications = useQuery(api.notifications.listMine);
  const unread = useQuery(api.notifications.unreadCount);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  if (notifications === undefined || me === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading notifications" />
      </div>
    );
  }

  async function onOpen(id: Id<"notifications">, issueId: string | null) {
    try {
      await markRead({ id });
    } catch {
      // Already read — navigation still proceeds.
    }
    if (issueId !== null && me !== null && me !== undefined) {
      router.push(detailPathForRole(me.role, issueId));
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Notifications</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {(unread ?? 0) > 0
              ? `${unread} unread update${unread === 1 ? "" : "s"}`
              : "You're all caught up."}
          </p>
        </div>
        {(unread ?? 0) > 0 ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              void markAllRead();
            }}
          >
            Mark all read
          </Button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No notifications yet"
          message="Status changes, assignments and evidence updates on your reports will show up here."
          action={
            <Button onClick={() => router.push("/dashboard")}>
              Go to dashboard
            </Button>
          }
        />
      ) : (
        <div className="mt-5 overflow-hidden rounded-[10px] border border-line">
          {notifications.map((notification, index) => {
            const isUnread = notification.readAt === null;
            return (
              <button
                key={notification._id}
                type="button"
                onClick={() => {
                  void onOpen(notification._id, notification.issueId);
                }}
                className={cn(
                  "block w-full border-b border-line px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-surface",
                  isUnread ? "bg-brand/5" : "bg-white",
                  index === 0 && "rounded-t-[9px]",
                  index === notifications.length - 1 && "rounded-b-[9px]",
                )}
              >
                <span className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      isUnread ? "bg-brand" : "bg-transparent",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          "text-sm text-neutral-900",
                          isUnread && "font-semibold",
                        )}
                      >
                        {notification.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-neutral-400">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[13px] text-neutral-600">
                      {notification.body}
                    </span>
                    {isUnread ? (
                      <span className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-wide text-brand">
                        New
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
