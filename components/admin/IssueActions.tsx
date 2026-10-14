"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { adminTransitions } from "@/lib/transitions";
import { STATUS_LABELS, type IssueStatus } from "@/lib/status";

type DialogState =
  | { kind: "start" }
  | { kind: "accept" }
  | { kind: "reject" }
  | { kind: "duplicate" }
  | { kind: "assign" };

type DialogConfig = {
  title: string;
  description?: string;
  confirmLabel: string;
  tone: "danger" | "primary";
};

export function IssueActions({
  issueId,
  status,
  title,
  onActioned,
}: {
  issueId: Id<"issues">;
  status: IssueStatus;
  title: string;
  onActioned?: () => void;
}) {
  const { toast } = useToast();
  const setStatus = useMutation(api.issues.setStatus);
  const assign = useMutation(api.issues.assign);
  const departments = useQuery(api.departments.list);
  const workers = useQuery(api.users.listWorkers);
  const allIssues = useQuery(api.issues.listAll, {});

  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [duplicateOf, setDuplicateOf] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [workerId, setWorkerId] = useState("");

  const transitions = adminTransitions(status);
  const canStartReview = transitions.includes("UNDER_REVIEW");
  const canDispose = status === "UNDER_REVIEW";
  const canAssign = ["ACCEPTED", "ASSIGNED", "IN_PROGRESS"].includes(status);

  if (!canStartReview && !canDispose && !canAssign) return null;

  function resetFields() {
    setNote("");
    setReason("");
    setDuplicateOf("");
    setDepartmentId("");
    setWorkerId("");
    setDialogError(null);
  }

  function openDialog(next: DialogState) {
    resetFields();
    setDialog(next);
  }

  const dialogConfig: Record<DialogState["kind"], DialogConfig> = {
    start: {
      title: "Start review?",
      description: `Move "${title}" to Under review so the team can assess it.`,
      confirmLabel: "Start review",
      tone: "primary",
    },
    accept: {
      title: "Accept this report?",
      description: `Accept "${title}" — it can then be assigned to a department.`,
      confirmLabel: "Accept report",
      tone: "primary",
    },
    reject: {
      title: "Reject report",
      description: "The reason is shared with the reporter.",
      confirmLabel: "Reject report",
      tone: "danger",
    },
    duplicate: {
      title: "Mark as duplicate",
      description: `Select the original report that "${title}" duplicates.`,
      confirmLabel: "Mark duplicate",
      tone: "primary",
    },
    assign: {
      title: status === "ACCEPTED" ? "Assign report" : "Reassign report",
      description:
        "Choose the department responsible. Picking a specific field worker is optional.",
      confirmLabel: "Assign",
      tone: "primary",
    },
  };

  const duplicateCandidates = (allIssues ?? []).filter(
    (issue) =>
      issue._id !== issueId &&
      issue.status !== "REJECTED" &&
      issue.status !== "DUPLICATE",
  );

  const filteredWorkers = (workers ?? []).filter((worker) => {
    if (worker.departmentId === null) return true;
    return worker.departmentId === departmentId;
  });

  const confirmDisabled =
    dialog?.kind === "reject"
      ? reason.trim().length < 3 || reason.trim().length > 500
      : dialog?.kind === "duplicate"
        ? duplicateOf === ""
        : dialog?.kind === "assign"
          ? departmentId === ""
          : false;

  async function onConfirm() {
    if (dialog === null || busy) return;
    setBusy(true);
    setDialogError(null);
    try {
      switch (dialog.kind) {
        case "start":
          await setStatus({
            issueId,
            toStatus: "UNDER_REVIEW",
            ...(note.trim() ? { note: note.trim() } : {}),
          });
          toast("Review started.", "success");
          break;
        case "accept":
          await setStatus({
            issueId,
            toStatus: "ACCEPTED",
            ...(note.trim() ? { note: note.trim() } : {}),
          });
          toast("Report accepted — ready to assign.", "success");
          break;
        case "reject":
          await setStatus({
            issueId,
            toStatus: "REJECTED",
            reason: reason.trim(),
            ...(note.trim() ? { note: note.trim() } : {}),
          });
          toast("Report rejected.", "success");
          break;
        case "duplicate":
          await setStatus({
            issueId,
            toStatus: "DUPLICATE",
            duplicateOf: duplicateOf as Id<"issues">,
            ...(note.trim() ? { note: note.trim() } : {}),
          });
          toast("Marked as a duplicate.", "success");
          break;
        case "assign":
          await assign({
            issueId,
            departmentId: departmentId as Id<"departments">,
            ...(workerId !== "" ? { workerId: workerId as Id<"users"> } : {}),
          });
          toast("Report assigned.", "success");
          break;
      }
      setDialog(null);
      resetFields();
      onActioned?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message.split("\n").pop() : null;
      setDialogError(message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function renderDialogChildren() {
    if (dialog === null) return null;
    if (dialog.kind === "start" || dialog.kind === "accept") {
      return (
        <Textarea
          label="Add a note (optional)"
          name="note"
          rows={2}
          placeholder="e.g. Verified against the weekly works schedule"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      );
    }
    if (dialog.kind === "reject") {
      return (
        <Textarea
          label="Rejection reason (required)"
          name="reason"
          rows={3}
          placeholder="Why can't this report be accepted?"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={
            reason.length > 0 &&
            (reason.trim().length < 3 || reason.trim().length > 500)
              ? "Reason must be 3-500 characters."
              : undefined
          }
        />
      );
    }
    if (dialog.kind === "duplicate") {
      if (allIssues === undefined) {
        return (
          <p className="flex items-center gap-2 text-sm text-neutral-600">
            <Spinner size={16} label="Loading reports" />
            Loading reports…
          </p>
        );
      }
      if (duplicateCandidates.length === 0) {
        return (
          <p className="text-sm text-neutral-600">
            No other active reports to link to.
          </p>
        );
      }
      return (
        <Select
          label="Original report"
          name="duplicateOf"
          value={duplicateOf}
          onChange={(event) => setDuplicateOf(event.target.value)}
          placeholder="Choose a report…"
          options={duplicateCandidates.map((issue) => ({
            value: issue._id,
            label: `${issue.title} · ${STATUS_LABELS[issue.status]}`,
          }))}
        />
      );
    }
    return (
      <div className="flex flex-col gap-3">
        <Select
          label="Department"
          name="departmentId"
          value={departmentId}
          onChange={(event) => {
            setDepartmentId(event.target.value);
            setWorkerId("");
          }}
          placeholder="Choose a department…"
          options={(departments ?? []).map((department) => ({
            value: department._id,
            label: department.name,
          }))}
          disabled={departments === undefined}
        />
        {departmentId !== "" ? (
          workers === undefined ? (
            <p className="flex items-center gap-2 text-sm text-neutral-600">
              <Spinner size={16} label="Loading field workers" />
              Loading field workers…
            </p>
          ) : (
            <Select
              label="Field worker (optional)"
              name="workerId"
              value={workerId}
              onChange={(event) => setWorkerId(event.target.value)}
              placeholder="Anyone in the department"
              options={filteredWorkers.map((worker) => ({
                value: worker._id,
                label: worker.name
                  ? `${worker.name}${worker.departmentName ? ` · ${worker.departmentName}` : ""}`
                  : (worker.email ?? "Unnamed worker"),
              }))}
            />
          )
        ) : null}
        {departmentId !== "" && filteredWorkers.length === 0 ? (
          <p className="text-xs text-neutral-500">
            No field workers in this department yet — the department itself will
            hold the assignment.
          </p>
        ) : null}
      </div>
    );
  }

  const config = dialog !== null ? dialogConfig[dialog.kind] : null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canStartReview ? (
          <Button size="sm" onClick={() => openDialog({ kind: "start" })}>
            Start review
          </Button>
        ) : null}
        {canDispose ? (
          <>
            <Button size="sm" onClick={() => openDialog({ kind: "accept" })}>
              Accept
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => openDialog({ kind: "reject" })}
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openDialog({ kind: "duplicate" })}
            >
              Mark duplicate
            </Button>
          </>
        ) : null}
        {canAssign ? (
          <Button
            size="sm"
            variant={status === "ACCEPTED" ? "primary" : "secondary"}
            onClick={() => openDialog({ kind: "assign" })}
          >
            {status === "ACCEPTED" ? "Assign to a team" : "Reassign"}
          </Button>
        ) : null}
      </div>

      {config !== null && dialog !== null ? (
        <ConfirmDialog
          open
          title={config.title}
          description={config.description}
          confirmLabel={config.confirmLabel}
          tone={config.tone}
          loading={busy}
          confirmDisabled={confirmDisabled}
          onConfirm={onConfirm}
          onCancel={() => {
            if (busy) return;
            setDialog(null);
            resetFields();
          }}
        >
          {renderDialogChildren()}
          {dialogError !== null ? (
            <p className="mt-3 rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
              {dialogError}
            </p>
          ) : null}
        </ConfirmDialog>
      ) : null}
    </>
  );
}
