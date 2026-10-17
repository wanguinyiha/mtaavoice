"use client";

import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { uploadToConvex } from "@/lib/upload";
import type { IssueStatus } from "@/lib/status";

const MAX_EVIDENCE = 5;

type DialogState = { kind: "start" } | { kind: "evidence" } | { kind: "resolve" };

type Photo = { file: File; url: string };

export function WorkerActions({
  issueId,
  status,
  onActioned,
}: {
  issueId: Id<"issues">;
  status: IssueStatus;
  onActioned?: () => void;
}) {
  const { toast } = useToast();
  const setStatus = useMutation(api.issues.setStatus);
  const addEvidence = useMutation(api.issues.addEvidence);
  const generateUploadUrl = useMutation(api.issues.generateUploadUrl);

  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const createdUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = createdUrlsRef.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  const canStart = status === "ASSIGNED";
  const canWork = status === "ASSIGNED" || status === "IN_PROGRESS";
  const canResolve = status === "IN_PROGRESS";

  if (!canWork) return null;

  function resetFields() {
    setNote("");
    setDialogError(null);
    setPhotos((previous) => {
      for (const photo of previous) {
        URL.revokeObjectURL(photo.url);
        createdUrlsRef.current.delete(photo.url);
      }
      return [];
    });
  }

  function openDialog(next: DialogState) {
    resetFields();
    setDialog(next);
  }

  function addPhotos(fileList: FileList | null) {
    if (fileList === null) return;
    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );
    const remaining = MAX_EVIDENCE - photos.length;
    if (remaining <= 0) {
      toast(`You can attach at most ${MAX_EVIDENCE} photos.`, "error");
      return;
    }
    const accepted = files.slice(0, remaining);
    const next: Photo[] = accepted.map((file) => {
      const url = URL.createObjectURL(file);
      createdUrlsRef.current.add(url);
      return { file, url };
    });
    setPhotos((previous) => [...previous, ...next]);
  }

  function removePhoto(index: number) {
    setPhotos((previous) => {
      const target = previous[index];
      if (target) {
        URL.revokeObjectURL(target.url);
        createdUrlsRef.current.delete(target.url);
      }
      return previous.filter((_, i) => i !== index);
    });
  }

  async function onConfirm() {
    if (dialog === null || busy) return;
    setBusy(true);
    setDialogError(null);
    try {
      if (dialog.kind === "start") {
        await setStatus({
          issueId,
          toStatus: "IN_PROGRESS",
          ...(note.trim() ? { note: note.trim() } : {}),
        });
        toast("Work started.", "success");
      } else if (dialog.kind === "evidence") {
        const imageStorageIds: Id<"_storage">[] = [];
        for (const photo of photos) {
          imageStorageIds.push(
            await uploadToConvex(() => generateUploadUrl(), photo.file) as Id<"_storage">,
          );
        }
        await addEvidence({ issueId, imageStorageIds });
        toast("Evidence uploaded.", "success");
      } else {
        if (photos.length > 0) {
          const imageStorageIds: Id<"_storage">[] = [];
          for (const photo of photos) {
            imageStorageIds.push(
              await uploadToConvex(() => generateUploadUrl(), photo.file) as Id<"_storage">,
            );
          }
          await addEvidence({ issueId, imageStorageIds });
        }
        await setStatus({
          issueId,
          toStatus: "RESOLVED",
          ...(note.trim() ? { note: note.trim() } : {}),
        });
        toast("Issue marked resolved.", "success");
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

  function renderPhotoPicker() {
    return (
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            {photos.length}/{MAX_EVIDENCE} photos
          </p>
        </div>
        {photos.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div key={photo.url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`Selected photo ${index + 1}`}
                  className="h-[70px] w-[70px] rounded-lg border border-line object-cover"
                />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => removePhoto(index)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-3 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            disabled={photos.length >= MAX_EVIDENCE}
          >
            Take Photo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => galleryInputRef.current?.click()}
            disabled={photos.length >= MAX_EVIDENCE}
          >
            Gallery
          </Button>
        </div>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            addPhotos(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            addPhotos(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
    );
  }

  const config =
    dialog === null
      ? null
      : dialog.kind === "start"
        ? {
            title: "Start work?",
            description:
              "Mark this assignment as in progress so the reporter sees the update.",
            confirmLabel: "Start work",
          }
        : dialog.kind === "evidence"
          ? {
              title: "Add evidence photos",
              description:
                "Before/after photos help the reporter and admin see the fix.",
              confirmLabel: "Upload",
            }
          : {
              title: "Mark resolved",
              description:
                "Close the loop. Attach photos of the completed work if you have them.",
              confirmLabel: "Mark resolved",
            };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canStart ? (
          <Button size="sm" onClick={() => openDialog({ kind: "start" })}>
            Start work
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => openDialog({ kind: "evidence" })}
        >
          Add evidence
        </Button>
        {canResolve ? (
          <Button size="sm" onClick={() => openDialog({ kind: "resolve" })}>
            Mark resolved
          </Button>
        ) : null}
      </div>

      {config !== null && dialog !== null ? (
        <ConfirmDialog
          open
          title={config.title}
          description={config.description}
          confirmLabel={config.confirmLabel}
          tone="primary"
          loading={busy}
          confirmDisabled={dialog.kind === "evidence" && photos.length === 0}
          onConfirm={onConfirm}
          onCancel={() => {
            if (busy) return;
            setDialog(null);
            resetFields();
          }}
        >
          {dialog.kind !== "evidence" ? (
            <Textarea
              label="Add a note (optional)"
              name="note"
              rows={2}
              placeholder={
                dialog.kind === "resolve"
                  ? "e.g. Pothole patched and area cleaned"
                  : "e.g. Heading out to the site now"
              }
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          ) : null}
          <div className={dialog.kind !== "evidence" ? "mt-3" : ""}>
            {renderPhotoPicker()}
          </div>
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
