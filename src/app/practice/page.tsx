"use client";

import { useCallback, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { GamePlayPanel, type GamePlayState } from "@/components/GamePlayPanel";
import { ProfileFormCard } from "@/components/ProfileFormCard";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { apiPost } from "@/lib/api/client";
import type { Difficulty } from "@/lib/words/difficulty";
import {
  DIFFICULTIES,
  DIFFICULTY_DESCRIPTIONS,
  DIFFICULTY_LABELS,
} from "@/lib/words/difficulty";

type PracticeSession = GamePlayState & {
  sessionId: string;
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
        <p className="text-red-300">{authState.message}</p>
      </AppShell>
    );
  }

  if (!isReady || !profile.isLoaded) {
    return (
      <AppShell active="practice">
        <p className="text-white/70">Connecting…</p>
      </AppShell>
    );
  }

  if (!profile.hasNickname) {
    return (
      <AppShell active="practice">
        <div className="mx-auto max-w-md space-y-4">
          <p className="text-white/70">
            Set a nickname before starting practice rounds.
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

  if (!session) {
    return (
      <AppShell active="practice">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">
              Practice
            </p>
            <h1 className="text-3xl font-semibold">Choose a difficulty</h1>
            <p className="mt-2 max-w-2xl text-white/70">
              Unlimited practice rounds with no impact on your daily score or
              streak. Pick a level and sharpen your skills.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`rounded-3xl border p-6 text-left transition ${
                  selectedDifficulty === difficulty
                    ? "border-cyan-400/50 bg-cyan-400/10"
                    : "border-white/5 bg-white/[0.04] hover:bg-white/[0.06]"
                }`}
              >
                <DifficultyBadge difficulty={difficulty} />
                <h2 className="mt-3 text-xl font-semibold">
                  {DIFFICULTY_LABELS[difficulty]}
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  {DIFFICULTY_DESCRIPTIONS[difficulty]}
                </p>
              </button>
            ))}
          </div>

          {error && <p className="text-red-300">{error}</p>}

          <button
            type="button"
            disabled={loading}
            onClick={() => void startPractice(selectedDifficulty)}
            className="btn-primary rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 px-6 py-3 font-semibold transition hover:brightness-110 disabled:opacity-50"
          >
            {loading
              ? "Starting…"
              : `Start ${DIFFICULTY_LABELS[selectedDifficulty]} practice`}
          </button>
        </div>
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
        onPlayAgain={() =>
          void startPractice(session.difficulty ?? selectedDifficulty)
        }
        playAgainLabel="New practice word"
      />
    </AppShell>
  );
}
