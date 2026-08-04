"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { AppShell } from "@/components/AppShell";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { getDateKey, getWeekDateKeys } from "@/lib/dates";
import {
  artifactsCollection,
  namespace,
  type ProfileDocument,
  type ScoreDocument,
} from "@/lib/game/types";
import { getFirestoreDb } from "@/lib/firebase/client";

type Tab = "today" | "week";

function pickBestWeeklyScores(scores: ScoreDocument[]): ScoreDocument[] {
  const bestByUser = new Map<string, ScoreDocument>();

  for (const score of scores) {
    if (!score.won) {
      continue;
    }

    const existing = bestByUser.get(score.userId);
    if (
      !existing ||
      score.attempts < existing.attempts ||
      (score.attempts === existing.attempts &&
        score.durationMs < existing.durationMs)
    ) {
      bestByUser.set(score.userId, score);
    }
  }

  return [...bestByUser.values()];
}

export default function LeaderboardPage() {
  const { isReady, authState } = useAuth();
  const [tab, setTab] = useState<Tab>("today");
  const [todayScores, setTodayScores] = useState<ScoreDocument[]>([]);
  const [weekScores, setWeekScores] = useState<ScoreDocument[]>([]);
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  const dateKey = getDateKey();
  const weekDateKeys = useMemo(() => getWeekDateKeys(), []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      return;
    }

    const todayQuery = query(
      collection(db, "scores"),
      where("dateKey", "==", dateKey)
    );

    const weekQuery = query(
      collection(db, "scores"),
      where("dateKey", "in", weekDateKeys)
    );

    const unsubscribeToday = onSnapshot(todayQuery, (snapshot) => {
      setTodayScores(
        snapshot.docs.map(
          (docSnapshot) => docSnapshot.data() as ScoreDocument
        )
      );
    });

    const unsubscribeWeek = onSnapshot(weekQuery, (snapshot) => {
      const scores = snapshot.docs.map(
        (docSnapshot) => docSnapshot.data() as ScoreDocument
      );
      setWeekScores(pickBestWeeklyScores(scores));
    });

    return () => {
      unsubscribeToday();
      unsubscribeWeek();
    };
  }, [isReady, dateKey, weekDateKeys]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      return;
    }

    const visibleScores = tab === "today" ? todayScores : weekScores;
    if (visibleScores.length === 0) {
      setStreaks({});
      return;
    }

    const loadStreaks = async () => {
      const streakMap: Record<string, number> = {};
      await Promise.all(
        visibleScores.map(async (score) => {
          const profileRef = doc(
            db,
            artifactsCollection,
            namespace,
            "users",
            score.userId,
            "data",
            "profile"
          );
          const snapshot = await getDoc(profileRef);
          if (snapshot.exists()) {
            const profile = snapshot.data() as ProfileDocument;
            streakMap[score.userId] = profile.currentStreak ?? 0;
          }
        })
      );
      setStreaks(streakMap);
    };

    void loadStreaks();
  }, [isReady, tab, todayScores, weekScores]);

  if (authState.status === "error") {
    return (
      <AppShell active="leaderboard">
        <Alert variant="destructive">
          <AlertDescription>{authState.message}</AlertDescription>
        </Alert>
      </AppShell>
    );
  }

  if (!isReady) {
    return (
      <AppShell active="leaderboard">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="leaderboard">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Rankings"
          title="Leaderboard"
          description="Fewer guesses and faster times rank higher. Streaks show who's been showing up daily."
        />

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
          className="space-y-4"
        >
          <TabsList className="rounded-full bg-muted/50 p-1">
            <TabsTrigger value="today" className="rounded-full px-5">
              Today
            </TabsTrigger>
            <TabsTrigger value="week" className="rounded-full px-5">
              This week
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <LeaderboardTable
              title={`Today (${dateKey})`}
              scores={todayScores}
              streaks={streaks}
            />
          </TabsContent>

          <TabsContent value="week">
            <LeaderboardTable
              title="Best wins this week"
              scores={weekScores}
              streaks={streaks}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
