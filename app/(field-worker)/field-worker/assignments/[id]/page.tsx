import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { AssignmentDetailClient } from "./AssignmentDetailClient";

export default function AssignmentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Spinner size={28} label="Loading assignment" />
        </div>
      }
    >
      <AssignmentDetailClient />
    </Suspense>
  );
}
