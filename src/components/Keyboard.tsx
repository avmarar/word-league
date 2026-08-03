import type { TileState } from "@/lib/game/types";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

type KeyboardProps = {
  keyStates: Record<string, TileState | "unused">;
  onKey: (key: string) => void;
  disabled?: boolean;
};

function keyClass(state: TileState | "unused") {
  const base =
    "min-w-[2rem] rounded-md px-3 py-4 text-sm font-semibold uppercase transition sm:min-w-[2.5rem]";

  switch (state) {
    case "correct":
      return `${base} bg-emerald-500 text-white`;
    case "present":
      return `${base} bg-amber-500 text-white`;
    case "absent":
      return `${base} bg-zinc-700 text-white/80`;
    default:
      return `${base} bg-white/10 text-white hover:bg-white/20`;
  }
}

export function Keyboard({ keyStates, onKey, disabled }: KeyboardProps) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-2">
      {ROWS.map((row, rowIndex) => (
        <div key={row} className="flex justify-center gap-1.5">
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKey("Enter")}
              className="rounded-md bg-white/10 px-3 py-4 text-xs font-semibold uppercase text-white hover:bg-white/20 disabled:opacity-50"
            >
              Enter
            </button>
          )}
          {row.split("").map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onKey(key)}
              className={keyClass(keyStates[key] ?? "unused")}
            >
              {key}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKey("Backspace")}
              className="rounded-md bg-white/10 px-3 py-4 text-xs font-semibold uppercase text-white hover:bg-white/20 disabled:opacity-50"
            >
              Del
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
