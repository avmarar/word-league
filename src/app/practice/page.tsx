"use client";

import { useCallback, useState } from "react";
import { Sparkles, Target, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { GameLoadingSkeleton } from "@/components/GameLoadingSkeleton";
import { GamePlayPanel, type GamePlayState } from "@/components/GamePlayPanel";
import { PageHeader } from "@/components/PageHeader";
import { ProfileFormCard } from "@/components/ProfileFormCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { apiPost } from "@/lib/api/client";
import type { Difficulty } from "@/lib/words/difficulty";
import {
  DIFFICULTIES,
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_LABELS,
} from "@/lib/words/difficulty";
import { cn } from "@/lib/utils";

type PracticeSession = GamePlayState & {
  sessionId: string;
};

const difficultyIcons: Record<Difficulty, typeof Sparkles> = {
  easy: Sparkles,
  medium: Target,
  hard: Zap,
};

export default function PracticePage() {
  const { uid, isReady, authState } = useAuth();
  const profile = useProfile(uid);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("medium");
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPractice = useCallback(async (difficulty: Difficulty) => {
    setLoading(true);
    setError(null);

    try {
      const state = await apiPost<PracticeSession>("/api/practice/start", {
        difficulty,
      });
      setSession(state);
      setSelectedDifficulty(difficulty);
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Unable to start practice."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  if (authState.status === "error") {
    return (
      <AppShell active="practice">
        <Alert variant="destructive">
          <AlertDescription>{authState.message}</AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  if (!isReady || !profile.isLoaded) {
    return (
      <AppShell active="practice">
        <div aria-busy="true" aria-live="polite" className="space-y-4">
          <p className="sr-only">Loading practice…</p>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile.hasNickname) {
    return (
      <AppShell active="practice">
        <div className="mx-auto max-w-md space-y-4">
          <h1 className="text-center font-display text-2xl font-semibold">
            Practice
          </h1>
          <p className="text-center text-muted-foreground">
            Set a nickname before starting practice rounds.
          </p>
          <ProfileFormCard
            nickname={profile.nicknameInput}
            onNicknameChange={profile.setNicknameInput}
            onSubmit={profile.handleSave}
            canSubmit={Boolean(uid)}
            saveState={profile.saveState}
            errorMessage={profile.profileError}
            compact
          />
        </div>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell active="practice">
        <div className="space-y-6">
          <PageHeader
            eyebrow="Practice"
            title="Choose a difficulty"
            description="Unlimited practice rounds with no impact on your daily score or streak. Pick a level and sharpen your skills."
          />

          <div
            className="grid gap-4 md:grid-cols-3"
            role="group"
            aria-label="Choose difficulty"
          >
            {DIFFICULTIES.map((difficulty) => {
              const Icon = difficultyIcons[difficulty];
              const selected = selectedDifficulty === difficulty;
              return (
                <button
                  key={difficulty}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={cn(
                    "rounded-2xl border p-6 text-left transition hover:scale-[1.01]",
                    selected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border/60 bg-card/60 hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <DifficultyBadge difficulty={difficulty} />
                    <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 font-display text-xl font-semibold">
                    {DIFFICULTY_LABELS[difficulty]}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {DIFFICULTY_DESCRIPTIONS[difficulty]}
                  </p>
                </button>
              );
            })}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            size="lg"
            className="rounded-full px-8"
            disabled={loading}
            onClick={() => void startPractice(selectedDifficulty)}
          >
            {loading
              ? "Starting…"
              : `Start ${DIFFICULTY_LABELS[selectedDifficulty]} practice`}
          </Button>
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell active="practice">
        <GameLoadingSkeleton label="Starting practice" />
      </AppShell>
    );
  }

  return (
    <AppShell active="practice">
      <GamePlayPanel
        mode="practice"
        game={session}
        onSubmitGuess={async (guess) => {
          const result = await apiPost<PracticeSession>("/api/practice/guess", {
            sessionId: session.sessionId,
            guess,
          });
          setSession(result);
          return result;
        }}
        onRequestHint={async () => {
          const result = await apiPost<{
            hintUsed: boolean;
            hint: string | null;
          }>("/api/practice/hint", { sessionId: session.sessionId });
          setSession((previous) =>
            previous
              ? {
                  ...previous,
                  hintUsed: result.hintUsed,
                  hint: result.hint,
                }
              : previous
          );
          return result;
        }}
        onPlayAgain={() =>
          void startPractice(session.difficulty ?? selectedDifficulty)
        }
        playAgainLabel="New practice word"
      />
    </AppShell>
  );
}
