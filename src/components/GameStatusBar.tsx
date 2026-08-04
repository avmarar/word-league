import { Clock3, Hash, ListChecks, Sparkles } from "lucide-react";
import { formatDuration } from "@/lib/dates";
import type { GameStatus } from "@/lib/game/types";
import { cn } from "@/lib/utils";

type GameStatusBarProps = {
  puzzleNumber?: number;
  attemptsUsed: number;
  maxAttempts: number;
  elapsedMs: number;
  status: GameStatus;
  mode?: "daily" | "practice";
};

const statusStyles: Record<GameStatus, string> = {
  in_progress: "text-primary",
  won: "text-secondary",
  lost: "text-destructive",
};

export function GameStatusBar({
  puzzleNumber,
  attemptsUsed,
  maxAttempts,
  elapsedMs,
  status,
  mode = "daily",
}: GameStatusBarProps) {
  const items = [
    mode === "daily" && puzzleNumber !== undefined
      ? { label: "Puzzle", value: `#${puzzleNumber}`, icon: Hash }
      : mode === "practice"
        ? { label: "Mode", value: "Practice", icon: Sparkles }
        : null,
    { label: "Attempts", value: `${attemptsUsed}/${maxAttempts}`, icon: ListChecks },
    { label: "Time", value: formatDuration(elapsedMs), icon: Clock3 },
    {
      label: "Status",
      value: status.replace("_", " "),
      icon: Sparkles,
      valueClass: statusStyles[status],
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    valueClass?: string;
  }[];

  return (
    <dl className="flex flex-wrap items-stretch justify-between gap-2 rounded-2xl border border-border/60 bg-muted/30 p-2 text-sm">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-[4.5rem] flex-1 flex-col items-center rounded-xl bg-background/40 px-3 py-2"
        >
          <item.icon aria-hidden="true" className="mb-1 size-3.5 text-muted-foreground" />
          <dt className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd
            className={cn("font-display font-semibold capitalize", item.valueClass)}
            {...(item.label === "Status" ? { role: "status" as const } : {})}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
