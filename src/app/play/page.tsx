"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GameLoadingSkeleton } from "@/components/GameLoadingSkeleton";
import { GamePlayPanel, type GamePlayState } from "@/components/GamePlayPanel";
import { ProfileFormCard } from "@/components/ProfileFormCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { apiPost } from "@/lib/api/client";

type DailyGameState = GamePlayState & {
  puzzleNumber: number;
  dateKey: string;
  difficulty: NonNullable<GamePlayState["difficulty"]>;
};

export default function PlayPage() {
  const { uid, isReady, authState } = useAuth();
  const profile = useProfile(uid);
  const [game, setGame] = useState<DailyGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGame = useCallback(async () => {
    if (!isReady) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const state = await apiPost<DailyGameState>("/api/game/start");
      setGame(state);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load game."
      );
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    if (!isReady || !profile.isLoaded) {
      return;
    }

    if (profile.hasNickname) {
      void loadGame();
    } else {
      setLoading(false);
    }
  }, [isReady, profile.isLoaded, profile.hasNickname, loadGame]);

  if (authState.status === "error") {
    return (
      <AppShell active="play">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{authState.message}</AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  if (!isReady || !profile.isLoaded || loading) {
    return (
      <AppShell active="play">
        {!isReady || !profile.isLoaded ? (
          <div aria-busy="true" aria-live="polite" className="space-y-3">
            <p className="sr-only">Connecting…</p>
            <Skeleton className="h-8 w-48" />
            <GameLoadingSkeleton label="Connecting" />
          </div>
        ) : (
          <GameLoadingSkeleton label="Loading today's puzzle" />
        )}
      </AppShell>
    );
  }

  if (!profile.hasNickname) {
    return (
      <AppShell active="play">
        <div className="mx-auto max-w-md space-y-4">
          <h1 className="text-center font-display text-2xl font-semibold">
            Daily puzzle
          </h1>
          <p className="text-center text-muted-foreground">
            Set a nickname before joining today&apos;s puzzle.
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

  if (!game) {
    return (
      <AppShell active="play">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error ?? "Unable to start game."}</AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  return (
    <AppShell active="play">
      <GamePlayPanel
        mode="daily"
        game={game}
        onSubmitGuess={async (guess) => {
          const result = await apiPost<{
            guesses: DailyGameState["guesses"];
            status: DailyGameState["status"];
            durationMs: number | null;
            shareGrid: string | null;
          }>("/api/game/guess", { guess });

          const merged: DailyGameState = {
            ...game,
            guesses: result.guesses,
            status: result.status,
            durationMs: result.durationMs,
            shareGrid: result.shareGrid,
          };
          setGame(merged);
          return merged;
        }}
        onRequestHint={async () => {
          const result = await apiPost<{
            hintUsed: boolean;
            hint: string | null;
          }>("/api/game/hint");
          setGame((previous) =>
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
      />
    </AppShell>
  );
}
