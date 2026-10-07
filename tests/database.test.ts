import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const directory = mkdtempSync(join(tmpdir(), "larp-test-"));
process.env.DATABASE_PATH = join(directory, "test.sqlite");
const { db, auth, sessionUser, revoke, action, snapshot, readPlayer } =
  await import("../lib/db");
after(() => {
  db.close();
  rmSync(directory, { recursive: true, force: true });
});
test("accounts and sessions persist; usernames are case-insensitive and passwords verified", () => {
  const account = auth("register", "PlayerOne", "password123", "test-1");
  assert.equal(sessionUser(account.token), account.id);
  assert.equal(snapshot(account.id).player.cash, 10000);
  assert.throws(() => auth("register", "playerone", "password123", "test-2"));
  assert.throws(() => auth("login", "PlayerOne", "wrongpass", "test-3"));
  assert.equal(
    auth("login", "playerone", "password123", "test-4").id,
    account.id,
  );
  revoke(account.token);
  assert.equal(sessionUser(account.token), null);
});
test("atomic buys, transaction log, duplicate rejection and action limits", () => {
  const { id } = auth("register", "PlayerTwo", "password123", "test-5");
  const result = action(id, { type: "buy", id: "item-0", cash: 999999999 });
  assert.equal(result.player.cash, 5500);
  assert.equal(result.player.inventory.length, 1);
  assert.ok(result.transactions.some((t) => t.amount === -4500));
  assert.throws(() => action(id, { type: "buy", id: "item-1" }));
  db.prepare("DELETE FROM action_limits WHERE user_id=?").run(id);
  assert.throws(() => action(id, { type: "buy", id: "item-0" }));
  assert.equal(readPlayer(id).cash, 5500);
  assert.equal(readPlayer(id).inventory.length, 1);
  assert.throws(() =>
    action(id, { type: "found", industry: "kiosk", name: "No Money" }),
  );
  assert.equal(readPlayer(id).companies.length, 0);
});
test("failed login attempts are retained and rate-limited", () => {
  for (let i = 0; i < 20; i++)
    assert.throws(() =>
      auth("login", "UnknownUser", "password123", "limiter-key"),
    );
  assert.throws(
    () => auth("login", "UnknownUser", "password123", "limiter-key"),
    /Zu viele Versuche/,
  );
});
