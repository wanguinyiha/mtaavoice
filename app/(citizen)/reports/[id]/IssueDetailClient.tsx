"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { IssueDetailView } from "@/components/issues/IssueDetailView";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

export function IssueDetailClient() {
  const params = useParams<{ id: string }>();
  const issueId = params.id as Id<"issues">;
  const issue = useQuery(api.issues.get, { issueId });

  if (issue === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading report" />
      </div>
    );
  }

  if (issue === null) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <EmptyState
          title="Report not found"
          message="This report doesn't exist, or you don't have permission to view it."
          action={
            <Link
              href="/reports"
              className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Back to My Reports
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <IssueDetailView
      issue={issue}
      backHref="/reports"
      backLabel="← Back to My Reports"
    />
  );
}
