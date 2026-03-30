import type { ItemTypeInfo } from "@/types/dashboard";

export const CODE_LANGUAGE_OPTIONS = [
  "typescript",
  "javascript",
  "json",
  "python",
  "bash",
  "sql",
  "markdown",
  "plaintext",
  "xml",
  "css",
  "html",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGE_OPTIONS)[number];
export const DEFAULT_CODE_LANGUAGE: CodeLanguage = "typescript";

export type ContentFormat = "markdown" | "plain" | "code";

export function isUrlType(type: ItemTypeInfo): boolean {
  return type.name === "URL" || type.icon === "link";
}

export function isCodeLikeType(type: ItemTypeInfo | null): boolean {
  if (!type) return false;
  return (
    type.icon === "code" ||
    type.icon === "terminal" ||
    type.name.toLowerCase() === "snippet" ||
    type.name.toLowerCase() === "command"
  );
}

export function isFileType(type: ItemTypeInfo | null): boolean {
  if (!type) return false;
  return type.icon === "file" || type.icon === "image";
}

