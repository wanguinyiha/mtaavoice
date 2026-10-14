import { AuthGate } from "@/components/providers/AuthGate";

export default function AdminPage() {
  return (
    <AuthGate role="ADMIN">
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold text-neutral-900">
          Admin dashboard
        </h1>
        <p className="mt-2 text-neutral-600">
          Report review, assignments and operational statistics arrive in
          Phase 5.
        </p>
      </main>
    </AuthGate>
  );
}
