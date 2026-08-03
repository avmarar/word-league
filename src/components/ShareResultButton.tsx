"use client";

import { useState } from "react";

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
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="btn-primary rounded-full bg-cyan-400 px-6 py-2 font-semibold transition hover:brightness-110"
    >
      {copied ? "Copied!" : "Share result"}
    </button>
  );
}
