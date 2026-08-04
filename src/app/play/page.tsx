"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GamePlayPanel, type GamePlayState } from "@/components/GamePlayPanel";
import { ProfileFormCard } from "@/components/ProfileFormCard";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { apiPost } from "@/lib/api/client";
import { getDateKey } from "@/lib/dates";

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

  const dateKey = getDateKey();

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
        <p className="text-red-300">{authState.message}</p>
      </AppShell>
    );
  }

  if (!isReady || !profile.isLoaded || loading) {
    return (
      <AppShell active="play">
        <p className="text-white/70">
          {!isReady || !profile.isLoaded
            ? "Connecting…"
            : "Loading today's puzzle…"}
        </p>
      </AppShell>
    );
  }

  if (!profile.hasNickname) {
    return (
      <AppShell active="play">
        <div className="mx-auto max-w-md space-y-4">
          {profile.profileError && (
            <p className="text-red-300">{profile.profileError}</p>
          )}
          <p className="text-white/70">
            Set a nickname before joining today&apos;s puzzle.
          </p>
          <ProfileFormCard
            nickname={profile.nicknameInput}
            onNicknameChange={profile.setNicknameInput}
            onSubmit={profile.handleSave}
            canSubmit={Boolean(uid)}
            saveState={profile.saveState}
            errorMessage={profile.profileError}
          />
        </div>
      </AppShell>
    );
  }

  if (!game) {
    return (
      <AppShell active="play">
        <p className="text-red-300">{error ?? "Unable to start game."}</p>
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
