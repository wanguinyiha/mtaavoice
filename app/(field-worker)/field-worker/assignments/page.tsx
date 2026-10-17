"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { IssueCard } from "@/components/issues/IssueCard";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import type { IssueStatus } from "@/lib/status";

type Filter = "open" | "all" | "resolved";

function matchesFilter(status: IssueStatus, filter: Filter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "open":
      return status === "ASSIGNED" || status === "IN_PROGRESS";
    case "resolved":
      return status === "RESOLVED";
  }
}

export default function AssignmentsPage() {
  const issues = useQuery(api.issues.listAssigned);
  const [filter, setFilter] = useState<Filter>("open");

  if (issues === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading assignments" />
      </div>
    );
  }

  const visible = issues.filter((issue) => matchesFilter(issue.status, filter));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold text-neutral-900">My Assignments</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Reports assigned to you or your department.
      </p>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter assignments"
      >
        <Chip selected={filter === "open"} onClick={() => setFilter("open")}>
          Open
        </Chip>
        <Chip selected={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Chip>
        <Chip selected={filter === "resolved"} onClick={() => setFilter("resolved")}>
          Resolved
        </Chip>
      </div>

      {issues.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No assignments yet"
          message="When an admin assigns a report to your department, it shows up here."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Nothing matches this filter"
          message="Try a different filter to see more assignments."
        />
      ) : (
        <div className="mt-5">
          {visible.map((issue) => (
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
