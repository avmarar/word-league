export type Difficulty = "easy" | "medium" | "hard";

export type AnswerWord = {
  word: string;
  difficulty: Difficulty;
};

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: "Common everyday words — great for warming up.",
  medium: "Balanced vocabulary — the standard challenge.",
  hard: "Trickier, less common words — for word nerds.",
};

export function isDifficulty(value: string): value is Difficulty {
  return DIFFICULTIES.includes(value as Difficulty);
}
