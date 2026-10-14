"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { homePathForRole } from "@/lib/nav";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.users.getCurrent);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && me) {
      router.replace(homePathForRole(me.role));
    }
  }, [isLoading, isAuthenticated, me, router]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);

    let valid = true;
    if (name.trim().length < 2) {
      setNameError("Enter your full name (at least 2 characters).");
      valid = false;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    }
    if (!valid) return;

    setSubmitting(true);
    try {
      await signIn("password", {
        flow: "signUp",
        email: email.trim(),
        password,
        name: name.trim(),
      });
      toast("Account created — welcome to MtaaVoice!", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message.split("\n").pop() : null;
      toast(
        message ?? "Registration failed. Please try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold text-neutral-900">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Report community issues and track them to resolution.
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="e.g. Amina Wanjiku"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={nameError ?? undefined}
        />
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
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError ?? undefined}
        />
        <Button type="submit" size="lg" loading={submitting} fullWidth>
          Sign Up
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand">
          Log in
        </Link>
      </p>
    </Card>
  );
}
