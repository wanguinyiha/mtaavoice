import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  message,
  action,
  className,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[10px] border border-line bg-white px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-sm font-semibold text-neutral-800">{title}</p>
      {message ? (
        <p className="mt-1 max-w-sm text-sm text-neutral-500">{message}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
