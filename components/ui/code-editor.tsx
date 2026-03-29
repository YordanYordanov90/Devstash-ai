"use client";

import { useMemo } from "react";
import Editor from "@monaco-editor/react";
import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";

import { cn } from "@/lib/utils";

// Point the loader at the locally installed monaco-editor package
// instead of the CDN default (https://cdn.jsdelivr.net/…).
// This must run at module level so it's set before loader.init() is called
// by @monaco-editor/react. Since this file is only loaded via dynamic import
// with ssr: false in ItemDrawer, it will never run server-side.
loader.config({ monaco });

type CodeEditorProps = {
  value: string;
  language: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
  onChange?: (value: string) => void;
};

export function CodeEditor({
  value,
  language,
  readOnly = false,
  height = "60vh",
  className,
  onChange,
}: CodeEditorProps) {
  const options = useMemo(
    () => ({
      minimap: { enabled: false },
      wordWrap: "on" as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      fontSize: 13,
      lineNumbers: "on" as const,
      readOnly,
      scrollbar: {
        useShadows: false,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
    }),
    [readOnly]
  );

  return (
    <div className={cn("rounded-lg border border-white/10 bg-muted/20", className)}>
      <Editor
        value={value}
        language={language}
        theme="vs-dark"
        height={height}
        options={options}
        onChange={
          readOnly
            ? undefined
            : (nextValue) => {
                if (!onChange) return;
                onChange(nextValue ?? "");
              }
        }
      />
    </div>
  );
}
