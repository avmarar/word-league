import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  MAX_ATTEMPTS,
  WORD_LENGTH,
  type GameDocument,
  type ProfileDocument,
} from "@/lib/game/types";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { getDateKey, getYesterdayDateKey } from "@/lib/dates";
import { buildShareGrid, evaluateGuess } from "@/lib/game/evaluate";
import { getAnswerWords, isAllowedGuess } from "@/lib/words/loader";
import { getDailyDifficulty, getDailyWord, getPuzzleNumber } from "@/lib/words/selector";
import { getGameDocId, getProfilePath, getScoreDocId } from "@/lib/game/ids";

export { getGameDocId, getScoreDocId, getProfilePath };

export async function getProfile(userId: string): Promise<ProfileDocument | null> {
  const snapshot = await getAdminFirestore().doc(getProfilePath(userId)).get();
  if (!snapshot.exists) {
    return null;
  }
  return snapshot.data() as ProfileDocument;
}

export async function getOrCreateGame(
  userId: string,
  dateKey: string
): Promise<GameDocument> {
  const db = getAdminFirestore();
  const gameRef = db.doc(`games/${getGameDocId(userId, dateKey)}`);
  const existing = await gameRef.get();

  if (existing.exists) {
    const data = existing.data() as GameDocument;
    return {
      ...data,
      difficulty: data.difficulty ?? getDailyDifficulty(dateKey),
    };
  }

  const answers = getAnswerWords();
  const puzzleNumber = getPuzzleNumber(dateKey);
  const difficulty = getDailyDifficulty(dateKey);
  const game: GameDocument = {
    userId,
    dateKey,
    puzzleNumber,
    difficulty,
    guesses: [],
    status: "in_progress",
    startedAt: Timestamp.now(),
  };

  await gameRef.set(game);
  return game;
}

export function serializeGame(game: GameDocument) {
  return {
    puzzleNumber: game.puzzleNumber,
    dateKey: game.dateKey,
    difficulty: game.difficulty,
    maxAttempts: MAX_ATTEMPTS,
    wordLength: WORD_LENGTH,
    guesses: game.guesses,
    status: game.status,
    durationMs: game.durationMs ?? null,
    shareGrid: game.status !== "in_progress" ? buildShareGridFromGame(game) : null,
  };
}

function buildShareGridFromGame(game: GameDocument) {
  return buildShareGrid(
    game.puzzleNumber,
    game.guesses,
    game.status === "won"
  );
}

export async function submitGuess(
  userId: string,
  guess: string,
  displayName: string
) {
  const normalizedGuess = guess.trim().toUpperCase();

  if (normalizedGuess.length !== WORD_LENGTH) {
    throw new Error(`Guess must be ${WORD_LENGTH} letters.`);
  }

  if (!isAllowedGuess(normalizedGuess)) {
    throw new Error("Not in word list.");
  }

  const dateKey = getDateKey();
  const db = getAdminFirestore();
  const gameRef = db.doc(`games/${getGameDocId(userId, dateKey)}`);
  const gameSnapshot = await gameRef.get();

  if (!gameSnapshot.exists) {
    throw new Error("Start the game before submitting a guess.");
  }

  const game = gameSnapshot.data() as GameDocument;

  if (game.status !== "in_progress") {
    throw new Error("Today's puzzle is already complete.");
  }

  if (game.guesses.length >= MAX_ATTEMPTS) {
    throw new Error("No attempts remaining.");
  }

  const answer = getDailyWord(dateKey, getAnswerWords());
  const evaluation = evaluateGuess(answer, normalizedGuess);
  const guesses = [...game.guesses, { word: normalizedGuess, evaluation }];
  const won = evaluation.every((state) => state === "correct");
  const lost = !won && guesses.length >= MAX_ATTEMPTS;
  const status = won ? "won" : lost ? "lost" : "in_progress";
  const finishedAt = won || lost ? Timestamp.now() : undefined;
  const durationMs =
    finishedAt && game.startedAt
      ? finishedAt.toMillis() -
        ("toMillis" in game.startedAt
          ? game.startedAt.toMillis()
          : game.startedAt.seconds * 1000)
      : undefined;

  await gameRef.update({
    guesses,
    status,
    ...(finishedAt ? { finishedAt } : {}),
    ...(durationMs !== undefined ? { durationMs } : {}),
  });

  if (won || lost) {
    await finalizeScore({
      userId,
      displayName,
      dateKey,
      game: {
        ...game,
        guesses,
        status,
        finishedAt,
        durationMs,
      },
    });
  }

  return {
    evaluation,
    guesses,
    status,
    durationMs: durationMs ?? null,
    shareGrid:
      status !== "in_progress"
        ? buildShareGrid(game.puzzleNumber, guesses, won)
        : null,
  };
}

async function finalizeScore({
  userId,
  displayName,
  dateKey,
  game,
}: {
  userId: string;
  displayName: string;
  dateKey: string;
  game: GameDocument;
}) {
  const db = getAdminFirestore();
  const scoreRef = db.doc(`scores/${getScoreDocId(dateKey, userId)}`);
  const existingScore = await scoreRef.get();

  if (existingScore.exists) {
    return;
  }

  const won = game.status === "won";
  const finishedAt = game.finishedAt ?? Timestamp.now();
  const durationMs = game.durationMs ?? 0;

  await scoreRef.set({
    userId,
    displayName,
    dateKey,
    won,
    attempts: game.guesses.length,
    durationMs,
    finishedAt,
    shareGrid: buildShareGrid(game.puzzleNumber, game.guesses, won),
  });

  await updateProfileAfterGame(userId, dateKey, won);
}

async function updateProfileAfterGame(
  userId: string,
  dateKey: string,
  won: boolean
) {
  const db = getAdminFirestore();
  const profileRef = db.doc(getProfilePath(userId));
  const snapshot = await profileRef.get();
  const existing = (snapshot.data() as ProfileDocument | undefined) ?? {
    nickname: "Player",
    currentStreak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    gamesWon: 0,
  };

  if (existing.lastPlayedDate === dateKey) {
    return;
  }

  const yesterday = getYesterdayDateKey();
  let currentStreak = existing.currentStreak ?? 0;

  if (won) {
    currentStreak =
      existing.lastPlayedDate === yesterday ? currentStreak + 1 : 1;
  } else {
    currentStreak = 0;
  }

  const maxStreak = Math.max(existing.maxStreak ?? 0, currentStreak);

  await profileRef.set(
    {
      nickname: existing.nickname,
      currentStreak,
      maxStreak,
      lastPlayedDate: dateKey,
      gamesPlayed: (existing.gamesPlayed ?? 0) + 1,
      gamesWon: (existing.gamesWon ?? 0) + (won ? 1 : 0),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}
