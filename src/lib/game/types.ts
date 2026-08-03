import type { Timestamp } from "firebase/firestore";
import type { Difficulty } from "@/lib/words/difficulty";

export type TimestampLike = Timestamp | { seconds: number; nanoseconds: number };

export type TileState = "correct" | "present" | "absent";

export type GuessRecord = {
  word: string;
  evaluation: TileState[];
};

export type GameStatus = "in_progress" | "won" | "lost";

export type GameDocument = {
  userId: string;
  dateKey: string;
  puzzleNumber: number;
  difficulty: Difficulty;
  guesses: GuessRecord[];
  status: GameStatus;
  startedAt: TimestampLike;
  finishedAt?: TimestampLike;
  durationMs?: number;
};

export type PracticeSessionDocument = {
  userId: string;
  difficulty: Difficulty;
  answer: string;
  guesses: GuessRecord[];
  status: GameStatus;
  startedAt: TimestampLike;
  finishedAt?: TimestampLike;
  durationMs?: number;
};

export type ScoreDocument = {
  userId: string;
  displayName: string;
  dateKey: string;
  won: boolean;
  attempts: number;
  durationMs: number;
  finishedAt: TimestampLike;
  shareGrid: string;
};

export type ProfileDocument = {
  nickname: string;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate?: string;
  gamesPlayed: number;
  gamesWon: number;
  updatedAt?: Timestamp;
};

export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;

export const artifactsCollection =
  process.env.NEXT_PUBLIC_FIREBASE_ARTIFACTS_COLLECTION ?? "artifacts";
export const namespace =
  process.env.NEXT_PUBLIC_APP_NAMESPACE ?? "word-league";
