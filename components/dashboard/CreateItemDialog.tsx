"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ItemTypeInfo } from "@/types/dashboard";
import { getItemTypesAction, createItemAction } from "@/app/actions/items";
import type { DrawerActionState } from "@/app/actions/items";
import { FileUpload } from "@/components/dashboard/FileUpload";

const CodeEditor = dynamic(
  () => import("@/components/ui/code-editor").then((m) => ({ default: m.CodeEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[60vh] animate-pulse rounded-lg border border-white/10 bg-muted/20" />
    ),
  }
);

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialActionState: DrawerActionState = { success: false, error: "" };
const hasSubmitted = (state: DrawerActionState) => !(state.success === false && state.error === "");

const CODE_LANGUAGE_OPTIONS = [
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

type CodeLanguage = (typeof CODE_LANGUAGE_OPTIONS)[number];
const DEFAULT_CODE_LANGUAGE: CodeLanguage = "typescript";

type ContentFormat = "markdown" | "plain" | "code";

function getIsUrlType(type: ItemTypeInfo): boolean {
  return type.name === "URL" || type.icon === "link";
}

function isCodeLikeType(type: ItemTypeInfo | null): boolean {
  if (!type) return false;
  return (
    type.icon === "code" ||
    type.icon === "terminal" ||
    type.name.toLowerCase() === "snippet" ||
    type.name.toLowerCase() === "command"
  );
}

function isFileType(type: ItemTypeInfo | null): boolean {
  if (!type) return false;
  return type.icon === "file" || type.icon === "image";
}

export function CreateItemDialog({ open, onOpenChange }: CreateItemDialogProps) {
  const [itemTypes, setItemTypes] = useState<ItemTypeInfo[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const selectedType = useMemo(
    () => itemTypes.find((t) => t.id === selectedTypeId) ?? null,
    [itemTypes, selectedTypeId]
  );
  const selectedIsUrl = selectedType ? getIsUrlType(selectedType) : false;
  const selectedIsCodeLike = isCodeLikeType(selectedType);
  const selectedIsFile = isFileType(selectedType);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<CodeLanguage>(DEFAULT_CODE_LANGUAGE);
  const [contentFormat, setContentFormat] = useState<ContentFormat>("markdown");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

  const [state, action] = useActionState(createItemAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open && itemTypes.length === 0) {
      getItemTypesAction().then(setItemTypes).catch(() => {
        toast.error("Failed to load item types");
      });
    }
  }, [open, itemTypes.length]);

  useEffect(() => {
    if (selectedType) {
      setContentFormat(isCodeLikeType(selectedType) ? "code" : "markdown");
    }
  }, [selectedType]);

  useEffect(() => {
    if (state.success === true && hasSubmitted(state)) {
      toast.success("Item created");
      setTitle("");
      setDescription("");
      setContent("");
      setUrl("");
      setLanguage(DEFAULT_CODE_LANGUAGE);
      setContentFormat("markdown");
      setFileUrl("");
      setFileName("");
      setFileSize(0);
      onOpenChange(false);
      window.location.reload();
    }
  }, [state, onOpenChange]);

  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (state.success === false && hasSubmitted(state)) {
      const error = state.error;
      if (lastErrorRef.current === error) return;
      lastErrorRef.current = error;
      toast.error(error);
    }
  }, [state]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTitle("");
      setDescription("");
      setContent("");
      setUrl("");
      setFileUrl("");
      setFileName("");
      setFileSize(0);
    }
    onOpenChange(nextOpen);
  };

  const supportedTypes = useMemo(() => itemTypes, [itemTypes]);

  useEffect(() => {
    if (supportedTypes.length > 0 && !selectedTypeId) {
      setSelectedTypeId(supportedTypes[0].id);
    }
  }, [supportedTypes, selectedTypeId]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>
            Create a new item to save to your stash.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={action} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="item-type" className="text-sm font-medium">Type</label>
            <select
              id="item-type"
              name="typeId"
              value={selectedTypeId}
              onChange={(e) => setSelectedTypeId(e.target.value)}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {supportedTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name === "URL" ? "Link" : t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="item-title" className="text-sm font-medium">Title</label>
            <Input
              id="item-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React hooks cheat sheet"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="item-description" className="text-sm font-medium">Description</label>
            <textarea
              id="item-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="item-tags" className="text-sm font-medium">Tags</label>
            <Input
              id="item-tags"
              name="tagNames"
              placeholder="e.g. react, auth, hooks"
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas. New tags will be created automatically.
            </p>
          </div>

          {selectedIsUrl ? (
            <div className="space-y-1">
              <label htmlFor="item-url" className="text-sm font-medium">URL</label>
              <Input
                id="item-url"
                name="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
              />
              <input type="hidden" name="content" value={content} />
            </div>
          ) : selectedIsFile ? (
            <div className="space-y-1">
              <label className="text-sm font-medium">File</label>
              <FileUpload
                onFileChange={(key, name, size) => {
                  setFileUrl(key);
                  setFileName(name);
                  setFileSize(size);
                }}
                onClear={() => {
                  setFileUrl("");
                  setFileName("");
                  setFileSize(0);
                }}
              />
              <input type="hidden" name="fileUrl" value={fileUrl} />
              <input type="hidden" name="fileName" value={fileName} />
              <input type="hidden" name="fileSize" value={fileSize} />
              <input type="hidden" name="content" value={content} />
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="content-format" className="text-sm font-medium">Content format</label>
              <select
                id="content-format"
                name="contentFormat"
                value={contentFormat}
                onChange={(e) => setContentFormat(e.target.value as ContentFormat)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {selectedIsCodeLike ? (
                  <>
                    <option value="code">Code</option>
                    <option value="plain">Plain text</option>
                  </>
                ) : (
                  <>
                    <option value="markdown">Markdown</option>
                    <option value="plain">Plain text</option>
                  </>
                )}
              </select>

              {contentFormat === "code" ? (
                <>
                  <label htmlFor="content-language" className="text-sm font-medium">Language</label>
                  <select
                    id="content-language"
                    name="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  >
                    {CODE_LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>

                  <label htmlFor="item-content" className="text-sm font-medium">Content</label>
                  <CodeEditor
                    value={content}
                    language={language}
                    onChange={(next) => setContent(next ?? "")}
                    height="50vh"
                  />
                  <input type="hidden" name="content" value={content} />
                  <input type="hidden" name="url" value={url} />
                </>
              ) : (
                <>
                  <label htmlFor="item-content" className="text-sm font-medium">Content</label>
                  <textarea
                    id="item-content"
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm whitespace-pre-wrap"
                  />
                  <input type="hidden" name="url" value={url} />
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}