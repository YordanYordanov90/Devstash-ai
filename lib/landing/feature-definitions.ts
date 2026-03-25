import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Code,
  FileText,
  FolderOpen,
  Search,
  Terminal,
} from "lucide-react";

export interface LandingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  iconColor: string;
}

export const landingFeatures: LandingFeature[] = [
  {
    icon: Code,
    title: "Code Snippets",
    description:
      "Save reusable code with syntax highlighting, language detection, and instant copy. Never rewrite the same function twice.",
    color: "bg-amber-500/20",
    iconColor: "text-amber-500",
  },
  {
    icon: Bot,
    title: "AI Prompts",
    description:
      "Store and organize your best prompts for ChatGPT, Claude, and other AI tools. Build a personal prompt library.",
    color: "bg-orange-500/20",
    iconColor: "text-orange-500",
  },
  {
    icon: Search,
    title: "Instant Search",
    description:
      "Find anything in milliseconds. Search across all your items by content, tags, titles, or type with Cmd+K.",
    color: "bg-yellow-500/20",
    iconColor: "text-yellow-500",
  },
  {
    icon: Terminal,
    title: "Commands",
    description:
      "Keep your most-used terminal commands at your fingertips. No more digging through bash history.",
    color: "bg-amber-600/20",
    iconColor: "text-amber-600",
  },
  {
    icon: FileText,
    title: "Files & Docs",
    description:
      "Upload and manage files, images, and documents. Keep your project assets organized alongside your code.",
    color: "bg-orange-400/20",
    iconColor: "text-orange-400",
  },
  {
    icon: FolderOpen,
    title: "Collections",
    description:
      "Group related items into collections. Organize by project, topic, or workflow for quick access.",
    color: "bg-amber-400/20",
    iconColor: "text-amber-400",
  },
];
