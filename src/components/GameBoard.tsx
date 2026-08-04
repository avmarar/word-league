import type { TileState } from "@/lib/game/types";
import { MAX_ATTEMPTS, WORD_LENGTH } from "@/lib/game/types";
import { tileAriaLabel } from "@/lib/game/a11y";
import {
  TILE_CURRENT_CLASS,
  TILE_EMPTY_CLASS,
  TILE_FLIPPING_CLASS,
  TILE_STATE_CLASSES,
} from "@/lib/game/tile-colors";
import { cn } from "@/lib/utils";

type GameBoardProps = {
  guesses: { word: string; evaluation: TileState[] }[];
  currentGuess: string;
  shakeRow: number | null;
  revealRow: number | null;
  isComplete: boolean;
  compact?: boolean;
  celebrateRow?: number | null;
};

function tileClass(
  state: TileState | "empty" | "current",
  revealed: boolean,
  isPop: boolean
) {
  const base = "game-tile h-14 w-14 text-xl md:h-[4.25rem] md:w-[4.25rem] lg:h-16 lg:w-16";

  if (!revealed && state !== "empty" && state !== "current") {
    return cn(base, TILE_FLIPPING_CLASS);
  }

  switch (state) {
    case "correct":
    case "present":
    case "absent":
      return cn(base, TILE_STATE_CLASSES[state]);
    case "current":
      return cn(base, TILE_CURRENT_CLASS, isPop && "animate-tile-pop");
    default:
      return cn(base, TILE_EMPTY_CLASS);
  }
}

export function GameBoard({
  guesses,
  currentGuess,
  shakeRow,
  revealRow,
  isComplete,
  compact = false,
  celebrateRow = null,
}: GameBoardProps) {
  const activeRow = isComplete ? -1 : guesses.length;
  const rowCount = compact ? Math.max(guesses.length, 1) : MAX_ATTEMPTS;

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="grid"
      aria-label="Game board"
    >
      {Array.from({ length: rowCount }).map((_, rowIndex) => {
        const guessRecord = guesses[rowIndex];
        const isActive = rowIndex === activeRow;
        const isShaking = shakeRow === rowIndex;
        const isRevealing = revealRow === rowIndex;
        const isCelebrating = celebrateRow === rowIndex;

        return (
          <div
            key={rowIndex}
            role="row"
            className={cn(
              "flex gap-2",
              isShaking && "animate-shake",
              isCelebrating && "animate-celebrate rounded-xl"
            )}
          >
            {Array.from({ length: WORD_LENGTH }).map((__, colIndex) => {
              let state: TileState | "empty" | "current" = "empty";
              let letter = "";

              if (guessRecord) {
                letter = guessRecord.word[colIndex] ?? "";
                state = guessRecord.evaluation[colIndex] ?? "absent";
              } else if (isActive) {
                letter = currentGuess[colIndex] ?? "";
                state = letter ? "current" : "empty";
              }

              const revealed = Boolean(guessRecord) && !isRevealing;
              const isPop =
                isActive &&
                letter === currentGuess[colIndex] &&
                currentGuess.length === colIndex + 1;

              return (
                <div
                  key={colIndex}
                  role="gridcell"
                  aria-label={tileAriaLabel(letter, state, revealed)}
                  className={tileClass(state, revealed, Boolean(isPop))}
                  style={
                    isRevealing
                      ? { animationDelay: `${colIndex * 100}ms` }
                      : undefined
                  }
                >
                  <span aria-hidden="true">{letter}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
