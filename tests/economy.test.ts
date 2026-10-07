import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mutate,
  settle,
  netWorth,
  aura,
  finances,
  level,
} from "../lib/economy";
import type { Player } from "../lib/types";
const player = (): Player => ({
  id: "test",
  username: "tester",
  cash: 10000,
  bank: 0,
  xp: 0,
  earned: 0,
  passiveEarned: 0,
  inventory: [],
  fit: {},
  companies: [],
  jobsDone: 0,
  lastSettled: 0,
  created: 0,
  playSeconds: 0,
  activeJob: null,
});
let counter = 0;
const uuid = () => `id-${counter++}`;
test("job reward is server-calculated, timed and cannot be replayed", () => {
  const p = player();
  mutate(p, { type: "startJob", id: "papers" }, 0, uuid);
  const nonce = p.activeJob!.nonce;
  assert.throws(() =>
    mutate(
      p,
      { type: "finishJob", nonce, choice: 0, cash: 10000000 },
      11000,
      uuid,
    ),
  );
  mutate(
    p,
    { type: "finishJob", nonce, choice: 0, cash: 10000000 },
    12000,
    uuid,
  );
  assert.equal(p.cash, 14750);
  assert.equal(p.jobsDone, 1);
  assert.throws(() =>
    mutate(p, { type: "finishJob", nonce, choice: 0 }, 13000, uuid),
  );
});
test("founding, staff, upgrades, profits, withdrawals and clothing form a complete loop", () => {
  const p = player();
  p.cash = 100000;
  mutate(p, { type: "found", industry: "kiosk", name: "Test Kiosk" }, 0, uuid);
  const c = p.companies[0];
  mutate(p, { type: "hire", company: c.id, id: "employee-0" }, 1000, uuid);
  mutate(p, { type: "upgrade", company: c.id, id: "sign" }, 2000, uuid);
  const f = finances(c);
  assert.ok(f.revenue > 1800);
  assert.ok(f.costs > 600);
  assert.ok(f.profit > 1200);
  const cash = p.cash;
  settle(p, 60000);
  assert.equal(c.cash, f.profit);
  mutate(p, { type: "withdraw", company: c.id }, 61000, uuid);
  assert.equal(p.cash, cash + f.profit);
  assert.equal(c.cash, 0);
  assert.throws(() =>
    mutate(p, { type: "withdraw", company: c.id }, 62000, uuid),
  );
  mutate(p, { type: "buy", id: "item-0" }, 63000, uuid);
  mutate(p, { type: "equip", id: "item-0" }, 64000, uuid);
  assert.equal(aura(p), 33);
  assert.ok(netWorth(p) > p.cash);
});
test("insufficient funds, duplicate ownership, locked jobs and foreign companies rejected", () => {
  const p = player();
  assert.throws(() =>
    mutate(p, { type: "found", industry: "kiosk", name: "Broke Inc" }, 0, uuid),
  );
  assert.throws(() => mutate(p, { type: "startJob", id: "analyst" }, 0, uuid));
  assert.throws(() =>
    mutate(
      p,
      { type: "hire", company: "someone-else", id: "employee-0" },
      0,
      uuid,
    ),
  );
  assert.throws(() => mutate(p, { type: "equip", id: "item-0" }, 0, uuid));
  mutate(p, { type: "buy", id: "item-0" }, 0, uuid);
  assert.throws(() => mutate(p, { type: "buy", id: "item-0" }, 0, uuid));
  assert.equal(p.cash, 5500);
});
test("absence is capped at 8 hours and duplicate settlement yields no money", () => {
  const p = player();
  p.cash = 50000;
  mutate(p, { type: "found", industry: "kiosk", name: "Cap Inc" }, 0, uuid);
  assert.equal(settle(p, 100 * 86400000), 1200 * 480);
  assert.equal(settle(p, 100 * 86400000), 0);
});
test("XP scales levels without instant endgame unlocks", () => {
  const p = player();
  assert.equal(level(p), 1);
  p.xp = 50;
  assert.equal(level(p), 2);
  p.xp = 200;
  assert.equal(level(p), 3);
});
