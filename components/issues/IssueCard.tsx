import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Issue } from "@/lib/types";

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Link href={`/reports/${issue._id}`} className="block">
      <Card className="mb-2.5 transition-colors hover:border-brand/40">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 flex-1 text-[15px] font-semibold text-neutral-900">
            {issue.title}
          </h3>
          <StatusBadge status={issue.status} />
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] text-neutral-500">
          {issue.description}
        </p>
        <p className="mt-2 text-[11px] text-neutral-400">
          {new Date(issue.createdAt).toLocaleDateString()}
        </p>
      </Card>
    </Link>
  );
}
