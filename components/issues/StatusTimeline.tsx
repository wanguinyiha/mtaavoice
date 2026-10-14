import { STATUS_FLOW, STATUS_LABELS, type IssueStatus } from "@/lib/status";
import { cn } from "@/lib/cn";

/**
 * The reference app's vertical ✓/○ tracker. Completed steps are marked with
 * ✓ and bold text (never color alone); pending steps show ○ in gray.
 */
export function StatusTimeline({ status }: { status: IssueStatus }) {
  const reachedIndex =
    status === "REJECTED" || status === "DUPLICATE"
      ? STATUS_FLOW.indexOf("UNDER_REVIEW")
      : STATUS_FLOW.indexOf(status);

  return (
    <ol className="mt-1">
      {STATUS_FLOW.map((step, index) => {
        const done = index <= reachedIndex;
        const current = index === reachedIndex;
        return (
          <li key={step} className="mb-1.5 flex items-center gap-2">
            <span
              aria-hidden="true"
              className={cn(
                "w-6 text-center text-[15px]",
                done ? "text-brand" : "text-neutral-300",
              )}
            >
              {done ? "✓" : "○"}
            </span>
            <span
              className={cn(
                "text-sm",
                done ? "font-semibold text-[#111]" : "text-neutral-400",
              )}
            >
              {STATUS_LABELS[step]}
            </span>
            <span className="sr-only">{done ? "(completed)" : "(pending)"}</span>
            {current ? (
              <span className="ml-1 rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-medium text-neutral-600">
                current
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
