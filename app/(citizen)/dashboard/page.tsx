"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { IssueCard } from "@/components/issues/IssueCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { StatBox } from "@/components/ui/StatBox";
import type { IssueStatus } from "@/lib/status";

const SUBMITTED_GROUP: IssueStatus[] = ["SUBMITTED", "UNDER_REVIEW"];
const IN_PROGRESS_GROUP: IssueStatus[] = ["ASSIGNED", "IN_PROGRESS"];

export default function CitizenDashboardPage() {
  const me = useQuery(api.users.getCurrent);
  const issues = useQuery(api.issues.listMine);

  if (issues === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading your reports" />
      </div>
    );
  }

  const submittedCount = issues.filter((issue) =>
    SUBMITTED_GROUP.includes(issue.status),
  ).length;
  const inProgressCount = issues.filter((issue) =>
    IN_PROGRESS_GROUP.includes(issue.status),
  ).length;
  const resolvedCount = issues.filter(
    (issue) => issue.status === "RESOLVED",
  ).length;

  const recent = issues.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">
        Welcome{me?.fullName ? `, ${me.fullName.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Report community problems and follow them to resolution.
      </p>

      <Link
        href="/report"
        className="mt-5 flex w-full items-center justify-center rounded-[10px] bg-brand px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-strong"
      >
        + Report an Issue
      </Link>

      <div className="mt-5 flex gap-2">
        <StatBox value={submittedCount} label="Submitted" />
        <StatBox value={inProgressCount} label="In Progress" />
        <StatBox value={resolvedCount} label="Resolved" />
      </div>

      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-neutral-900">
          Recent Reports
        </h2>
        {issues.length > 5 ? (
          <Link
            href="/reports"
            className="text-sm font-medium text-brand hover:underline"
          >
            View all
          </Link>
        ) : null}
      </div>

      {issues.length === 0 ? (
        <EmptyState
          className="mt-3"
          title="You haven't reported anything yet."
          message="Spotted a pothole, broken streetlight or overflowing bin? Report it and track the fix."
          action={
            <Link
              href="/report"
              className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Report your first issue
            </Link>
          }
        />
      ) : (
        <div className="mt-3">
          {recent.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
