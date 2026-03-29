/** Pure helper — safe to import from client components. */
export function r2KeyToDownloadPath(key: string): string {
  return `/api/download/${key.split("/").map(encodeURIComponent).join("/")}`;
}
