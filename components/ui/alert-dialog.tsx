"use client";

import * as React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function AlertDialog(props: React.ComponentProps<typeof Dialog>) {
  return <Dialog {...props} />;
}

function AlertDialogTrigger(props: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger {...props} />;
}

function AlertDialogContent(props: React.ComponentProps<typeof DialogContent>) {
  return <DialogContent {...props} />;
}

function AlertDialogHeader(props: React.ComponentProps<typeof DialogHeader>) {
  return <DialogHeader {...props} />;
}

function AlertDialogFooter(props: React.ComponentProps<typeof DialogFooter>) {
  return <DialogFooter {...props} />;
}

function AlertDialogTitle(props: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle {...props} />;
}

function AlertDialogDescription(props: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription {...props} />;
}

function AlertDialogCancel({
  children,
  ...props
}: React.ComponentProps<typeof DialogClose>) {
  return (
    <DialogClose render={<Button variant="outline" />} {...props}>
      {children}
    </DialogClose>
  );
}

function AlertDialogAction({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <Button type="button" variant="destructive" {...props}>
      {children}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
};

