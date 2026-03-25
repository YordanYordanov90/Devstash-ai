import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthView } from "@neondatabase/auth/react/ui";
import { authViewPaths } from "@neondatabase/auth/react/ui/server";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  return (
    <AuthPageShell>
      
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 p-6">
        <Badge
          variant="secondary"
          className="shrink-0 bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30 self-start"
        >
          <Sparkles className="size-3 mr-1" />
          Your Developer Knowledge Hub
        </Badge>
        <div className="w-full">
          <AuthView pathname={path} />
        </div>
      </div>
    </AuthPageShell>
  );
}

