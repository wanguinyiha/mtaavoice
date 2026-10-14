"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { IssueCard } from "@/components/issues/IssueCard";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { IssueStatus } from "@/lib/status";

type FilterKey = "all" | "open" | "resolved" | "closed";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

function matchesFilter(status: IssueStatus, filter: FilterKey): boolean {
  switch (filter) {
    case "all":
      return true;
    case "open":
      return status !== "RESOLVED" && status !== "REJECTED" && status !== "DUPLICATE";
    case "resolved":
      return status === "RESOLVED";
    case "closed":
      return status === "REJECTED" || status === "DUPLICATE";
  }
}

export default function MyReportsPage() {
  const issues = useQuery(api.issues.listMine);
  const [filter, setFilter] = useState<FilterKey>("all");

  if (issues === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading your reports" />
      </div>
    );
  }

  const visible = issues.filter((issue) => matchesFilter(issue.status, filter));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-neutral-900">My Reports</h1>
        <Link href="/report">
          <Button size="sm">+ New Report</Button>
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter reports">
        {FILTERS.map((option) => (
          <Chip
            key={option.key}
            selected={filter === option.key}
            onClick={() => setFilter(option.key)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      {issues.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No reports yet"
          message="Issues you report will appear here so you can track their progress."
          action={
            <Link
              href="/report"
              className="inline-flex items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Report an Issue
            </Link>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Nothing matches this filter"
          message="Try a different filter to see more of your reports."
        />
      ) : (
        <div className="mt-5">
          {visible.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}

      {issues.length >= 50 ? (
        <p className="mt-4 text-center text-xs text-neutral-400">
          Showing your 50 most recent reports.
        </p>
      ) : null}
    </div>
  );
}
