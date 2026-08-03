"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { updateProfile } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import {
  artifactsCollection,
  namespace,
  type ProfileDocument,
} from "@/lib/game/types";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase/client";

export function useProfile(uid: string | null) {
  const [profile, setProfile] = useState<ProfileDocument | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const hydrateFormRef = useRef(false);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setIsLoaded(false);
      return;
    }

    setIsLoaded(false);

    const db = getFirestoreDb();
    if (!db) {
      setProfileError("Firestore is unavailable.");
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

    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        setIsLoaded(true);
        setProfileError(null);
        if (snapshot.exists()) {
          const data = snapshot.data() as ProfileDocument;
          setProfile(data);
          if (!hydrateFormRef.current) {
            setNicknameInput(data.nickname ?? "");
            hydrateFormRef.current = true;
          }
        } else {
          setProfile(null);
          if (!hydrateFormRef.current) {
            setNicknameInput("");
          }
        }
      },
      (error) => {
        setIsLoaded(true);
        setProfileError(error.message);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      hydrateFormRef.current = false;
    }
  }, [uid]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uid) {
      return;
    }

    const db = getFirestoreDb();
    if (!db) {
      setProfileError("Firestore is unavailable.");
      return;
    }

    const trimmedNickname = nicknameInput.trim();
    if (!trimmedNickname) {
      setProfileError("Nickname is required.");
      return;
    }

    setSaveState("saving");
    setProfileError(null);

    try {
      const profileRef = doc(
        db,
        artifactsCollection,
        namespace,
        "users",
        uid,
        "data",
        "profile"
      );

      await setDoc(
        profileRef,
        {
          nickname: trimmedNickname,
          currentStreak: profile?.currentStreak ?? 0,
          maxStreak: profile?.maxStreak ?? 0,
          gamesPlayed: profile?.gamesPlayed ?? 0,
          gamesWon: profile?.gamesWon ?? 0,
          lastPlayedDate: profile?.lastPlayedDate ?? null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: trimmedNickname,
        }).catch(() => undefined);
      }

      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (error) {
      setSaveState("error");
      setProfileError(
        error instanceof Error ? error.message : "Failed to save profile."
      );
    }
  };

  const hasNickname = Boolean(profile?.nickname?.trim());

  return {
    profile,
    isLoaded,
    nicknameInput,
    setNicknameInput,
    profileError,
    saveState,
    hasNickname,
    handleSave,
  };
}
