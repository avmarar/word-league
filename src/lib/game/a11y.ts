import type { GuessRecord, TileState } from "@/lib/game/types";

const TILE_STATE_LABELS: Record<TileState, string> = {
  correct: "correct spot",
  present: "wrong spot",
  absent: "not in word",
};

export function tileAriaLabel(
  letter: string,
  state: TileState | "empty" | "current",
  revealed: boolean
): string {
  if (state === "empty" && !letter) {
    return "Empty";
  }

  if (state === "current") {
    return letter ? `${letter}, typing` : "Empty, active row";
  }

  if (!letter) {
    return "Empty";
  }

  if (!revealed) {
    return `${letter}, revealing`;
  }

  return `${letter}, ${TILE_STATE_LABELS[state as TileState]}`;
}

export function describeGuess(guess: GuessRecord): string {
  const counts = { correct: 0, present: 0, absent: 0 };

  for (const evaluation of guess.evaluation) {
    counts[evaluation] += 1;
  }

  const parts: string[] = [];
  if (counts.correct > 0) {
    parts.push(`${counts.correct} correct`);
  }
  if (counts.present > 0) {
    parts.push(`${counts.present} present`);
  }
  if (counts.absent > 0) {
    parts.push(`${counts.absent} absent`);
  }

  return `${guess.word}: ${parts.join(", ")}`;
}

export function describeGameResult(
  status: "won" | "lost",
  attempts: number
): string {
  if (status === "won") {
    return `You won in ${attempts} ${attempts === 1 ? "attempt" : "attempts"}.`;
  }
  return "Game over. Better luck next time.";
}
