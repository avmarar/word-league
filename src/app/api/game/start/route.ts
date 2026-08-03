import { NextResponse } from "next/server";
import { isAuthError, verifyAuthToken } from "@/lib/api/auth";
import { getDateKey } from "@/lib/dates";
import { getOrCreateGame, serializeGame } from "@/lib/game/service";

export async function POST(request: Request) {
  const authResult = await verifyAuthToken(request);
  if (isAuthError(authResult)) {
    return authResult;
  }

  try {
    const dateKey = getDateKey();
    const game = await getOrCreateGame(authResult.uid, dateKey);
    return NextResponse.json(serializeGame(game));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start game.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
