import { NextRequest, NextResponse } from "next/server";
import { readPlayer } from "@/lib/db";
import { publicPlayer } from "@/lib/economy";
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(
      publicPlayer(readPlayer(req.nextUrl.searchParams.get("id") || "")),
    );
  } catch {
    return NextResponse.json(
      { error: "Profil nicht gefunden." },
      { status: 404 },
    );
  }
}
