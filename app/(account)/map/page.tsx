"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { IssueMap } from "@/components/map/IssueMap";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  STATUS_HEX_COLORS,
  STATUS_FLOW,
  STATUS_LABELS,
  type IssueStatus,
} from "@/lib/status";

function linkPrefixForRole(role: string | undefined): string {
  if (role === "ADMIN") return "/admin/reports";
  if (role === "FIELD_WORKER") return "/field-worker/assignments";
  return "/reports";
}

export default function CommunityMapPage() {
  const me = useQuery(api.users.getCurrent);
  const issues = useQuery(api.issues.listMap);

  if (issues === undefined || me === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading map" />
      </div>
    );
  }

  const withCoords = issues.filter(
    (issue) => issue.latitude !== null && issue.longitude !== null,
  );
  const withoutCoords = issues.filter(
    (issue) => issue.latitude === null || issue.longitude === null,
  );
  const prefix = linkPrefixForRole(me?.role);
  const presentStatuses = STATUS_FLOW.filter((status) =>
    issues.some((issue) => issue.status === status),
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold text-neutral-900">Community Map</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Open reports across the area — click a marker for details.
        {withCoords.length === 0
          ? " Nothing has precise coordinates yet."
          : ""}
      </p>

      <div className="mt-4">
        <IssueMap issues={withCoords} linkPrefix={prefix} />
      </div>

      {presentStatuses.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {presentStatuses.map((status: IssueStatus) => (
            <span key={status} className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full border border-white shadow"
                style={{ backgroundColor: STATUS_HEX_COLORS[status] }}
                aria-hidden="true"
              />
              <span className="text-xs text-neutral-600">
                {STATUS_LABELS[status]}
              </span>
            </span>
          ))}
        </div>
      ) : null}

      {withoutCoords.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-neutral-900">
            Reported without precise coordinates ({withoutCoords.length})
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            These have a written location instead of GPS coordinates.
          </p>
          <div className="mt-3">
            {withoutCoords.slice(0, 20).map((issue) => (
              <Link
                key={issue._id}
                href={`${prefix}/${issue._id}`}
                className="block"
              >
                <Card className="mb-2.5 transition-colors hover:border-brand/40">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="line-clamp-1 flex-1 text-[15px] font-semibold text-neutral-900">
                      {issue.title}
                    </h3>
                    <StatusBadge status={issue.status} />
                  </div>
                  <p className="mt-1 text-[13px] text-neutral-500">
                    {issue.address ?? "No location description"}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
