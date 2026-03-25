import {
  Bot,
  Code,
  File,
  FileText,
  Image,
  Link as LinkIcon,
  Sparkles,
  StickyNote,
  Terminal,
} from "lucide-react";
import type { ComponentType } from "react";

import type { ItemTypeIcon } from "@/types/dashboard";

type IconComponent = ComponentType<{ className?: string }>;

export const itemTypeIcons: Record<ItemTypeIcon, IconComponent> = {
  code: Code,
  bot: Bot,
  "file-text": FileText,
  terminal: Terminal,
  file: File,
  image: Image,
  link: LinkIcon,
  sparkles: Sparkles,
  "sticky-note": StickyNote,
};

export const itemTypeTextColors: Record<ItemTypeIcon, string> = {
  code: "text-blue-400",
  bot: "text-purple-400",
  "file-text": "text-blue-400",
  terminal: "text-amber-400",
  file: "text-gray-400",
  image: "text-pink-400",
  link: "text-teal-400",
  sparkles: "text-purple-400",
  "sticky-note": "text-yellow-400",
};

export const itemTypeBorderColors: Record<ItemTypeIcon, string> = {
  code: "border-l-blue-500",
  bot: "border-l-purple-500",
  "file-text": "border-l-yellow-500",
  terminal: "border-l-orange-500",
  file: "border-l-gray-500",
  image: "border-l-pink-500",
  link: "border-l-teal-500",
  sparkles: "border-l-purple-500",
  "sticky-note": "border-l-yellow-500",
};

export const itemTypeBgColors: Record<ItemTypeIcon, string> = {
  code: "bg-blue-500/15",
  bot: "bg-purple-500/15",
  "file-text": "bg-blue-500/15",
  terminal: "bg-amber-500/15",
  file: "bg-gray-500/15",
  image: "bg-pink-500/15",
  link: "bg-teal-500/15",
  sparkles: "bg-purple-500/15",
  "sticky-note": "bg-yellow-500/15",
};

export const FALLBACK_ITEM_TYPE_ICON: ItemTypeIcon = "file";
