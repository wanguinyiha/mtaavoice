import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { IssueDetailClient } from "./IssueDetailClient";

export default function IssueDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Spinner size={28} label="Loading report" />
        </div>
      }
    >
      <IssueDetailClient />
    </Suspense>
  );
}
