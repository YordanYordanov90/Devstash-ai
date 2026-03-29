"use client";

import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        duration: 2500,
      }}
    />
  );
}

