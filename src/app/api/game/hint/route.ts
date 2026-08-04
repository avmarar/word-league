import { NextResponse } from "next/server";
import { isAuthError, verifyAuthToken } from "@/lib/api/auth";
import { requestGameHint } from "@/lib/game/service";

export async function POST(request: Request) {
  const authResult = await verifyAuthToken(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const result = await requestGameHint(authResult.uid);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch hint.";
    const clientErrors = [
      "Start the game before requesting a hint.",
      "Hints are only available during an active game.",
    ];
    const status = clientErrors.includes(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
