import { cn } from "@/lib/cn";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  type IssueStatus,
} from "@/lib/status";

export function StatusBadge({
  status,
  className,
}: {
  status: IssueStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-semibold text-white",
        STATUS_BADGE_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
