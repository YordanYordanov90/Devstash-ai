"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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

import {
  createCollectionAction,
  type CollectionActionState,
} from "@/app/actions/collections";

interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialActionState: CollectionActionState = { success: false, error: "" };
const hasSubmitted = (state: CollectionActionState) => !(state.success === false && state.error === "");

export function CollectionDialog({ open, onOpenChange }: CollectionDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [state, action] = useActionState(createCollectionAction, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const handledSuccessRef = useRef(false);

  useEffect(() => {
    if (state.success !== true || !hasSubmitted(state)) return;
    if (handledSuccessRef.current) return;
    handledSuccessRef.current = true;
    toast.success("Collection created");
    // Full reload remounts the tree; avoid setState/onOpenChange here (React 19: no sync setState in effects).
    window.location.reload();
  }, [state]);

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
      setName("");
      setDescription("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Collection</DialogTitle>
          <DialogDescription>
            Create a new collection to organize your items.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={action} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="collection-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="collection-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., React Patterns"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="collection-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="collection-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="min-h-[80px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Collection</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
