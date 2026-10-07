import { sameOrigin } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";
import { sessionUser, snapshot, action, leaderboard } from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const id = sessionUser(req.cookies.get("larp_session")?.value);
  return NextResponse.json(
    id ? snapshot(id) : { player: null, leaderboard: leaderboard() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Ungültiger Ursprung." },
      { status: 403 },
    );
  const id = sessionUser(req.cookies.get("larp_session")?.value);
  if (!id)
    return NextResponse.json(
      { error: "Bitte melde dich an." },
      { status: 401 },
    );
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error("Ungültige Aktion.");
    return NextResponse.json(action(id, body));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Aktion fehlgeschlagen." },
      { status: 400 },
    );
  }
}
