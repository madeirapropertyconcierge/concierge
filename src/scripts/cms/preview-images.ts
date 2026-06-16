/**
 * Object-URL previews for images uploaded during an editing session. The
 * uploaded file is shown immediately from a local blob URL until the deploy
 * that contains the committed asset goes live.
 */
const pendingAdminImagePreviewUrls = new Map<string, string>();

export function setPendingAdminImagePreview(src: string, file: File): void {
  const existing = pendingAdminImagePreviewUrls.get(src);
  if (existing) {
    URL.revokeObjectURL(existing);
  }

  pendingAdminImagePreviewUrls.set(src, URL.createObjectURL(file));
}

export function clearPendingAdminImagePreview(src: string): void {
  const existing = pendingAdminImagePreviewUrls.get(src);
  if (!existing) {
    return;
  }

  URL.revokeObjectURL(existing);
  pendingAdminImagePreviewUrls.delete(src);
}

export function clearAllPendingAdminImagePreviews(): void {
  for (const previewUrl of pendingAdminImagePreviewUrls.values()) {
    URL.revokeObjectURL(previewUrl);
  }

  pendingAdminImagePreviewUrls.clear();
}

export function resolveAdminImageSrc(src: string): string {
  return pendingAdminImagePreviewUrls.get(src) ?? src;
}
