"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { GameBoard } from "@/components/GameBoard";
import { buildKeyStates, Keyboard } from "@/components/Keyboard";
import { GameStatusBar } from "@/components/GameStatusBar";
import { ShareResultButton } from "@/components/ShareResultButton";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import type { GameStatus, GuessRecord, TileState } from "@/lib/game/types";
import { MAX_ATTEMPTS, WORD_LENGTH } from "@/lib/game/types";
import type { Difficulty } from "@/lib/words/difficulty";

export type GamePlayState = {
  puzzleNumber?: number;
  difficulty?: Difficulty;
  maxAttempts: number;
  wordLength: number;
  guesses: GuessRecord[];
  status: GameStatus;
  durationMs: number | null;
  shareGrid: string | null;
  hintUsed?: boolean;
  hint?: string | null;
};

type GamePlayPanelProps = {
  game: GamePlayState;
  mode: "daily" | "practice";
  onSubmitGuess: (guess: string) => Promise<{
    guesses: GuessRecord[];
    status: GameStatus;
    durationMs: number | null;
    shareGrid: string | null;
  }>;
  onRequestHint?: () => Promise<{ hintUsed: boolean; hint: string | null }>;
  onPlayAgain?: () => void;
  playAgainLabel?: string;
};

export function GamePlayPanel({
  game,
  mode,
  onSubmitGuess,
  onRequestHint,
  onPlayAgain,
  playAgainLabel = "Play again",
}: GamePlayPanelProps) {
  const [guesses, setGuesses] = useState(game.guesses);
  const [status, setStatus] = useState(game.status);
  const [durationMs, setDurationMs] = useState<number | null>(game.durationMs);
  const [shareGrid, setShareGrid] = useState<string | null>(game.shareGrid);
  const [hintUsed, setHintUsed] = useState(game.hintUsed ?? false);
  const [hint, setHint] = useState<string | null>(game.hint ?? null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [startedAt] = useState(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    setGuesses(game.guesses);
    setStatus(game.status);
    setDurationMs(game.durationMs);
    setShareGrid(game.shareGrid);
    setHintUsed(game.hintUsed ?? false);
    setHint(game.hint ?? null);
  }, [game]);

  useEffect(() => {
    if (status !== "in_progress") {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status, startedAt]);

  const submitGuess = useCallback(async () => {
    if (status !== "in_progress" || submitting) {
      return;
    }

    if (currentGuess.length !== WORD_LENGTH) {
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }

    setSubmitting(true);
    setError(null);
    setRevealRow(guesses.length);

    try {
      const result = await onSubmitGuess(currentGuess);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setGuesses(result.guesses);
      setStatus(result.status);
      setDurationMs(result.durationMs);
      setShareGrid(result.shareGrid);
      setCurrentGuess("");
      setRevealRow(null);
    } catch (submitError) {
      setRevealRow(null);
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit guess.";
      if (message === "Not in word list.") {
        setShakeRow(guesses.length);
        setTimeout(() => setShakeRow(null), 500);
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [status, submitting, currentGuess, guesses.length, onSubmitGuess]);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "in_progress" || submitting) {
        return;
      }

      if (key === "Enter") {
        void submitGuess();
        return;
      }

      if (key === "Backspace") {
        setCurrentGuess((previous) => previous.slice(0, -1));
        return;
      }

      if (/^[A-Z]$/.test(key)) {
        setCurrentGuess((previous) =>
          previous.length < WORD_LENGTH ? previous + key : previous
        );
      }
    },
    [status, submitting, submitGuess]
  );

  useEffect(() => {
    if (status !== "in_progress" || submitting) {
      return;
    }

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }
      return Boolean(
        target.closest("input, textarea, select, [contenteditable='true']")
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        void submitGuess();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        handleKey("Backspace");
        return;
      }

      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        handleKey(event.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, submitting, submitGuess, handleKey]);

  const handleHint = async () => {
    if (!onRequestHint || hintUsed || loadingHint || status !== "in_progress") {
      return;
    }

    setLoadingHint(true);
    setError(null);

    try {
      const result = await onRequestHint();
      setHintUsed(result.hintUsed);
      setHint(result.hint);
    } catch (hintError) {
      setError(
        hintError instanceof Error ? hintError.message : "Unable to fetch hint."
      );
    } finally {
      setLoadingHint(false);
    }
  };

  const isComplete = status !== "in_progress";

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        {mode === "daily" && game.puzzleNumber !== undefined && (
          <p className="text-sm text-white/60">
            Daily puzzle #{game.puzzleNumber}
          </p>
        )}
        {mode === "practice" && (
          <p className="text-sm text-white/60">Practice mode</p>
        )}
        {game.difficulty && <DifficultyBadge difficulty={game.difficulty} />}
      </div>

      <GameStatusBar
        puzzleNumber={game.puzzleNumber}
        attemptsUsed={guesses.length}
        maxAttempts={MAX_ATTEMPTS}
        elapsedMs={isComplete ? (durationMs ?? elapsedMs) : elapsedMs}
        status={status}
        mode={mode}
      />

      <GameBoard
        guesses={guesses}
        currentGuess={currentGuess}
        shakeRow={shakeRow}
        revealRow={revealRow}
        isComplete={isComplete}
      />

      {!isComplete && (
        <>
          <Keyboard
            keyStates={buildKeyStates(guesses)}
            onKey={handleKey}
            disabled={submitting}
          />

          {onRequestHint && (
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => void handleHint()}
                disabled={hintUsed || loadingHint || submitting}
                className="rounded-full border border-amber-400/30 bg-amber-400/10 px-5 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingHint
                  ? "Loading hint…"
                  : hintUsed
                    ? "Hint used"
                    : "Get hint"}
              </button>

              {hint && (
                <div className="w-full rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">
                    Word meaning
                  </p>
                  <p className="mt-2 leading-relaxed">{hint}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {error && <p className="text-center text-sm text-red-300">{error}</p>}

      {isComplete && (
        <div className="rounded-3xl border border-white/5 bg-white/[0.04] p-6 text-center">
          <h2 className="text-2xl font-semibold">
            {status === "won" ? "Nice work!" : "Keep practicing"}
          </h2>
          <p className="mt-2 text-white/70">
            {status === "won"
              ? mode === "daily"
                ? `You solved today's puzzle in ${guesses.length} tries.`
                : `You solved this ${game.difficulty} word in ${guesses.length} tries.`
              : mode === "daily"
                ? "Today's word got away. Try practice mode or come back tomorrow."
                : "Try another word at this level or pick a different difficulty."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {mode === "daily" && (
              <>
                <ShareResultButton shareGrid={shareGrid} />
                <Link
                  href="/leaderboard"
                  className="rounded-full border border-white/10 px-6 py-2 text-sm font-semibold !text-white hover:bg-white/5"
                >
                  View leaderboard
                </Link>
              </>
            )}
            {mode === "practice" && onPlayAgain && (
              <button
                type="button"
                onClick={onPlayAgain}
                className="btn-primary rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 px-6 py-2 font-semibold transition hover:brightness-110"
              >
                {playAgainLabel}
              </button>
            )}
            {mode === "practice" && (
              <Link
                href="/practice"
                className="rounded-full border border-white/10 px-6 py-2 text-sm font-semibold !text-white hover:bg-white/5"
              >
                Change difficulty
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
