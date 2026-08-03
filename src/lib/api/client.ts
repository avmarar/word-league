import { getFirebaseAuth } from "@/lib/firebase/client";

export async function getAuthHeaders(): Promise<HeadersInit> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) {
    throw new Error("Not authenticated.");
  }

  const token = await auth.currentUser.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(path, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload;
}
