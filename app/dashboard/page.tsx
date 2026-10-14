import { AuthGate } from "@/components/providers/AuthGate";

export default function CitizenDashboardPage() {
  return (
    <AuthGate role="CITIZEN">
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Citizen dashboard
        </h1>
        <p className="mt-2 text-neutral-600">
          Reporting, your recent issues and live status updates land here in
          Phase 4.
        </p>
      </main>
    </AuthGate>
  );
}
