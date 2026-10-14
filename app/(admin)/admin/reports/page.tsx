"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { IssueCard } from "@/components/issues/IssueCard";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ISSUE_STATUSES, STATUS_LABELS, type IssueStatus } from "@/lib/status";

type Filter = IssueStatus | "ALL";

export default function AdminReportsPage() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const issues = useQuery(
    api.issues.listAll,
    filter === "ALL" ? {} : { status: filter },
  );

  const trimmed = search.trim().toLowerCase();
  const visible =
    issues === undefined
      ? undefined
      : issues.filter(
          (issue) =>
            trimmed === "" ||
            issue.title.toLowerCase().includes(trimmed) ||
            issue.description.toLowerCase().includes(trimmed) ||
            (issue.address ?? "").toLowerCase().includes(trimmed),
        );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold text-neutral-900">All Reports</h1>

      <div className="mt-4">
        <Input
          label="Search"
          name="search"
          type="search"
          placeholder="Search title, description or location…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by status"
      >
        <Chip selected={filter === "ALL"} onClick={() => setFilter("ALL")}>
          All
        </Chip>
        {ISSUE_STATUSES.map((status) => (
          <Chip
            key={status}
            selected={filter === status}
            onClick={() => setFilter(status)}
          >
            {STATUS_LABELS[status]}
          </Chip>
        ))}
      </div>

      {visible === undefined ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size={28} label="Loading reports" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No reports match"
          message={
            trimmed === ""
              ? "No reports have this status yet."
              : "Nothing matches your search and filters."
          }
        />
      ) : (
        <div className="mt-5">
          {visible.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              hrefPrefix="/admin/reports"
            />
          ))}
        </div>
      )}

      {issues !== undefined && issues.length >= 50 ? (
        <p className="mt-4 text-center text-xs text-neutral-400">
          Showing up to 50 of the most recent matching reports.
        </p>
      ) : null}
    </div>
  );
}
