import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatTileProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: "primary" | "secondary" | "hint";
  className?: string;
  valueClassName?: string;
};

const accentStyles = {
  primary: "text-primary",
  secondary: "text-secondary",
  hint: "text-[color:var(--hint)]",
};

export function StatTile({
  label,
  value,
  icon: Icon,
  accent = "primary",
  className,
  valueClassName,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-muted/40 p-4 transition hover:bg-muted/60",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon aria-hidden="true" className={cn("size-4", accentStyles[accent])} />}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className={cn("mt-1 font-display text-2xl font-semibold tabular-nums", accentStyles[accent], valueClassName)}>
        {value}
      </p>
    </div>
  );
}
