"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { IssueDetailView } from "@/components/issues/IssueDetailView";
import { WorkerActions } from "@/components/field/WorkerActions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

export function AssignmentDetailClient() {
  const params = useParams<{ id: string }>();
  const issueId = params.id as Id<"issues">;
  const issue = useQuery(api.issues.get, { issueId });

  if (issue === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading assignment" />
      </div>
    );
  }

  if (issue === null) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <EmptyState
          title="Assignment not found"
          message="This report doesn't exist, or it isn't assigned to you."
          action={
            <Link
              href="/field-worker/assignments"
              className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Back to My Assignments
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <IssueDetailView
      issue={issue}
      backHref="/field-worker/assignments"
      backLabel="← Back to My Assignments"
      issueHrefPrefix="/field-worker/assignments"
      actions={
        <WorkerActions issueId={issue._id} status={issue.status} />
      }
    />
  );
}
