import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { AdminIssueDetailClient } from "./AdminIssueDetailClient";

export default function AdminIssueDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Spinner size={28} label="Loading report" />
        </div>
      }
    >
      <AdminIssueDetailClient />
    </Suspense>
  );
}
