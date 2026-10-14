"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

type DialogState =
  | { kind: "create" }
  | { kind: "rename"; id: Id<"departments">; currentName: string };

export default function DepartmentsPage() {
  const departments = useQuery(api.departments.listStats);
  const createDepartment = useMutation(api.departments.create);
  const renameDepartment = useMutation(api.departments.rename);
  const { toast } = useToast();

  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const trimmed = name.trim();
  const nameInvalid = trimmed.length < 2 || trimmed.length > 80;

  function openCreate() {
    setName("");
    setDialogError(null);
    setDialog({ kind: "create" });
  }

  function openRename(id: Id<"departments">, currentName: string) {
    setName(currentName);
    setDialogError(null);
    setDialog({ kind: "rename", id, currentName });
  }

  async function onConfirm() {
    if (dialog === null || busy || nameInvalid) return;
    setBusy(true);
    setDialogError(null);
    try {
      if (dialog.kind === "create") {
        await createDepartment({ name: trimmed });
        toast("Department created.", "success");
      } else {
        await renameDepartment({ id: dialog.id, name: trimmed });
        toast("Department renamed.", "success");
      }
      setDialog(null);
      setName("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message.split("\n").pop() : null;
      setDialogError(message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (departments === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading departments" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Departments</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Teams that receive and resolve reports.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          + Add department
        </Button>
      </div>

      {departments.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No departments yet"
          message="Create the first department so accepted reports can be assigned."
          action={
            <Button onClick={openCreate}>+ Add department</Button>
          }
        />
      ) : (
        <div className="mt-5">
          {departments.map((department) => (
            <Card
              key={department._id}
              className="mb-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-neutral-900">
                  {department.name}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {department.workerCount} field worker
                  {department.workerCount === 1 ? "" : "s"} ·{" "}
                  {department.activeAssignments} active assignment
                  {department.activeAssignments === 1 ? "" : "s"}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openRename(department._id, department.name)}
              >
                Rename
              </Button>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={dialog !== null}
        title={dialog?.kind === "rename" ? "Rename department" : "Add department"}
        description={
          dialog?.kind === "rename"
            ? "Pick a new name for this team (2-80 characters)."
            : "Departments receive assigned reports (2-80 characters)."
        }
        confirmLabel={dialog?.kind === "rename" ? "Save name" : "Create"}
        tone="primary"
        loading={busy}
        confirmDisabled={nameInvalid}
        onConfirm={onConfirm}
        onCancel={() => {
          if (busy) return;
          setDialog(null);
          setName("");
          setDialogError(null);
        }}
      >
        <Input
          label="Department name"
          name="departmentName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={
            name.length > 0 && nameInvalid
              ? "Name must be 2-80 characters."
              : undefined
          }
          autoFocus
        />
        {dialogError !== null ? (
          <p className="mt-3 rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
            {dialogError}
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
