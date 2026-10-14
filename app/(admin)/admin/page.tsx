"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { IssueCard } from "@/components/issues/IssueCard";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { StatBox } from "@/components/ui/StatBox";

export default function AdminDashboardPage() {
  const stats = useQuery(api.admin.stats);
  const recent = useQuery(api.issues.listAll, {});

  if (stats === undefined || recent === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading dashboard" />
      </div>
    );
  }

  const byStatus = stats.byStatus;
  const needsReview = byStatus.SUBMITTED + byStatus.UNDER_REVIEW;
  const awaitingAssignment = byStatus.ACCEPTED;
  const inProgress = byStatus.ASSIGNED + byStatus.IN_PROGRESS;
  const resolved = byStatus.RESOLVED;
  const closed = byStatus.REJECTED + byStatus.DUPLICATE;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {stats.total} reports in the system · {byStatus.DUPLICATE} marked as
        duplicates
      </p>

      <Link href="/admin/queue" className="mt-5 block">
        <Card className="flex items-center justify-between gap-3 border-brand/40 bg-brand/5 transition-colors hover:border-brand">
          <div>
            <p className="text-[15px] font-semibold text-neutral-900">
              {needsReview === 0
                ? "Review queue is clear"
                : `${needsReview} report${needsReview === 1 ? "" : "s"} waiting for review`}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {byStatus.SUBMITTED} submitted · {byStatus.UNDER_REVIEW} under
              review
            </p>
          </div>
          <span className="text-sm font-semibold text-brand">Open queue →</span>
        </Card>
      </Link>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatBox value={needsReview} label="Needs Review" />
        <StatBox value={awaitingAssignment} label="Accepted" />
        <StatBox value={inProgress} label="In Progress" />
        <StatBox value={resolved} label="Resolved" />
      </div>

      <p className="mt-3 text-center text-xs text-neutral-400">
        {closed} closed without work ({byStatus.REJECTED} rejected,{" "}
        {byStatus.DUPLICATE} duplicate)
      </p>

      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-neutral-900">
          Recent Reports
        </h2>
        <Link
          href="/admin/reports"
          className="text-sm font-medium text-brand hover:underline"
        >
          View all
        </Link>
      </div>

      {recent.length === 0 ? (
        <Card className="mt-3 text-sm text-neutral-500">
          No reports yet — they will appear here as citizens submit them.
        </Card>
      ) : (
        <div className="mt-3">
          {recent.slice(0, 5).map((issue) => (
            <IssueCard key={issue._id} issue={issue} hrefPrefix="/admin/reports" />
          ))}
        </div>
      )}
    </div>
  );
}
