import type { Difficulty } from "@/lib/words/difficulty";
import { DIFFICULTY_LABELS } from "@/lib/words/difficulty";

const styles: Record<Difficulty, string> = {
  easy: "bg-emerald-400/20 text-emerald-200",
  medium: "bg-amber-400/20 text-amber-200",
  hard: "bg-rose-400/20 text-rose-200",
};

type DifficultyBadgeProps = {
  difficulty: Difficulty;
  className?: string;
};

export function DifficultyBadge({ difficulty, className = "" }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[difficulty]} ${className}`}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}
