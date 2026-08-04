"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ShareResultButtonProps = {
  shareGrid: string | null;
};

export function ShareResultButton({ shareGrid }: ShareResultButtonProps) {
  const [copied, setCopied] = useState(false);

  if (!shareGrid) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareGrid);
      setCopied(true);
      toast.success("Result copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy result.");
      setCopied(false);
    }
  };

  return (
    <Button size="lg" className="rounded-full px-6" onClick={handleCopy}>
      {copied ? "Copied!" : "Share result"}
    </Button>
  );
}
