import Link from "next/link";
import type { ReactNode } from "react";
import { StatusTimeline } from "@/components/issues/StatusTimeline";
import { Card } from "@/components/ui/Card";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/status";
import type { IssueDetail } from "@/lib/types";

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function IssueDetailView({
  issue,
  backHref,
  backLabel,
  actions,
  issueHrefPrefix = "/reports",
}: {
  issue: IssueDetail;
  backHref: string;
  backLabel: string;
  actions?: ReactNode;
  issueHrefPrefix?: string;
}) {
  const hasCoordinates = issue.latitude !== null && issue.longitude !== null;
  const hasUpdateFeed = issue.updates.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <Link
        href={backHref}
        className="text-sm font-medium text-brand hover:underline"
      >
        {backLabel}
      </Link>

      <h1 className="mt-3 text-xl font-bold text-neutral-900">{issue.title}</h1>
      <p className="mt-1 text-xs text-neutral-500">
        Priority: {PRIORITY_LABELS[issue.priority].toUpperCase()} · Reported{" "}
        {formatTimestamp(issue.createdAt)}
        {issue.categoryName ? ` · ${issue.categoryName}` : ""}
      </p>

      {issue.imageUrls.length > 0 ? (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {issue.imageUrls.map((url, index) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              title={`Open photo ${index + 1} full size`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Photo ${index + 1} of ${issue.title}`}
                className="h-[140px] w-[140px] shrink-0 rounded-lg border border-line object-cover"
              />
            </a>
          ))}
        </div>
      ) : null}

      <Card className="mt-5">
        <h2 className="text-[15px] font-bold text-neutral-900">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
          {issue.description}
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="text-[15px] font-bold text-neutral-900">Location</h2>
        {issue.address ? (
          <p className="mt-2 text-sm text-neutral-700">{issue.address}</p>
        ) : null}
        {hasCoordinates ? (
          <p className="mt-1 font-mono text-sm text-neutral-600">
            {formatCoordinates(issue.latitude!, issue.longitude!)}
            {"  "}
            <a
              className="font-sans font-semibold text-brand hover:underline"
              href={`https://www.openstreetmap.org/?mlat=${issue.latitude}&mlon=${issue.longitude}#map=17/${issue.latitude}/${issue.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in map
            </a>
          </p>
        ) : null}
        {!issue.address && !hasCoordinates ? (
          <p className="mt-2 text-sm text-neutral-500">
            No location recorded for this report.
          </p>
        ) : null}
      </Card>

      <Card className="mt-4">
        <h2 className="text-[15px] font-bold text-neutral-900">
          Status: {STATUS_LABELS[issue.status]}
        </h2>

        {issue.status === "REJECTED" ? (
          <div className="mt-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
            <p className="text-sm font-semibold text-danger">
              This report was not accepted.
            </p>
            {issue.rejectionReason ? (
              <p className="mt-1 text-sm text-neutral-700">
                Reason: {issue.rejectionReason}
              </p>
            ) : null}
          </div>
        ) : null}

        {issue.status === "DUPLICATE" ? (
          <div className="mt-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-neutral-700">
            Marked as a duplicate of{" "}
            {issue.duplicateOf ? (
              <Link
                href={`${issueHrefPrefix}/${issue.duplicateOf}`}
                className="font-semibold text-brand hover:underline"
              >
                {issue.duplicateOfTitle ?? "another report"}
              </Link>
            ) : (
              "another report"
            )}
            .
          </div>
        ) : null}

        <StatusTimeline status={issue.status} />

        {issue.activeAssignment ? (
          <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm text-neutral-700">
            Assigned to{" "}
            {issue.activeAssignment.workerName ??
              issue.activeAssignment.departmentName ??
              "a response team"}
            {issue.activeAssignment.workerName &&
            issue.activeAssignment.departmentName
              ? ` · ${issue.activeAssignment.departmentName}`
              : ""}
          </p>
        ) : null}
      </Card>

      {actions !== undefined ? <div className="mt-4">{actions}</div> : null}

      <Card className="mt-4">
        <h2 className="text-[15px] font-bold text-neutral-900">
          Updates from the response team
        </h2>
        {hasUpdateFeed ? (
          <div className="mt-3">
            {issue.updates.map((update) => (
              <div key={update._id} className="mb-3 border-l-2 border-brand pl-3">
                <p className="text-sm font-bold text-neutral-900">
                  {STATUS_LABELS[update.toStatus]}
                </p>
                {update.note ? (
                  <p className="mt-0.5 text-sm text-neutral-700">
                    {update.note}
                  </p>
                ) : null}
                <p className="mt-0.5 text-xs text-neutral-400">
                  {update.authorName ? `${update.authorName} · ` : ""}
                  {formatTimestamp(update.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">
            No updates yet — you&apos;ll see progress here as the team works on
            it.
          </p>
        )}
      </Card>
    </div>
  );
}
