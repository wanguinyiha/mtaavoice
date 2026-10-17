"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { IssueCard } from "@/components/issues/IssueCard";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { StatBox } from "@/components/ui/StatBox";

export default function FieldWorkerDashboardPage() {
  const me = useQuery(api.users.getCurrent);
  const issues = useQuery(api.issues.listAssigned);

  if (issues === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading your assignments" />
      </div>
    );
  }

  const open = issues.filter(
    (issue) => issue.status === "ASSIGNED" || issue.status === "IN_PROGRESS",
  );
  const inProgress = issues.filter(
    (issue) => issue.status === "IN_PROGRESS",
  ).length;
  const resolved = issues.filter(
    (issue) => issue.status === "RESOLVED",
  ).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">
        Welcome{me?.fullName ? `, ${me.fullName.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Work your assignments from accepted to resolved.
      </p>

      <Link href="/field-worker/assignments" className="mt-5 block">
        <Card className="flex items-center justify-between gap-3 border-brand/40 bg-brand/5 transition-colors hover:border-brand">
          <div>
            <p className="text-[15px] font-semibold text-neutral-900">
              {open.length === 0
                ? "No open assignments"
                : `${open.length} open assignment${open.length === 1 ? "" : "s"}`}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {inProgress} in progress · {resolved} resolved
            </p>
          </div>
          <span className="text-sm font-semibold text-brand">
            Open assignments →
          </span>
        </Card>
      </Link>

      <div className="mt-5 flex gap-2">
        <StatBox value={open.length} label="Open" />
        <StatBox value={inProgress} label="In Progress" />
        <StatBox value={resolved} label="Resolved" />
      </div>

      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-neutral-900">
          Recent Assignments
        </h2>
        {issues.length > 5 ? (
          <Link
            href="/field-worker/assignments"
            className="text-sm font-medium text-brand hover:underline"
          >
            View all
          </Link>
        ) : null}
      </div>

      {issues.length === 0 ? (
        <Card className="mt-3 text-sm text-neutral-500">
          Nothing assigned to you yet — when an admin assigns your department
          a report, it appears here.
        </Card>
      ) : (
        <div className="mt-3">
          {issues.slice(0, 5).map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              hrefPrefix="/field-worker/assignments"
            />
          ))}
        </div>
      )}
    </div>
  );
}
