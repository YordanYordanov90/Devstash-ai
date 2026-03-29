"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MAX_FILE_SIZE } from "@/lib/r2/config";

interface FileUploadProps {
  /** R2 object key stored in DB `file_url`. */
  onFileChange: (storageKey: string, fileName: string, fileSize: number) => void;
  onClear?: () => void;
  className?: string;
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | {
      status: "preview";
      fileName: string;
      fileSize: number;
      previewObjectUrl: string | null;
    }
  | { status: "error"; error: string };

export function FileUpload({ onFileChange, onClear, className }: FileUploadProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);

  const revokePreview = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
    };
  }, []);

  const upload = useCallback(
    async (file: File) => {
      setState({ status: "uploading", progress: 0 });

      const formData = new FormData();
      formData.append("file", file);

      await new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();

        const fail = (message: string) => {
          setState({ status: "error", error: message });
          resolve();
        };

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setState({ status: "uploading", progress });
          }
        };

        xhr.onload = () => {
          if (xhr.status === 401) {
            fail("You must be signed in to upload.");
            return;
          }
          if (xhr.status < 200 || xhr.status >= 300) {
            let message = `Upload failed (HTTP ${xhr.status}).`;
            try {
              const body = JSON.parse(xhr.responseText) as { error?: string };
              if (body.error) message = body.error;
            } catch {
              /* keep generic */
            }
            fail(message);
            return;
          }

          let parsed: { key?: string };
          try {
            parsed = JSON.parse(xhr.responseText) as { key?: string };
          } catch {
            fail("Invalid server response.");
            return;
          }

          if (!parsed.key || typeof parsed.key !== "string") {
            fail("Invalid server response.");
            return;
          }

          const isImage = file.type.startsWith("image/");
          const previewObjectUrl = isImage ? URL.createObjectURL(file) : null;
          if (previewObjectUrlRef.current) {
            URL.revokeObjectURL(previewObjectUrlRef.current);
          }
          previewObjectUrlRef.current = previewObjectUrl;

          setState({
            status: "preview",
            fileName: file.name,
            fileSize: file.size,
            previewObjectUrl,
          });
          onFileChange(parsed.key, file.name, file.size);
          resolve();
        };

        xhr.onerror = () => {
          fail("Network error — could not reach the app. Check your connection.");
        };

        xhr.onabort = () => {
          fail("Upload cancelled.");
        };

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });
    },
    [onFileChange]
  );

  const handleFile = useCallback(
    (file: File) => {
      void upload(file);
    },
    [upload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    if (state.status === "preview") {
      revokePreview(state.previewObjectUrl);
    }
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
    setState({ status: "idle" });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onClear?.();
  }, [state, revokePreview, onClear]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImageFile = (fileName: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);

  if (state.status === "preview") {
    return (
      <div className={cn("relative rounded-lg border border-border bg-muted/20 p-4", className)}>
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-2 rounded-md p-1 hover:bg-muted"
        >
          <X className="size-4" />
        </button>
        <div className="flex items-center gap-3">
          {state.previewObjectUrl && isImageFile(state.fileName) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.previewObjectUrl}
              alt={state.fileName}
              className="size-16 rounded-md object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-md bg-muted">
              <FileIcon className="size-8 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{state.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(state.fileSize)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "uploading") {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border border-border bg-muted/20 p-8", className)}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Uploading... {state.progress}%</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className={cn("flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 p-4", className)}>
        <p className="text-sm text-destructive">{state.error}</p>
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-muted-foreground/50",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <Upload className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Drop a file here or click to upload</p>
        <p className="text-xs text-muted-foreground">
          Max {formatFileSize(MAX_FILE_SIZE)}. Files upload through the app (no R2 CORS setup required).
        </p>
      </div>
    </div>
  );
}
