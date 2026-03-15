"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20">
            <FolderOpen className="size-5 text-primary" />
          </div>
          <span className="font-semibold text-foreground">DevStash</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="#features" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link 
            href="#pricing" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Button>
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground glow-coral"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
