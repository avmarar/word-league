import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AnswerWord, Difficulty } from "./difficulty";
import { isDifficulty } from "./difficulty";

let cachedAnswers: AnswerWord[] | null = null;
let cachedAllowed: Set<string> | null = null;

function loadJsonWords(filename: string): string[] {
  const filePath = join(process.cwd(), "data", filename);
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as { words: string[] };
  return parsed.words.map((word) => word.toUpperCase());
}

function loadAnswerWords(): AnswerWord[] {
  const filePath = join(process.cwd(), "data", "answers.json");
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as {
    words: Array<string | AnswerWord>;
  };

  return parsed.words.map((entry) => {
    if (typeof entry === "string") {
      return { word: entry.toUpperCase(), difficulty: "medium" as const };
    }
    return {
      word: entry.word.toUpperCase(),
      difficulty: isDifficulty(entry.difficulty) ? entry.difficulty : "medium",
    };
  });
}

export function getAnswerWords(): AnswerWord[] {
  if (!cachedAnswers) {
    cachedAnswers = loadAnswerWords();
  }
  return cachedAnswers;
}

export function getAnswerWordsByDifficulty(difficulty: Difficulty): AnswerWord[] {
  return getAnswerWords().filter((entry) => entry.difficulty === difficulty);
}

export function getAllowedWords(): Set<string> {
  if (!cachedAllowed) {
    cachedAllowed = new Set(loadJsonWords("allowed.json"));
  }
  return cachedAllowed;
}

export function isAllowedGuess(word: string): boolean {
  return getAllowedWords().has(word.toUpperCase());
}

export function getRandomPracticeWord(difficulty: Difficulty): string {
  const pool = getAnswerWordsByDifficulty(difficulty);
  if (pool.length === 0) {
    throw new Error(`No words available for ${difficulty} difficulty.`);
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index]!.word;
}
