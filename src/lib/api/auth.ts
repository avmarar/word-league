import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function verifyAuthToken(
  request: Request
): Promise<{ uid: string } | NextResponse> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ error: "Missing auth token." }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return NextResponse.json({ error: "Invalid auth token." }, { status: 401 });
  }
}

export function isAuthError(
  result: { uid: string } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
