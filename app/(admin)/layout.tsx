import { Suspense } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGate } from "@/components/providers/AuthGate";
import { Spinner } from "@/components/ui/Spinner";

function AdminShellFallback() {
  return (
    <>
      <div className="h-16 border-b border-line bg-white" aria-hidden="true" />
      <main className="flex flex-1 items-center justify-center py-24">
        <Spinner size={28} label="Loading your account" />
      </main>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShellFallback />}>
      <AuthGate role="ADMIN">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </AuthGate>
    </Suspense>
  );
}
