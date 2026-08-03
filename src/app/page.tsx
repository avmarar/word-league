"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ProfileFormCard } from "@/components/ProfileFormCard";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  formatCountdown,
  getDateKey,
  getMsUntilNextPuzzle,
} from "@/lib/dates";
import { getDailyDifficulty, getPuzzleNumber } from "@/lib/words/selector";
import { DIFFICULTY_DESCRIPTIONS } from "@/lib/words/difficulty";

export default function HomePage() {
  const { uid, isReady, authState } = useAuth();
  const profile = useProfile(uid);
  const [countdown, setCountdown] = useState(formatCountdown(getMsUntilNextPuzzle()));

  const dateKey = getDateKey();
  const puzzleNumber = getPuzzleNumber(dateKey);
  const dailyDifficulty = getDailyDifficulty(dateKey);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(formatCountdown(getMsUntilNextPuzzle()));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (authState.status === "error") {
    return (
      <AppShell active="home">
        <p className="text-red-300">{authState.message}</p>
      </AppShell>
    );
  }

  return (
    <AppShell active="home">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-white/5 bg-white/[0.04] p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">
              Daily puzzle
            </p>
            <DifficultyBadge difficulty={dailyDifficulty} />
          </div>
          <h1 className="mt-2 text-4xl font-semibold">
            Word League #{puzzleNumber}
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            One shared five-letter puzzle every day at{" "}
            {dailyDifficulty} difficulty. Play solo, compare scores on the
            office leaderboard, and keep your streak alive.
          </p>
          <p className="mt-2 text-sm text-white/50">
            {DIFFICULTY_DESCRIPTIONS[dailyDifficulty]}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/play"
              className="btn-primary rounded-full bg-linear-to-r from-cyan-400 to-emerald-400 px-6 py-3 font-semibold transition hover:brightness-110"
            >
              {profile.hasNickname ? "Play daily challenge" : "Set up & play"}
            </Link>
            <Link
              href="/practice"
              className="rounded-full border border-white/10 px-6 py-3 font-semibold !text-white transition hover:bg-white/5"
            >
              Practice
            </Link>
            <Link
              href="/leaderboard"
              className="rounded-full border border-white/10 px-6 py-3 font-semibold !text-white transition hover:bg-white/5"
            >
              Leaderboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/60">Today</p>
              <p className="font-semibold">{dateKey}</p>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/60">Your streak</p>
              <p className="font-semibold">
                {isReady ? (profile.profile?.currentStreak ?? 0) : "—"} days
              </p>
            </div>
            <div className="rounded-2xl bg-black/20 p-4">
              <p className="text-sm text-white/60">Next puzzle in</p>
              <p className="font-semibold">{countdown}</p>
            </div>
          </div>
        </section>

        <ProfileFormCard
          nickname={profile.nicknameInput}
          onNicknameChange={profile.setNicknameInput}
          onSubmit={profile.handleSave}
          canSubmit={Boolean(uid && isReady)}
          saveState={profile.saveState}
          errorMessage={profile.profileError}
        />
      </div>
    </AppShell>
  );
}
