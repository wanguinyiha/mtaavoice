"use client";

import { useMutation, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { ROLE_LABELS } from "@/lib/status";

export default function ProfilePage() {
  const me = useQuery(api.users.getCurrent);
  const updateProfile = useMutation(api.users.updateProfile);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  if (me === undefined || me === null) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading profile" />
      </div>
    );
  }

  const initial = (me.fullName ?? me.email ?? "?").trim().charAt(0).toUpperCase();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    setSaving(true);
    try {
      await updateProfile({ name, phone });
      toast("Profile updated.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message.split("\n").pop() : null;
      toast(message ?? "Couldn't update profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function onSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold text-neutral-900">Profile</h1>

      <Card className="mt-5 flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold text-white"
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-neutral-900">
            {me.fullName ?? "Unnamed citizen"}
          </p>
          <p className="truncate text-sm text-neutral-500">{me.email}</p>
          <span className="mt-1.5 inline-block rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
            {ROLE_LABELS[me.role]}
          </span>
        </div>
      </Card>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <Card>
          <h2 className="text-[15px] font-bold text-neutral-900">
            Account details
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <Input
              label="Full name"
              name="name"
              defaultValue={me.fullName ?? ""}
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              placeholder="e.g. 0712 345 678"
              defaultValue={me.phone ?? ""}
            />
          </div>
          <Button type="submit" className="mt-4" loading={saving}>
            Save changes
          </Button>
        </Card>
      </form>

      <Card className="mt-4">
        <h2 className="text-[15px] font-bold text-neutral-900">Session</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Signed in as {me.email}.
        </p>
        <Button
          variant="danger"
          className="mt-3"
          onClick={onSignOut}
        >
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
