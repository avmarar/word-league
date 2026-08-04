import type { TileState } from "@/lib/game/types";

export const TILE_STATE_CLASSES: Record<TileState, string> = {
  correct: "border-tile-correct bg-tile-correct text-white",
  present: "border-tile-present bg-tile-present text-white",
  absent: "border-tile-absent bg-tile-absent text-white/90",
};

export const TILE_EMPTY_CLASS =
  "border-[color:var(--tile-empty-border)] bg-transparent text-foreground/80";

export const TILE_CURRENT_CLASS =
  "border-tile-current bg-accent/30 text-foreground animate-tile-pop";

export const TILE_FLIPPING_CLASS =
  "flip-cell border-border bg-muted text-foreground";

export const KEYBOARD_UNUSED_CLASS =
  "bg-muted text-foreground hover:bg-accent hover:text-accent-foreground";

export function keyboardKeyClass(state: TileState | "unused"): string {
  if (state === "unused") {
    return KEYBOARD_UNUSED_CLASS;
  }
  return TILE_STATE_CLASSES[state];
}
