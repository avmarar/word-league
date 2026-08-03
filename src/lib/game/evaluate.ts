import type { TileState } from "./types";

export function evaluateGuess(answer: string, guess: string): TileState[] {
  const normalizedAnswer = answer.toUpperCase();
  const normalizedGuess = guess.toUpperCase();

  if (normalizedAnswer.length !== normalizedGuess.length) {
    throw new Error("Answer and guess must be the same length.");
  }

  const result: TileState[] = Array(normalizedAnswer.length).fill("absent");
  const answerCounts = new Map<string, number>();

  for (const letter of normalizedAnswer) {
    answerCounts.set(letter, (answerCounts.get(letter) ?? 0) + 1);
  }

  for (let index = 0; index < normalizedGuess.length; index += 1) {
    if (normalizedGuess[index] === normalizedAnswer[index]) {
      result[index] = "correct";
      answerCounts.set(
        normalizedGuess[index],
        (answerCounts.get(normalizedGuess[index]) ?? 0) - 1
      );
    }
  }

  for (let index = 0; index < normalizedGuess.length; index += 1) {
    if (result[index] === "correct") {
      continue;
    }

    const letter = normalizedGuess[index];
    const remaining = answerCounts.get(letter) ?? 0;

    if (remaining > 0) {
      result[index] = "present";
      answerCounts.set(letter, remaining - 1);
    }
  }

  return result;
}

export function evaluationToEmoji(evaluation: TileState[]): string {
  return evaluation
    .map((state) => {
      if (state === "correct") return "🟩";
      if (state === "present") return "🟨";
      return "⬛";
    })
    .join("");
}

export function buildShareGrid(
  puzzleNumber: number,
  guesses: { evaluation: TileState[] }[],
  won: boolean
): string {
  const header = `Word League #${puzzleNumber} ${won ? guesses.length : "X"}/${guesses.length > 0 ? 6 : 6}`;
  const rows = guesses.map((guess) => evaluationToEmoji(guess.evaluation));
  return [header, ...rows].join("\n");
}
