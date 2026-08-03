import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getAnswerWords,
  getAllowedWords,
} from "../src/lib/words/loader";
import { isDifficulty } from "../src/lib/words/difficulty";

const WORD_PATTERN = /^[A-Z]{5}$/;

function loadRawAnswers(): Array<string | { word: string; difficulty: string }> {
  const filePath = join(process.cwd(), "data", "answers.json");
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as {
    words: Array<string | { word: string; difficulty: string }>;
  };
  return parsed.words;
}

function loadRawAllowed(): string[] {
  const filePath = join(process.cwd(), "data", "allowed.json");
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as { words: string[] };
  return parsed.words;
}

function main() {
  const answers = loadRawAnswers();
  const allowed = loadRawAllowed();
  const seen = new Set<string>();

  for (const entry of answers) {
    const word = typeof entry === "string" ? entry : entry.word;
    const upper = word.toUpperCase();

    if (!WORD_PATTERN.test(upper)) {
      throw new Error(`answers: invalid word "${word}"`);
    }

    if (seen.has(upper)) {
      throw new Error(`answers: duplicate word "${upper}"`);
    }

    if (typeof entry !== "string" && !isDifficulty(entry.difficulty)) {
      throw new Error(`answers: invalid difficulty for "${upper}"`);
    }

    seen.add(upper);
  }

  for (const word of allowed) {
    const upper = word.toUpperCase();
    if (!WORD_PATTERN.test(upper)) {
      throw new Error(`allowed: invalid word "${word}"`);
    }
  }

  const allowedSet = getAllowedWords();
  for (const entry of getAnswerWords()) {
    if (!allowedSet.has(entry.word)) {
      throw new Error(`Answer "${entry.word}" is missing from allowed.json`);
    }
  }

  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const entry of getAnswerWords()) {
    counts[entry.difficulty] += 1;
  }

  console.log(
    `Validated ${answers.length} answers (${counts.easy} easy, ${counts.medium} medium, ${counts.hard} hard) and ${allowed.length} allowed words.`
  );
}

main();
