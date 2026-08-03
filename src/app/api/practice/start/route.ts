import { NextResponse } from "next/server";
import { isAuthError, verifyAuthToken } from "@/lib/api/auth";
import { startPracticeSession } from "@/lib/game/practice-service";

export async function POST(request: Request) {
  const authResult = await verifyAuthToken(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const body = (await request.json()) as { difficulty?: string };
    const session = await startPracticeSession(
      authResult.uid,
      body.difficulty ?? "medium"
    );
    return NextResponse.json(session);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start practice.";
    const status = message === "Invalid difficulty level." ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
