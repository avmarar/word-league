import type { TileState } from "@/lib/game/types";
import { MAX_ATTEMPTS, WORD_LENGTH } from "@/lib/game/types";

type GameBoardProps = {
  guesses: { word: string; evaluation: TileState[] }[];
  currentGuess: string;
  shakeRow: number | null;
  revealRow: number | null;
  isComplete: boolean;
};

function tileClass(state: TileState | "empty" | "current", revealed: boolean) {
  const base =
    "flex h-14 w-14 items-center justify-center rounded-lg border text-xl font-bold uppercase sm:h-16 sm:w-16";

  if (!revealed && state !== "empty" && state !== "current") {
    return `${base} flip-cell border-white/20 bg-white/10 text-white`;
  }

  switch (state) {
    case "correct":
      return `${base} border-emerald-500 bg-emerald-500 text-white`;
    case "present":
      return `${base} border-amber-500 bg-amber-500 text-white`;
    case "absent":
      return `${base} border-zinc-600 bg-zinc-600 text-white`;
    case "current":
      return `${base} border-cyan-400/60 bg-white/5 text-white`;
    default:
      return `${base} border-white/15 bg-transparent text-white/80`;
  }
}

export function GameBoard({
  guesses,
  currentGuess,
  shakeRow,
  revealRow,
  isComplete,
}: GameBoardProps) {
  const activeRow = isComplete ? -1 : guesses.length;

  return (
    <div className="flex flex-col items-center gap-2">
      {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
        const guessRecord = guesses[rowIndex];
        const isActive = rowIndex === activeRow;
        const isShaking = shakeRow === rowIndex;
        const isRevealing = revealRow === rowIndex;

        return (
          <div
            key={rowIndex}
            className={`flex gap-2 ${isShaking ? "animate-shake" : ""}`}
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

              return (
                <div
                  key={colIndex}
                  className={tileClass(state, revealed)}
                  style={
                    isRevealing
                      ? { animationDelay: `${colIndex * 100}ms` }
                      : undefined
                  }
                >
                  {letter}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
