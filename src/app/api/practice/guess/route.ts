import { NextResponse } from "next/server";
import { isAuthError, verifyAuthToken } from "@/lib/api/auth";
import { submitPracticeGuess } from "@/lib/game/practice-service";

export async function POST(request: Request) {
  const authResult = await verifyAuthToken(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const body = (await request.json()) as {
      sessionId?: string;
      guess?: string;
    };

    if (!body.sessionId) {
      return NextResponse.json(
        { error: "Missing practice session." },
        { status: 400 }
      );
    }

    const result = await submitPracticeGuess(
      authResult.uid,
      body.sessionId,
      body.guess ?? ""
    );
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit guess.";
    const clientErrors = [
      "Not in word list.",
      "Guess must be 5 letters.",
      "Practice session not found.",
      "This practice round is already complete.",
      "No attempts remaining.",
      "Missing practice session.",
    ];
    const status = clientErrors.includes(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
