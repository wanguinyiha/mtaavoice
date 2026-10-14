import { AuthGate } from "@/components/providers/AuthGate";

export default function FieldWorkerPage() {
  return (
    <AuthGate role="FIELD_WORKER">
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Assigned issues
        </h1>
        <p className="mt-2 text-neutral-600">
          Your assignments, progress notes and evidence uploads arrive in
          Phase 6.
        </p>
      </main>
    </AuthGate>
  );
}
