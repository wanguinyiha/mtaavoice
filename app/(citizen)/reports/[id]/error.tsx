"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function IssueDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-lg font-bold text-neutral-900">
        This report couldn&apos;t be loaded
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {error.message.includes("Not authorized") ||
        error.message.includes("not authorized")
          ? "You don't have permission to view this report."
          : "Something went wrong while loading this report."}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link href="/reports">
          <Button variant="secondary">Back to My Reports</Button>
        </Link>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
