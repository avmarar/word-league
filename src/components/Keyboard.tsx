import { CornerDownLeft, Delete } from "lucide-react";
import type { TileState } from "@/lib/game/types";
import { keyboardKeyClass } from "@/lib/game/tile-colors";
import { cn } from "@/lib/utils";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

type KeyboardProps = {
  keyStates: Record<string, TileState | "unused">;
  onKey: (key: string) => void;
  disabled?: boolean;
};

export function Keyboard({ keyStates, onKey, disabled }: KeyboardProps) {
  const keyBase =
    "min-h-11 min-w-[2rem] rounded-xl px-2.5 py-3 text-sm font-semibold uppercase shadow-sm transition active:scale-95 sm:min-w-[2.5rem]";

  return (
    <div
      className="z-40 flex w-full flex-col gap-2 max-md:sticky max-md:bottom-24 md:static md:max-w-none lg:mx-auto lg:max-w-lg"
      role="group"
      aria-label="On-screen keyboard"
    >
      {ROWS.map((row, rowIndex) => (
        <div key={row} className="flex justify-center gap-1.5">
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKey("Enter")}
              aria-label="Submit guess"
              className={cn(
                keyBase,
                "px-3",
                keyboardKeyClass("unused"),
                "disabled:opacity-50"
              )}
            >
              <CornerDownLeft className="mx-auto size-4" />
            </button>
          )}
          {row.split("").map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onKey(key)}
              aria-label={`Letter ${key}`}
              className={cn(keyBase, keyboardKeyClass(keyStates[key] ?? "unused"), "disabled:opacity-50")}
            >
              {key}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKey("Backspace")}
              aria-label="Delete letter"
              className={cn(
                keyBase,
                "px-3",
                keyboardKeyClass("unused"),
                "disabled:opacity-50"
              )}
            >
              <Delete className="mx-auto size-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function buildKeyStates(
  guesses: { word: string; evaluation: TileState[] }[]
): Record<string, TileState | "unused"> {
  const states: Record<string, TileState | "unused"> = {};
  const priority: Record<TileState, number> = {
    absent: 1,
    present: 2,
    correct: 3,
  };

  for (const guess of guesses) {
    for (let index = 0; index < guess.word.length; index += 1) {
      const letter = guess.word[index]!;
      const evaluation = guess.evaluation[index]!;
      const current = states[letter] ?? "unused";
      if (
        current === "unused" ||
        priority[evaluation] > priority[current as TileState]
      ) {
        states[letter] = evaluation;
      }
    }
  }

  return states;
}
