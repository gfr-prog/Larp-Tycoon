import { sameOrigin } from "@/lib/request";
import { NextRequest, NextResponse } from "next/server";
import { auth, revoke } from "@/lib/db";
import { z } from "zod";
export const runtime = "nodejs";
const schema = z.object({
  mode: z.enum(["register", "login"]),
  username: z
    .string()
    .trim()
    .regex(
      /^[a-zA-Z0-9_]{3,20}$/,
      "Username: 3–20 Buchstaben, Zahlen oder _. ",
    ),
  password: z
    .string()
    .min(8, "Das Passwort braucht mindestens 8 Zeichen.")
    .max(128),
});
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Ungültiger Ursprung." },
      { status: 403 },
    );
  try {
    const body = schema.parse(await req.json());
    const key =
      (req.headers.get("x-forwarded-for")?.split(",")[0] || "local") +
      ":" +
      body.username.toLowerCase();
    const { token } = auth(body.mode, body.username, body.password, key);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("larp_session", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: req.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 30 * 86400,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof z.ZodError
            ? e.issues[0].message
            : e instanceof Error
              ? e.message
              : "Anmeldung fehlgeschlagen.",
      },
      { status: 400 },
    );
  }
}
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Ungültiger Ursprung." },
      { status: 403 },
    );
  const token = req.cookies.get("larp_session")?.value;
  if (token) revoke(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("larp_session");
  return res;
}
