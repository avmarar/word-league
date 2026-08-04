"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { BarChart3, Flame, Percent, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GameBoard } from "@/components/GameBoard";
import { PageHeader } from "@/components/PageHeader";
import { ProfileFormCard } from "@/components/ProfileFormCard";
import { SectionCard } from "@/components/SectionCard";
import { StatTile } from "@/components/StatTile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getDateKey } from "@/lib/dates";
import {
  artifactsCollection,
  namespace,
  type GameDocument,
  type ProfileDocument,
  type ScoreDocument,
} from "@/lib/game/types";
import { getFirestoreDb } from "@/lib/firebase/client";
import { getGameDocId } from "@/lib/game/ids";
import { cn } from "@/lib/utils";

export default function StatsPage() {
  const { uid, isReady, authState } = useAuth();
  const profileHook = useProfile(uid);
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [recentScores, setRecentScores] = useState<ScoreDocument[]>([]);
  const [todayGame, setTodayGame] = useState<GameDocument | null>(null);

  const dateKey = getDateKey();

  useEffect(() => {
    if (!uid || !isReady) {
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      return;
    }

    const profileRef = doc(
      db,
      artifactsCollection,
      namespace,
      "users",
      uid,
      "data",
      "profile"
    );

    const unsubscribeProfile = onSnapshot(profileRef, (snapshot) => {
      setProfile(snapshot.exists() ? (snapshot.data() as ProfileDocument) : null);
    });

    const scoresQuery = query(
      collection(db, "scores"),
      where("userId", "==", uid),
      orderBy("dateKey", "desc")
    );

    const unsubscribeScores = onSnapshot(scoresQuery, (snapshot) => {
      setRecentScores(
        snapshot.docs
          .map((docSnapshot) => docSnapshot.data() as ScoreDocument)
          .slice(0, 7)
      );
    });

    const gameRef = doc(db, "games", getGameDocId(uid, dateKey));
    const unsubscribeGame = onSnapshot(gameRef, (snapshot) => {
      setTodayGame(
        snapshot.exists() ? (snapshot.data() as GameDocument) : null
      );
    });

    return () => {
      unsubscribeProfile();
      unsubscribeScores();
      unsubscribeGame();
    };
  }, [uid, isReady, dateKey]);

  if (authState.status === "error") {
    return (
      <AppShell active="stats">
        <Alert variant="destructive">
          <AlertDescription>{authState.message}</AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  if (!isReady || !profileHook.isLoaded) {
    return (
      <AppShell active="stats">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profileHook.hasNickname) {
    return (
      <AppShell active="stats">
        <div className="mx-auto max-w-md">
          <ProfileFormCard
            nickname={profileHook.nicknameInput}
            onNicknameChange={profileHook.setNicknameInput}
            onSubmit={profileHook.handleSave}
            canSubmit={Boolean(uid)}
            saveState={profileHook.saveState}
            errorMessage={profileHook.profileError}
          />
        </div>
      </AppShell>
    );
  }

  const gamesPlayed = profile?.gamesPlayed ?? 0;
  const gamesWon = profile?.gamesWon ?? 0;
  const winRate =
    gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const avgAttempts =
    recentScores.filter((score) => score.won).length > 0
      ? (
          recentScores
            .filter((score) => score.won)
            .reduce((sum, score) => sum + score.attempts, 0) /
          recentScores.filter((score) => score.won).length
        ).toFixed(1)
      : "—";

  return (
    <AppShell active="stats">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Personal"
          title="Your stats"
          description="Track streaks, win rate, and recent performance."
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Current streak"
            value={`${profile?.currentStreak ?? 0} days`}
            icon={Flame}
            accent="hint"
          />
          <StatTile
            label="Best streak"
            value={`${profile?.maxStreak ?? 0} days`}
            icon={BarChart3}
            accent="primary"
          />
          <StatTile
            label="Win rate"
            value={`${winRate}%`}
            icon={Percent}
            accent="secondary"
          />
          <StatTile
            label="Avg attempts (7d)"
            value={avgAttempts}
            icon={Target}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {todayGame && todayGame.status !== "in_progress" && (
            <SectionCard title="Today's replay">
              <GameBoard
                guesses={todayGame.guesses}
                currentGuess=""
                shakeRow={null}
                revealRow={null}
                isComplete
                compact
              />
            </SectionCard>
          )}

          <SectionCard title="Last 7 days">
          {recentScores.length === 0 ? (
            <p className="text-muted-foreground">
              No completed games yet.{" "}
              <Link href="/play" className="text-primary hover:underline">
                Play today&apos;s puzzle
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {recentScores.map((score) => {
                const barWidth = score.won
                  ? `${(score.attempts / 6) * 100}%`
                  : "100%";
                return (
                  <li
                    key={`${score.dateKey}-${score.userId}`}
                    className="rounded-xl bg-muted/30 px-4 py-3"
                  >
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>{score.dateKey}</span>
                      <span className={score.won ? "text-secondary" : "text-destructive"}>
                        {score.won ? `${score.attempts}/6` : "X/6"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-background/60">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          score.won ? "bg-secondary" : "bg-destructive/60"
                        )}
                        style={{ width: barWidth }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
