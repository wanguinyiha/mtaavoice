/**
 * Upload a file through a Convex signed upload URL and return its storage ID.
 * The caller must have called `api.issues.generateUploadUrl` first.
 */
export async function uploadToConvex(
  generateUploadUrl: () => Promise<string>,
  file: File,
): Promise<string> {
  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Photo upload failed (HTTP ${response.status})`);
  }
  const result: unknown = await response.json();
  const storageId =
    typeof result === "object" &&
    result !== null &&
    "storageId" in result &&
    typeof (result as { storageId: unknown }).storageId === "string"
      ? (result as { storageId: string }).storageId
      : null;
  if (storageId === null) {
    throw new Error("Photo upload failed: no storage ID returned");
  }
  return storageId;
}
