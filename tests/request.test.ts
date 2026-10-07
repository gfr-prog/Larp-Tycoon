import { test } from "node:test";
import assert from "node:assert/strict";
import type { NextRequest } from "next/server";
import { sameOrigin } from "../lib/request";
const request = (origin: string, host = "localhost:3000") =>
  ({ headers: new Headers({ origin, host }) }) as NextRequest;
test("Origin checks use request Host and reject cross-site writes", () => {
  assert.equal(sameOrigin(request("http://localhost:3000")), true);
  assert.equal(sameOrigin(request("http://attacker.example")), false);
  assert.equal(sameOrigin(request("not-a-url")), false);
  assert.equal(
    sameOrigin(request("https://game.example", "game.example")),
    true,
  );
});
