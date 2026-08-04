import { randomUUID } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import {
  MAX_ATTEMPTS,
  WORD_LENGTH,
  type PracticeSessionDocument,
} from "@/lib/game/types";
import { getAdminFirestore } from "@/lib/firebase/admin";
import { buildShareGrid, evaluateGuess } from "@/lib/game/evaluate";
import { getRandomPracticeWord, isAllowedGuess } from "@/lib/words/loader";
import { getWordDefinition } from "@/lib/words/definitions";
import type { Difficulty } from "@/lib/words/difficulty";
import { isDifficulty } from "@/lib/words/difficulty";

export function serializePracticeSession(
  session: PracticeSessionDocument,
  sessionId: string
) {
  return {
    sessionId,
    difficulty: session.difficulty,
    maxAttempts: MAX_ATTEMPTS,
    wordLength: WORD_LENGTH,
    guesses: session.guesses,
    status: session.status,
    durationMs: session.durationMs ?? null,
    hintUsed: session.hintUsed ?? false,
    hint: session.hint ?? null,
    shareGrid:
      session.status !== "in_progress"
        ? buildShareGrid(0, session.guesses, session.status === "won").replace(
            "Word League #0",
            `Word League Practice (${session.difficulty})`
          )
        : null,
  };
}

export async function startPracticeSession(
  userId: string,
  difficulty: string
) {
  if (!isDifficulty(difficulty)) {
    throw new Error("Invalid difficulty level.");
  }

  const answer = getRandomPracticeWord(difficulty);
  const sessionId = randomUUID();
  const session: PracticeSessionDocument = {
    userId,
    difficulty,
    answer,
    guesses: [],
    status: "in_progress",
    startedAt: Timestamp.now(),
  };

  await getAdminFirestore()
    .doc(`practiceSessions/${sessionId}`)
    .set(session);

  return serializePracticeSession(session, sessionId);
}

export async function submitPracticeGuess(
  userId: string,
  sessionId: string,
  guess: string
) {
  const normalizedGuess = guess.trim().toUpperCase();

  if (normalizedGuess.length !== WORD_LENGTH) {
    throw new Error(`Guess must be ${WORD_LENGTH} letters.`);
  }

  if (!isAllowedGuess(normalizedGuess)) {
    throw new Error("Not in word list.");
  }

  const sessionRef = getAdminFirestore().doc(`practiceSessions/${sessionId}`);
  const snapshot = await sessionRef.get();

  if (!snapshot.exists) {
    throw new Error("Practice session not found.");
  }

  const session = snapshot.data() as PracticeSessionDocument;

  if (session.userId !== userId) {
    throw new Error("Practice session not found.");
  }

  if (session.status !== "in_progress") {
    throw new Error("This practice round is already complete.");
  }

  if (session.guesses.length >= MAX_ATTEMPTS) {
    throw new Error("No attempts remaining.");
  }

  const evaluation = evaluateGuess(session.answer, normalizedGuess);
  const guesses = [...session.guesses, { word: normalizedGuess, evaluation }];
  const won = evaluation.every((state) => state === "correct");
  const lost = !won && guesses.length >= MAX_ATTEMPTS;
  const status = won ? "won" : lost ? "lost" : "in_progress";
  const finishedAt = won || lost ? Timestamp.now() : undefined;
  const durationMs =
    finishedAt && session.startedAt
      ? finishedAt.toMillis() -
        ("toMillis" in session.startedAt
          ? session.startedAt.toMillis()
          : session.startedAt.seconds * 1000)
      : undefined;

  await sessionRef.update({
    guesses,
    status,
    ...(finishedAt ? { finishedAt } : {}),
    ...(durationMs !== undefined ? { durationMs } : {}),
  });

  const updatedSession: PracticeSessionDocument = {
    ...session,
    guesses,
    status,
    finishedAt,
    durationMs,
  };

  return {
    evaluation,
    ...serializePracticeSession(updatedSession, sessionId),
  };
}

export async function requestPracticeHint(userId: string, sessionId: string) {
  const sessionRef = getAdminFirestore().doc(`practiceSessions/${sessionId}`);
  const snapshot = await sessionRef.get();

  if (!snapshot.exists) {
    throw new Error("Practice session not found.");
  }

  const session = snapshot.data() as PracticeSessionDocument;

  if (session.userId !== userId) {
    throw new Error("Practice session not found.");
  }

  if (session.status !== "in_progress") {
    throw new Error("Hints are only available during an active game.");
  }

  if (session.hintUsed) {
    return {
      hintUsed: true,
      hint: session.hint ?? null,
    };
  }

  const hint = getWordDefinition(session.answer);

  await sessionRef.update({
    hintUsed: true,
    hint,
  });

  return {
    hintUsed: true,
    hint,
  };
}
