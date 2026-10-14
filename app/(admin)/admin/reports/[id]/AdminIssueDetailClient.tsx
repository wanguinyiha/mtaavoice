"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { IssueActions } from "@/components/admin/IssueActions";
import { IssueDetailView } from "@/components/issues/IssueDetailView";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

export function AdminIssueDetailClient() {
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
          message="This report doesn't exist, or it has been removed."
          action={
            <Link
              href="/admin/reports"
              className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Back to All Reports
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <IssueDetailView
      issue={issue}
      backHref="/admin/reports"
      backLabel="← Back to All Reports"
      issueHrefPrefix="/admin/reports"
      actions={
        <IssueActions
          issueId={issue._id}
          status={issue.status}
          title={issue.title}
        />
      }
    />
  );
}
