import { NextResponse } from "next/server";
import { isAuthError, verifyAuthToken } from "@/lib/api/auth";
import { requestPracticeHint } from "@/lib/game/practice-service";

export async function POST(request: Request) {
  const authResult = await verifyAuthToken(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const body = (await request.json()) as { sessionId?: string };

    if (!body.sessionId) {
      return NextResponse.json(
        { error: "Missing practice session." },
        { status: 400 }
      );
    }

    const result = await requestPracticeHint(authResult.uid, body.sessionId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch hint.";
    const clientErrors = [
      "Practice session not found.",
      "Hints are only available during an active game.",
      "Missing practice session.",
    ];
    const status = clientErrors.includes(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
