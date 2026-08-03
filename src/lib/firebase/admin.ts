import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;

function useEmulators() {
  return process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
}

export function getAdminApp(): App {
  if (cachedApp) {
    return cachedApp;
  }

  if (getApps().length > 0) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }

  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "word-league-demo";

  if (useEmulators()) {
    process.env.FIRESTORE_EMULATOR_HOST ??= "localhost:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "localhost:9099";
    cachedApp = initializeApp({ projectId });
    return cachedApp;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is required when not using emulators."
    );
  }

  const serviceAccount = JSON.parse(raw) as {
    project_id: string;
    client_email: string;
    private_key: string;
  };

  cachedApp = initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });

  return cachedApp;
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
