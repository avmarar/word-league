"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Flame, Timer } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { PageHeader } from "@/components/PageHeader";
import { ProfileFormCard } from "@/components/ProfileFormCard";
import { SectionCard } from "@/components/SectionCard";
import { StatTile } from "@/components/StatTile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import {
  formatCountdown,
  getDateKey,
  getMsUntilNextPuzzle,
} from "@/lib/dates";
import { getDailyDifficulty, getPuzzleNumber } from "@/lib/words/selector";
import { DIFFICULTY_DESCRIPTIONS } from "@/lib/words/difficulty";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { uid, isReady, authState } = useAuth();
  const profile = useProfile(uid);
  const [countdown, setCountdown] = useState<string | null>(null);

  const dateKey = getDateKey();
  const puzzleNumber = getPuzzleNumber(dateKey);
  const dailyDifficulty = getDailyDifficulty(dateKey);

  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(getMsUntilNextPuzzle()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (authState.status === "error") {
    return (
      <AppShell active="home">
        <Alert variant="destructive">
          <AlertDescription>{authState.message}</AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  return (
    <AppShell active="home">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
        {!profile.hasNickname && profile.isLoaded && (
          <div className="order-first lg:order-none lg:col-start-2 lg:row-start-1">
            <ProfileFormCard
              nickname={profile.nicknameInput}
              onNicknameChange={profile.setNicknameInput}
              onSubmit={profile.handleSave}
              canSubmit={Boolean(uid && isReady)}
              saveState={profile.saveState}
              errorMessage={profile.profileError}
            />
          </div>
        )}

        <SectionCard
          className="lg:col-start-1 lg:row-start-1"
          contentClassName="space-y-5 sm:space-y-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <PageHeader
              eyebrow="Daily puzzle"
              title={`Word League #${puzzleNumber}`}
              description={`One shared five-letter puzzle every day at ${dailyDifficulty} difficulty. Play solo, compare scores on the office leaderboard, and keep your streak alive.`}
              className="min-w-0 flex-1"
            />
            <DifficultyBadge difficulty={dailyDifficulty} className="shrink-0 sm:mt-8" />
          </div>

          <p className="text-sm text-muted-foreground">
            {DIFFICULTY_DESCRIPTIONS[dailyDifficulty]}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/play"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full rounded-full px-8 hover:scale-[1.02] sm:w-auto"
              )}
            >
              {profile.hasNickname ? "Play daily challenge" : "Set up & play"}
            </Link>
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <Link
                href="/practice"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full"
                )}
              >
                Practice
              </Link>
              <Link
                href="/leaderboard"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full"
                )}
              >
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <StatTile label="Today" value={dateKey} icon={Calendar} />
            <StatTile
              label="Your streak"
              value={isReady ? `${profile.profile?.currentStreak ?? 0} days` : "—"}
              icon={Flame}
              accent="hint"
            />
            <StatTile
              label="Next puzzle in"
              value={countdown ?? "—"}
              icon={Timer}
              accent="secondary"
              valueClassName={countdown ? "motion-safe:animate-pulse" : undefined}
            />
          </div>
        </SectionCard>

        {profile.hasNickname && (
          <ProfileFormCard
            nickname={profile.nicknameInput}
            onNicknameChange={profile.setNicknameInput}
            onSubmit={profile.handleSave}
            canSubmit={Boolean(uid && isReady)}
            saveState={profile.saveState}
            errorMessage={profile.profileError}
          />
        )}
      </div>
    </AppShell>
  );
}
