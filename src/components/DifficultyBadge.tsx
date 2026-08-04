import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/lib/words/difficulty";
import { DIFFICULTY_LABELS } from "@/lib/words/difficulty";
import { cn } from "@/lib/utils";

const difficultyBadgeVariants = cva("font-semibold uppercase tracking-wide", {
  variants: {
    difficulty: {
      easy: "border-secondary/30 bg-secondary/15 text-secondary",
      medium: "border-[color:var(--hint)]/30 bg-[color:var(--hint)]/15 text-[color:var(--hint)]",
      hard: "border-destructive/30 bg-destructive/15 text-destructive",
    },
  },
});

type DifficultyBadgeProps = VariantProps<typeof difficultyBadgeVariants> & {
  difficulty: Difficulty;
  className?: string;
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(difficultyBadgeVariants({ difficulty }), className)}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </Badge>
  );
}
