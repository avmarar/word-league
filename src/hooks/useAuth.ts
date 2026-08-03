"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirebaseAuth, isFirebaseReady } from "@/lib/firebase/client";

export type AuthState =
  | { status: "checking" }
  | { status: "connected"; uid: string }
  | { status: "error"; message: string };

export function useAuth() {
  const firebaseAvailable = isFirebaseReady();
  const firebaseAuth = firebaseAvailable ? getFirebaseAuth() : null;
  const [authState, setAuthState] = useState<AuthState>(
    !firebaseAvailable
      ? {
          status: "error",
          message:
            "Firebase environment variables are missing. Populate .env.local.",
        }
      : !firebaseAuth
        ? { status: "error", message: "Firebase Auth failed to initialize." }
        : { status: "checking" }
  );

  useEffect(() => {
    if (!firebaseAuth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      (user) => {
        if (user) {
          setAuthState({ status: "connected", uid: user.uid });
        } else {
          setAuthState({ status: "checking" });
        }
      },
      (error) => {
        setAuthState({ status: "error", message: error.message });
      }
    );

    if (!firebaseAuth.currentUser) {
      signInAnonymously(firebaseAuth).catch((error) =>
        setAuthState({ status: "error", message: error.message })
      );
    }

    return () => unsubscribe();
  }, [firebaseAuth]);

  const uid = authState.status === "connected" ? authState.uid : null;

  return {
    authState,
    uid,
    isReady: authState.status === "connected",
  };
}
