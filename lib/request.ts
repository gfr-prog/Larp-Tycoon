import type { NextRequest } from "next/server";
// Next.js can normalize nextUrl to the bind address (0.0.0.0).
// Match the browser Origin against the actual request Host instead.
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (process.env.APP_ORIGIN)
      return parsed.origin === new URL(process.env.APP_ORIGIN).origin;
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      parsed.host === req.headers.get("host")
    );
  } catch {
    return false;
  }
}
