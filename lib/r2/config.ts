export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "application/json",
  "application/xml",
  "application/zip",
  "application/x-zip-compressed",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function generateR2Key(
  userId: string,
  uuid: string,
  fileName: string
): string {
  const sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 200);
  return `${userId}/${uuid}-${sanitizedFileName}`;
}
