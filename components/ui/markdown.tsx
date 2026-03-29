"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          code({ className, children, ...props }) {
            const isBlock = typeof className === "string" && className.includes("language-");
            if (!isBlock) {
              return (
                <code
                  className={cn(
                    "rounded bg-muted/40 px-1 py-0.5 font-mono text-[0.9em]",
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <pre className="max-h-[60vh] overflow-auto rounded-md border bg-muted/30 p-3 text-sm">
                <code className={cn("font-mono", className)} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          pre({ children }) {
            // We handle block code styling in `code`.
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

