import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StatBox({
  value,
  label,
  className,
}: {
  value: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center rounded-[10px] bg-surface p-3 text-center",
        className,
      )}
    >
      <div className="text-xl font-bold text-neutral-900">{value}</div>
      <div className="mt-1 text-xs text-neutral-500">{label}</div>
    </div>
  );
}
