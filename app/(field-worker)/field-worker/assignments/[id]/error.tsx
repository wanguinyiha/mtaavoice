"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AssignmentDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-lg font-bold text-neutral-900">
        This assignment couldn&apos;t be loaded
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        {error.message.includes("Not authorized") ||
        error.message.includes("not assigned")
          ? "You don't have access to this assignment."
          : "Something went wrong while loading this assignment."}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link href="/field-worker/assignments">
          <Button variant="secondary">Back to My Assignments</Button>
        </Link>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
