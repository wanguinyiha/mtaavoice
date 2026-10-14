"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { IssueActions } from "@/components/admin/IssueActions";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Issue } from "@/lib/types";

function QueueRow({ issue }: { issue: Issue }) {
  return (
    <Card className="mb-3">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/admin/reports/${issue._id}`}
          className="min-w-0 flex-1 hover:underline"
        >
          <h3 className="line-clamp-2 text-[15px] font-semibold text-neutral-900">
            {issue.title}
          </h3>
        </Link>
        <StatusBadge status={issue.status} />
      </div>
      <p className="mt-1.5 line-clamp-2 text-[13px] text-neutral-500">
        {issue.description}
      </p>
      <p className="mt-2 text-[11px] text-neutral-400">
        {new Date(issue.createdAt).toLocaleDateString()}
        {issue.categoryName ? ` · ${issue.categoryName}` : ""}
        {issue.imageUrls.length > 0
          ? ` · ${issue.imageUrls.length} photo${issue.imageUrls.length === 1 ? "" : "s"}`
          : ""}
      </p>
      <div className="mt-3 border-t border-line pt-3">
        <IssueActions
          issueId={issue._id as Id<"issues">}
          status={issue.status}
          title={issue.title}
        />
      </div>
    </Card>
  );
}

export default function ReviewQueuePage() {
  const submitted = useQuery(api.issues.listAll, { status: "SUBMITTED" });
  const underReview = useQuery(api.issues.listAll, { status: "UNDER_REVIEW" });

  if (submitted === undefined || underReview === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading review queue" />
      </div>
    );
  }

  const queue = [...underReview, ...submitted].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold text-neutral-900">Review Queue</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {queue.length === 0
          ? "Every submitted report has been reviewed."
          : `${queue.length} report${queue.length === 1 ? "" : "s"} waiting for a decision.`}
      </p>

      {queue.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Queue is clear"
          message="New citizen reports land here as soon as they are submitted."
          action={
            <Link
              href="/admin/reports"
              className="inline-flex items-center rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-surface"
            >
              Browse all reports
            </Link>
          }
        />
      ) : (
        <div className="mt-5">
          {queue.map((issue) => (
            <QueueRow key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
