import type { ReactNode } from "react";
import { Chrome, Code, Figma, FileText, Github, Layers, MessageSquare, Terminal } from "lucide-react";

export interface ToolIconConfig {
  id: string;
  icon: ReactNode;
  label: string;
  description: string;
  brandColor: string;
  brandColorLight: string;
  position: { x: number; y: number };
}

export const toolIcons: ToolIconConfig[] = [
  {
    id: "vscode",
    icon: <Code className="size-6" />,
    label: "VS Code",
    description: "Code editor with extensions, debugging, and Git integration",
    brandColor: "#0078D4",
    brandColorLight: "#0078D420",
    position: { x: 18, y: 20 },
  },
  {
    id: "notion",
    icon: <FileText className="size-6" />,
    label: "Notion",
    description: "All-in-one workspace for notes, docs, and wikis",
    brandColor: "#000000",
    brandColorLight: "#00000020",
    position: { x: 82, y: 18 },
  },
  {
    id: "terminal",
    icon: <Terminal className="size-6" />,
    label: "Terminal",
    description: "Command-line interface for scripts and system tasks",
    brandColor: "#4DA50D",
    brandColorLight: "#4DA50D20",
    position: { x: 50, y: 50 },
  },
  {
    id: "slack",
    icon: <MessageSquare className="size-6" />,
    label: "Slack",
    description: "Team communication and collaboration platform",
    brandColor: "#4A154B",
    brandColorLight: "#4A154B20",
    position: { x: 12, y: 55 },
  },
  {
    id: "github",
    icon: <Github className="size-6" />,
    label: "GitHub",
    description: "Code hosting, version control, and collaboration",
    brandColor: "#181717",
    brandColorLight: "#18171720",
    position: { x: 88, y: 55 },
  },
  {
    id: "chrome",
    icon: <Chrome className="size-6" />,
    label: "Chrome",
    description: "Browser for web browsing and development",
    brandColor: "#4285F4",
    brandColorLight: "#4285F420",
    position: { x: 50, y: 82 },
  },
  {
    id: "figma",
    icon: <Figma className="size-6" />,
    label: "Figma",
    description: "Design tool for creating and sharing designs",
    brandColor: "#F24E1E",
    brandColorLight: "#F24E1E20",
    position: { x: 18, y: 82 },
  },
  {
    id: "more",
    icon: <Layers className="size-6" />,
    label: "More...",
    description: "And many more tools scattered across your workflow",
    brandColor: "#6B7280",
    brandColorLight: "#6B728020",
    position: { x: 82, y: 82 },
  },
];