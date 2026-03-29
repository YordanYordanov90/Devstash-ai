"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, FileIcon, Pencil, Pin, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";

// Dynamic import with ssr: false prevents monaco-editor from running server-side.
// The loader.config({ monaco }) inside code-editor.tsx only executes in the browser.
const CodeEditor = dynamic(
  () => import("@/components/ui/code-editor").then((m) => ({ default: m.CodeEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[60vh] animate-pulse rounded-lg border border-white/10 bg-muted/20" />
    ),
  }
);
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { XIcon } from "lucide-react";

import type { ItemDrawerData, ItemTypeInfo } from "@/types/dashboard";
import {
  itemTypeIcons,
  itemTypeTextColors,
} from "@/lib/dashboard/item-type-meta";
import {
  addTagToItemAction,
  deleteItemAction,
  removeTagFromItemAction,
  toggleFavoriteAction,
  togglePinAction,
  updateItemAction,
  type DrawerActionState,
} from "@/app/actions/items";
import { r2KeyToDownloadPath } from "@/lib/r2/download-path";

interface ItemDrawerProps {
  isOpen: boolean;
  itemTypes: ItemTypeInfo[];
  item: ItemDrawerData | null;
}

const initialActionState: DrawerActionState = { success: true };

function isNextRedirectError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const digest = (err as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

export function ItemDrawer({ isOpen, itemTypes, item }: ItemDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const CLOSE_ANIMATION_MS = 300;

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editTitle, setEditTitle] = useState(item?.title ?? "");
  const [editDescription, setEditDescription] = useState(item?.description ?? "");
  const [editContent, setEditContent] = useState(item?.content ?? "");
  const [editUrl, setEditUrl] = useState(item?.url ?? "");
  const [editLanguage, setEditLanguage] = useState<CodeLanguage>(
    (item?.language as CodeLanguage | null) ?? DEFAULT_CODE_LANGUAGE
  );
  const [editContentFormat, setEditContentFormat] = useState<ContentFormat>(() => {
    if (isCodeLikeType(item?.type ?? null)) {
      return item?.language ? "code" : "plain";
    }
    return item?.language === "plaintext" ? "plain" : "markdown";
  });

  useEffect(() => {
    if (item) {
      setEditTitle(item.title ?? "");
      setEditDescription(item.description ?? "");
      setEditContent(item.content ?? "");
      setEditUrl(item.url ?? "");
      setEditLanguage((item.language as CodeLanguage | null) ?? DEFAULT_CODE_LANGUAGE);
      setEditContentFormat(() => {
        if (isCodeLikeType(item.type)) {
          return item.language ? "code" : "plain";
        }
        return item.language === "plaintext" ? "plain" : "markdown";
      });
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [item?.id]);

  const [tagInput, setTagInput] = useState("");

  const [updateState, updateAction] = useActionState(updateItemAction, initialActionState);
  const [addTagState, addTagAction] = useActionState(addTagToItemAction, initialActionState);
  const [removeTagState, removeTagAction] = useActionState(removeTagFromItemAction, initialActionState);

  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    const error =
      updateState.success === false
        ? updateState.error
        : addTagState.success === false
          ? addTagState.error
          : removeTagState.success === false
            ? removeTagState.error
          : null;
    if (!error) return;
    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;
    toast.error(error);
  }, [updateState, addTagState, removeTagState]);

  const [open, setOpen] = useState(isOpen);
  useEffect(() => {
    setOpen(isOpen);
    if (!isOpen) {
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (updateState.success === true) {
      setIsEditing(false);
    }
  }, [updateState]);

  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    if (!item) return;
    startDeleteTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("itemId", item.id);
        formData.append("returnTo", `${pathname}?${searchParams.toString()}`);
        await deleteItemAction(formData);
      } catch (err) {
        if (isNextRedirectError(err)) throw err;
        toast.error(err instanceof Error ? err.message : "Failed to delete item.");
      }
    });
  };

  const closeDrawer = () => {
    setOpen(false);
    window.setTimeout(() => {
      router.replace(pathname || "/dashboard");
    }, CLOSE_ANIMATION_MS);
  };
  const ItemIcon = item ? itemTypeIcons[item.type.icon] : null;
  const isCodeLikeItem = isCodeLikeType(item?.type ?? null);
  const isFileItem = isFileType(item?.type ?? null);

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : closeDrawer())}
      direction="right"
    >
      <DrawerContent className="w-full border border-white/10 bg-background/80 backdrop-blur-xl sm:max-w-xl">
        <DrawerHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <DrawerTitle className="min-w-0 truncate text-lg font-semibold">
                {item ? item.title : "Item"}
              </DrawerTitle>
              {item ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-2 bg-muted/40">
                    {item.type.icon in itemTypeIcons && ItemIcon ? (
                      <ItemIcon className={`size-4 ${itemTypeTextColors[item.type.icon]}`} />
                    ) : null}
                    {item.type.name === "URL" ? "Link" : item.type.name}
                  </Badge>
                  {item.contentType === "url" ? (
                    <Badge variant="secondary" className="bg-muted/40">
                      URL
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>

            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close drawer">
                <XIcon />
              </Button>
            </DrawerClose>
          </div>

          {item ? (
            <div className="flex flex-wrap items-center gap-2">
              <form action={toggleFavoriteAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`${pathname}?${searchParams.toString()}`}
                />
                <Button type="submit" variant="ghost" size="sm" className="gap-2">
                  <Star className={item.isFavorite ? "size-4 fill-amber-500 text-amber-500" : "size-4"} />
                  {item.isFavorite ? "Favorite" : "Favorite"}
                </Button>
              </form>
              <form action={togglePinAction}>
                <input type="hidden" name="itemId" value={item.id} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`${pathname}?${searchParams.toString()}`}
                />
                <Button type="submit" variant="ghost" size="sm" className="gap-2">
                  <Pin className={item.isPinned ? "size-4 fill-muted-foreground text-muted-foreground" : "size-4"} />
                  {item.isPinned ? "Pinned" : "Pin"}
                </Button>
              </form>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  const content = item.contentType === "url" ? (item.url ?? "") : (item.content ?? "");
                  if (!content) return;
                  void navigator.clipboard.writeText(content).then(
                    () => toast.success("Copied to clipboard"),
                    () => toast.error("Failed to copy")
                  );
                }}
              >
                Copy
              </Button>
              {!isFileItem && (
                <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => setIsEditing(true)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
              )}
              {!showDeleteConfirm ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-2 text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              ) : (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-destructive">Delete this item?</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Confirm"}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DrawerHeader>

        {item && !isEditing && (
          <div className="space-y-4">
            {item.description ? <p className="text-sm text-muted-foreground">{item.description}</p> : null}

            <div className="space-y-2">
              <p className="text-sm font-medium">Tags</p>
              {item.tags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tags yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag.id} className="inline-flex items-center gap-1">
                      <Badge variant="secondary" className="bg-muted/40">
                        {tag.name}
                      </Badge>
                      <form action={removeTagAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <input type="hidden" name="tagId" value={tag.id} />
                        <input
                          type="hidden"
                          name="returnTo"
                          value={`${pathname}?${searchParams.toString()}`}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-xs"
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Remove tag ${tag.name}`}
                        >
                          <X className="size-3" />
                        </Button>
                      </form>
                    </span>
                  ))}
                </div>
              )}

              <form
                action={(fd) => {
                  setTagInput("");
                  return addTagAction(fd);
                }}
                className="flex items-center gap-2"
              >
                <input type="hidden" name="itemId" value={item.id} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`${pathname}?${searchParams.toString()}`}
                />
                <Input
                  name="tagName"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag…"
                />
                <Button type="submit" variant="outline">
                  Add
                </Button>
              </form>
            </div>

            {item.contentType === "url" ? (
              item.url ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">URL</p>
                  <Link
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline break-all"
                  >
                    {item.url}
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No URL saved.</p>
              )
            ) : item.contentType === "file" ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">File</p>
                {item.fileUrl ? (
                  <div className="space-y-3">
                    {item.fileName && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.fileName) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r2KeyToDownloadPath(item.fileUrl)}
                        alt={item.fileName}
                        className="max-h-[40vh] rounded-lg object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-muted/25 p-4">
                        <FileIcon className="size-8 text-muted-foreground" />
                        <span className="text-sm">{item.fileName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.fileSize ? formatFileSize(item.fileSize) : null}
                      </span>
                    </div>
                    <a href={r2KeyToDownloadPath(item.fileUrl)} download={item.fileName ?? "download"}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="size-4" />
                        Download
                      </Button>
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No file saved.</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Content</p>
                {item.content ? (
                  isCodeLikeItem ? (
                    item.language ? (
                      <CodeEditor
                        value={item.content}
                        language={
                          (CODE_LANGUAGE_OPTIONS.includes(item.language as CodeLanguage)
                            ? item.language
                            : DEFAULT_CODE_LANGUAGE) as CodeLanguage
                        }
                        readOnly
                        height="60vh"
                      />
                    ) : (
                      <pre className="max-h-[60vh] overflow-auto rounded-lg border border-white/10 bg-muted/25 p-3 text-sm font-mono whitespace-pre">
                        {item.content}
                      </pre>
                    )
                  ) : (
                    item.language === "plaintext" ? (
                      <pre className="max-h-[60vh] overflow-auto rounded-lg border border-white/10 bg-muted/25 p-3 text-sm font-mono whitespace-pre-wrap">
                        {item.content}
                      </pre>
                    ) : (
                      <Markdown content={item.content} />
                    )
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">No content saved.</p>
                )}
              </div>
            )}
          </div>
        )}

        {isEditing && item && (
          <form action={updateAction} className="space-y-4">
            <input type="hidden" name="itemId" value={item.id} />

            <div className="space-y-1">
              <label className="text-sm font-medium">Title</label>
              <Input
                name="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="min-h-[80px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            {item.contentType === "url" ? (
              <div className="space-y-1">
                <label className="text-sm font-medium">URL</label>
                <Input
                  name="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://example.com"
                />
                <input type="hidden" name="content" value={editContent} />
              </div>
            ) : item.contentType === "file" ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">File</p>
                <p className="text-sm text-muted-foreground">
                  File items are read-only. Delete and re-upload to replace.
                </p>
                <input type="hidden" name="content" value={editContent} />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-sm font-medium">Content format</label>
                <select
                  name="contentFormat"
                  value={editContentFormat}
                  onChange={(e) => setEditContentFormat(e.target.value as ContentFormat)}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  {isCodeLikeItem ? (
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

                {editContentFormat === "code" ? (
                  <>
                    <label className="text-sm font-medium">Language</label>
                    <select
                      name="language"
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value as CodeLanguage)}
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                    >
                      {CODE_LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>

                    <label className="text-sm font-medium">Content</label>
                    <CodeEditor
                      value={editContent}
                      language={editLanguage}
                      onChange={(next) => setEditContent(next)}
                      height="60vh"
                    />
                    <input type="hidden" name="content" value={editContent} />
                    <input type="hidden" name="url" value={editUrl} />
                  </>
                ) : (
                  <>
                    <label className="text-sm font-medium">Content</label>
                    <textarea
                      name="content"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[220px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm whitespace-pre-wrap"
                    />
                    <input type="hidden" name="url" value={editUrl} />
                  </>
                )}
              </div>
            )}

            {updateState.success === false ? (
              <p className="text-sm text-destructive">{updateState.error}</p>
            ) : null}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                Save
              </Button>
            </div>
          </form>
        )}

        {!item ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Item not found.</p>
            <Button variant="outline" onClick={() => closeDrawer()}>
              Close
            </Button>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

