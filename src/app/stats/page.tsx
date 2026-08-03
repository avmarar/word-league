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
import { AppShell } from "@/components/AppShell";
import { GameBoard } from "@/components/GameBoard";
import { ProfileFormCard } from "@/components/ProfileFormCard";
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
        <p className="text-red-300">{authState.message}</p>
      </AppShell>
    );
  }

  if (!isReady || !profileHook.isLoaded) {
    return (
      <AppShell active="stats">
        <p className="text-white/70">Loading stats…</p>
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
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">
            Personal
          </p>
          <h1 className="text-3xl font-semibold">Your stats</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Current streak", value: profile?.currentStreak ?? 0 },
            { label: "Best streak", value: profile?.maxStreak ?? 0 },
            { label: "Win rate", value: `${winRate}%` },
            { label: "Avg attempts (7d)", value: avgAttempts },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/5 bg-white/[0.04] p-4"
            >
              <p className="text-sm text-white/60">{item.label}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        {todayGame && todayGame.status !== "in_progress" && (
          <section className="rounded-3xl border border-white/5 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-xl font-semibold">Today&apos;s replay</h2>
            <GameBoard
              guesses={todayGame.guesses}
              currentGuess=""
              shakeRow={null}
              revealRow={null}
              isComplete
            />
          </section>
        )}

        <section className="rounded-3xl border border-white/5 bg-white/[0.04] p-6">
          <h2 className="mb-4 text-xl font-semibold">Last 7 days</h2>
          {recentScores.length === 0 ? (
            <p className="text-white/60">
              No completed games yet.{" "}
              <Link href="/play" className="text-cyan-200">
                Play today&apos;s puzzle
              </Link>
            </p>
          ) : (
            <ul className="space-y-3">
              {recentScores.map((score) => (
                <li
                  key={`${score.dateKey}-${score.userId}`}
                  className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 text-sm"
                >
                  <span>{score.dateKey}</span>
                  <span className={score.won ? "text-emerald-300" : "text-red-300"}>
                    {score.won ? `${score.attempts}/6` : "X/6"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
