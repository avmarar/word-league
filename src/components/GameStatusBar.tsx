import { formatDuration } from "@/lib/dates";
import type { GameStatus } from "@/lib/game/types";

type GameStatusBarProps = {
  puzzleNumber?: number;
  attemptsUsed: number;
  maxAttempts: number;
  elapsedMs: number;
  status: GameStatus;
  mode?: "daily" | "practice";
};

export function GameStatusBar({
  puzzleNumber,
  attemptsUsed,
  maxAttempts,
  elapsedMs,
  status,
  mode = "daily",
}: GameStatusBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm">
      {mode === "daily" && puzzleNumber !== undefined && (
        <div>
          <p className="text-white/60">Puzzle</p>
          <p className="font-semibold text-white">#{puzzleNumber}</p>
        </div>
      )}
      {mode === "practice" && (
        <div>
          <p className="text-white/60">Mode</p>
          <p className="font-semibold text-white">Practice</p>
        </div>
      )}
      <div>
        <p className="text-white/60">Attempts</p>
        <p className="font-semibold text-white">
          {attemptsUsed}/{maxAttempts}
        </p>
      </div>
      <div>
        <p className="text-white/60">Time</p>
        <p className="font-semibold text-white">{formatDuration(elapsedMs)}</p>
      </div>
      <div>
        <p className="text-white/60">Status</p>
        <p className="font-semibold capitalize text-cyan-200">
          {status.replace("_", " ")}
        </p>
      </div>
    </div>
  );
}
