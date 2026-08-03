import { NextResponse } from "next/server";
import { isAuthError, verifyAuthToken } from "@/lib/api/auth";
import { getProfile, submitGuess } from "@/lib/game/service";

export async function POST(request: Request) {
  const authResult = await verifyAuthToken(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const body = (await request.json()) as { guess?: string };
    const guess = body.guess ?? "";
    const profile = await getProfile(authResult.uid);
    const displayName = profile?.nickname ?? "Player";

    const result = await submitGuess(authResult.uid, guess, displayName);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit guess.";
    const clientErrors = [
      "Not in word list.",
      "Guess must be 5 letters.",
      "Start the game before submitting a guess.",
      "Today's puzzle is already complete.",
      "No attempts remaining.",
    ];
    const status = clientErrors.includes(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
