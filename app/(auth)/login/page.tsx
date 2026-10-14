"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { homePathForRole } from "@/lib/nav";

function safeNextPath(searchParams: URLSearchParams): string {
  const next = searchParams.get("next");
  return next !== null && next.startsWith("/") ? next : "";
}

function LoginForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.users.getCurrent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && me) {
      const next = safeNextPath(searchParams);
      router.replace(next !== "" ? next : homePathForRole(me.role));
    }
  }, [isLoading, isAuthenticated, me, router, searchParams]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError(null);
    setPasswordError(null);

    let valid = true;
    if (email.trim().length === 0) {
      setEmailError("Enter your email address.");
      valid = false;
    }
    if (password.length === 0) {
      setPasswordError("Enter your password.");
      valid = false;
    }
    if (!valid) return;

    setSubmitting(true);
    try {
      await signIn("password", {
        flow: "signIn",
        email: email.trim(),
        password,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message.split("\n").pop() : null;
      toast(message ?? "Login failed. Check your email and password.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Log in to continue to MtaaVoice.
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError ?? undefined}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError ?? undefined}
        />
        <Button type="submit" size="lg" loading={submitting} fullWidth>
          Log In
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand">
          Sign up
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
