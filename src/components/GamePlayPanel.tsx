"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb, PartyPopper, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GameBoard } from "@/components/GameBoard";
import { buildKeyStates, Keyboard } from "@/components/Keyboard";
import { GameStatusBar } from "@/components/GameStatusBar";
import { ShareResultButton } from "@/components/ShareResultButton";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { SectionCard } from "@/components/SectionCard";
import { describeGameResult, describeGuess } from "@/lib/game/a11y";
import type { GameStatus, GuessRecord } from "@/lib/game/types";
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
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [revealRow, setRevealRow] = useState<number | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [announcement, setAnnouncement] = useState(() =>
    game.status === "in_progress"
      ? `Attempt ${game.guesses.length + 1} of ${MAX_ATTEMPTS}.`
      : game.status === "won"
        ? describeGameResult("won", game.guesses.length)
        : describeGameResult("lost", game.guesses.length)
  );

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

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
      announce("Not enough letters. Enter five letters.");
      setShakeRow(guesses.length);
      setTimeout(() => setShakeRow(null), 500);
      return;
    }

    setSubmitting(true);
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

      const lastGuess = result.guesses.at(-1);
      if (lastGuess) {
        if (result.status === "won") {
          announce(
            `${describeGuess(lastGuess)} ${describeGameResult("won", result.guesses.length)}`
          );
        } else if (result.status === "lost") {
          announce(
            `${describeGuess(lastGuess)} ${describeGameResult("lost", result.guesses.length)}`
          );
        } else {
          announce(
            `${describeGuess(lastGuess)} Attempt ${result.guesses.length + 1} of ${MAX_ATTEMPTS}.`
          );
        }
      }
    } catch (submitError) {
      setRevealRow(null);
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit guess.";
      if (message === "Not in word list.") {
        announce("Not in word list.");
        setShakeRow(guesses.length);
        setTimeout(() => setShakeRow(null), 500);
      } else {
        announce(message);
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [status, submitting, currentGuess, guesses.length, onSubmitGuess, announce]);

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

    try {
      const result = await onRequestHint();
      setHintUsed(result.hintUsed);
      setHint(result.hint);
      announce("Hint revealed. Word meaning is available below.");
    } catch (hintError) {
      const message =
        hintError instanceof Error ? hintError.message : "Unable to fetch hint.";
      announce(message);
      toast.error(message);
    } finally {
      setLoadingHint(false);
    }
  };

  const isComplete = status !== "in_progress";
  const celebrateRow = status === "won" ? guesses.length - 1 : null;

  const pageTitle =
    mode === "daily" && game.puzzleNumber !== undefined
      ? `Daily puzzle #${game.puzzleNumber}`
      : "Practice game";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 md:max-w-3xl lg:max-w-lg">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-xl font-semibold md:text-2xl">{pageTitle}</h1>
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

      <div
        className={cn(
          "flex flex-col gap-6",
          !isComplete &&
            "md:grid md:grid-cols-[auto_minmax(0,1fr)] md:items-start md:gap-8 lg:flex lg:flex-col"
        )}
      >
        <div className="flex justify-center md:justify-start lg:justify-center">
          <GameBoard
            guesses={guesses}
            currentGuess={currentGuess}
            shakeRow={shakeRow}
            revealRow={revealRow}
            isComplete={isComplete}
            celebrateRow={celebrateRow}
          />
        </div>

        {!isComplete && (
          <div className="flex flex-col gap-4 md:pt-2 lg:pt-0">
            <Keyboard
              keyStates={buildKeyStates(guesses)}
              onKey={handleKey}
              disabled={submitting}
            />

            {onRequestHint && (
              <div className="flex flex-col items-center gap-3 md:items-stretch">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleHint()}
                  disabled={hintUsed || loadingHint || submitting}
                  className="rounded-full border-[color:var(--hint)]/40 text-[color:var(--hint)] hover:bg-[color:var(--hint)]/10"
                >
                  <Lightbulb aria-hidden="true" className="size-4" />
                  {loadingHint
                    ? "Loading hint…"
                    : hintUsed
                      ? "Hint used"
                      : "Get hint"}
                </Button>

                {hint && (
                  <Alert className="w-full border-[color:var(--hint)]/30 bg-[color:var(--hint)]/10">
                    <Lightbulb aria-hidden="true" className="text-[color:var(--hint)]" />
                    <AlertTitle className="text-[color:var(--hint)]">
                      Word meaning
                    </AlertTitle>
                    <AlertDescription className="text-foreground/90">
                      {hint}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isComplete && (
        <SectionCard contentClassName="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-secondary/15">
            <PartyPopper aria-hidden="true" className="size-6 text-secondary" />
          </div>
          <h2 className="font-display text-2xl font-semibold">
            {status === "won" ? "Nice work!" : "Keep practicing"}
          </h2>
          <p className="mt-2 text-muted-foreground">
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
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}
                >
                  View leaderboard
                </Link>
              </>
            )}
            {mode === "practice" && onPlayAgain && (
              <Button size="lg" className="rounded-full" onClick={onPlayAgain}>
                <RotateCcw aria-hidden="true" className="size-4" />
                {playAgainLabel}
              </Button>
            )}
            {mode === "practice" && (
              <Link
                href="/practice"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}
              >
                Change difficulty
              </Link>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
