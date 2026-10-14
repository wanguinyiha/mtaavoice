"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import {
  ISSUE_PRIORITIES,
  PRIORITY_LABELS,
  type IssuePriority,
} from "@/lib/status";
import { useGeolocation } from "@/lib/useGeolocation";
import { uploadToConvex } from "@/lib/upload";

const MAX_PHOTOS = 5;

type Photo = { file: File; url: string };

export default function ReportIssuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const categories = useQuery(api.categories.list);
  const generateUploadUrl = useMutation(api.issues.generateUploadUrl);
  const createIssue = useMutation(api.issues.create);
  const { state: geo, request: requestLocation } = useGeolocation();

  const [categoryId, setCategoryId] = useState<Id<"categories"> | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [address, setAddress] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const createdUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = createdUrlsRef.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  function addPhotos(fileList: FileList | null) {
    if (fileList === null) return;
    const files = Array.from(fileList).filter(
      (file) => file.type.startsWith("image/"),
    );
    if (files.length === 0) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      toast(`You can attach at most ${MAX_PHOTOS} photos.`, "error");
      return;
    }
    const accepted = files.slice(0, remaining);
    if (accepted.length < files.length) {
      toast(`Only ${remaining} more photo(s) allowed — extras were skipped.`, "info");
    }
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategoryError(null);
    setTitleError(null);
    setDescriptionError(null);
    setLocationError(null);

    let valid = true;
    if (categoryId === null) {
      setCategoryError("Choose a category.");
      valid = false;
    }
    if (title.trim().length < 3 || title.trim().length > 120) {
      setTitleError("Title must be between 3 and 120 characters.");
      valid = false;
    }
    if (description.trim().length < 1 || description.trim().length > 2000) {
      setDescriptionError("Description must be 1-2000 characters.");
      valid = false;
    }
    const hasCoords = geo.status === "ready";
    const hasAddress = address.trim().length > 0;
    if (!hasCoords && !hasAddress) {
      setLocationError(
        "Confirm your location with GPS or describe where the issue is.",
      );
      valid = false;
    }
    if (!valid || categoryId === null) return;

    setSubmitting(true);
    try {
      const imageStorageIds: string[] = [];
      for (const photo of photos) {
        imageStorageIds.push(
          await uploadToConvex(
            () => generateUploadUrl(),
            photo.file,
          ),
        );
      }

      const result = await createIssue({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority,
        ...(hasCoords
          ? { latitude: geo.latitude, longitude: geo.longitude }
          : {}),
        ...(hasAddress ? { address: address.trim() } : {}),
        imageStorageIds: imageStorageIds as Id<"_storage">[],
      });

      toast("Report submitted — we'll keep you posted.", "success");
      router.push(`/reports/${result.issueId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message.split("\n").pop() : null;
      toast(message ?? "Submission failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (categories === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size={28} label="Loading categories" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-bold text-neutral-900">Report an Issue</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Tell your community what&apos;s wrong — add photos and a location so the
        right team can fix it.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
        <div>
          <p className="text-sm font-semibold text-neutral-800">Category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category._id}
                selected={categoryId === category._id}
                onClick={() => {
                  setCategoryId(category._id);
                  setCategoryError(null);
                }}
              >
                {category.name}
              </Chip>
            ))}
          </div>
          {categoryError ? (
            <p className="mt-1.5 text-xs text-danger">{categoryError}</p>
          ) : null}
        </div>

        <Input
          label="Title"
          name="title"
          placeholder="e.g. Large pothole on Main Road"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={titleError ?? undefined}
        />

        <Textarea
          label="Description"
          name="description"
          placeholder="Describe the issue in more detail"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={descriptionError ?? undefined}
        />

        <div>
          <p className="text-sm font-semibold text-neutral-800">Priority</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ISSUE_PRIORITIES.map((value) => (
              <Chip
                key={value}
                selected={priority === value}
                onClick={() => setPriority(value)}
              >
                {PRIORITY_LABELS[value]}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-800">Photos</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            Up to {MAX_PHOTOS} photos ({photos.length}/{MAX_PHOTOS} added).
          </p>
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
              onClick={() => cameraInputRef.current?.click()}
              disabled={photos.length >= MAX_PHOTOS}
            >
              Take Photo
            </Button>
            <Button
              variant="secondary"
              onClick={() => galleryInputRef.current?.click()}
              disabled={photos.length >= MAX_PHOTOS}
            >
              Choose from Gallery
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

        <div>
          <p className="text-sm font-semibold text-neutral-800">Location</p>
          {geo.status === "ready" ? (
            <p className="mt-2 font-mono text-sm text-neutral-700">
              {geo.latitude.toFixed(5)}, {geo.longitude.toFixed(5)}{" "}
              <button
                type="button"
                onClick={requestLocation}
                className="font-sans font-semibold text-brand hover:underline"
              >
                Refresh
              </button>
            </p>
          ) : geo.status === "requesting" ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <Spinner size={16} label="Getting your location" />
              Getting your location…
            </p>
          ) : geo.status === "denied" ? (
            <p className="mt-2 text-sm text-neutral-600">
              Location permission denied — describe the place below, or{" "}
              <button
                type="button"
                onClick={requestLocation}
                className="font-semibold text-brand hover:underline"
              >
                try again
              </button>
              .
            </p>
          ) : geo.status === "unavailable" ? (
            <p className="mt-2 text-sm text-neutral-600">
              {geo.message}{" "}
              <button
                type="button"
                onClick={requestLocation}
                className="font-semibold text-brand hover:underline"
              >
                Retry
              </button>
            </p>
          ) : (
            <div className="mt-2">
              <Button variant="secondary" onClick={requestLocation}>
                Use My Current Location
              </Button>
            </div>
          )}

          <div className="mt-3">
            <Input
              label="Location description"
              name="address"
              placeholder="e.g. Opposite the market, along Moi Avenue"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              error={locationError ?? undefined}
            />
          </div>
        </div>

        <Button type="submit" size="lg" loading={submitting} fullWidth>
          Submit Report
        </Button>
        <p className="-mt-2 text-center text-xs text-neutral-400">
          Your report is reviewed by an administrator before it is assigned.
        </p>
      </form>
    </div>
  );
}
