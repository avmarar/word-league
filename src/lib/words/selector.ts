import type { AnswerWord, Difficulty } from "./difficulty";
import { DIFFICULTIES } from "./difficulty";

export function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getDailyDifficulty(dateKey: string): Difficulty {
  const index = hashString(`${dateKey}:difficulty`) % DIFFICULTIES.length;
  return DIFFICULTIES[index]!;
}

export function getDailyWord(dateKey: string, answers: AnswerWord[]): string {
  const difficulty = getDailyDifficulty(dateKey);
  const pool = answers.filter((entry) => entry.difficulty === difficulty);

  if (pool.length === 0) {
    throw new Error(`No daily words available for ${difficulty} difficulty.`);
  }

  const index = hashString(dateKey) % pool.length;
  return pool[index]!.word;
}

export function getPuzzleNumber(dateKey: string, epochDateKey = "2026-01-01"): number {
  const start = parseDateKey(epochDateKey);
  const current = parseDateKey(dateKey);
  const diffMs = current.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, day));
}
