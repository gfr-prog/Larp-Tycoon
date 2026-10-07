import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import {
  randomUUID,
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { resolve } from "node:path";
import type { Player, GameState } from "./types";
import {
  settle,
  mutate,
  publicPlayer,
  netWorth,
  aura,
  level,
  finances,
  unlocked,
} from "./economy";
mkdirSync(resolve("data"), { recursive: true });
const globalDb = globalThis as unknown as { larpDb?: DatabaseSync };
export const db =
  globalDb.larpDb ??
  new DatabaseSync(process.env.DATABASE_PATH || resolve("data/game.sqlite"));
globalDb.larpDb = db;
db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,username TEXT NOT NULL COLLATE NOCASE UNIQUE,password TEXT NOT NULL,state TEXT NOT NULL,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS transactions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),reason TEXT NOT NULL,amount INTEGER NOT NULL,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS action_limits(user_id TEXT PRIMARY KEY REFERENCES users(id),last_action INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS auth_limits(key TEXT PRIMARY KEY,attempts INTEGER NOT NULL,window INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS tx_user_time ON transactions(user_id,created DESC);
CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires);`);
export function transaction<T>(f: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = f();
    db.exec("COMMIT");
    return result;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export function readPlayer(id: string) {
  const row = db.prepare("SELECT state FROM users WHERE id=?").get(id) as
    { state: string } | undefined;
  if (!row) throw new Error("Account nicht gefunden.");
  return JSON.parse(row.state) as Player;
}
function save(p: Player) {
  db.prepare("UPDATE users SET state=? WHERE id=?").run(
    JSON.stringify(p),
    p.id,
  );
}
function log(id: string, reason: string, amount: number, now: number) {
  db.prepare("INSERT INTO transactions VALUES(?,?,?,?,?)").run(
    randomUUID(),
    id,
    reason,
    amount,
    now,
  );
}
export function sessionUser(token: string | undefined) {
  if (!token) return null;
  const hash = createHash("sha256").update(token).digest("hex");
  const row = db
    .prepare("SELECT user_id FROM sessions WHERE token=? AND expires>?")
    .get(hash, Date.now()) as { user_id: string } | undefined;
  return row?.user_id ?? null;
}
export function revoke(token: string) {
  db.prepare("DELETE FROM sessions WHERE token=?").run(
    createHash("sha256").update(token).digest("hex"),
  );
}
export function auth(
  mode: string,
  username: string,
  password: string,
  key: string,
) {
  const now = Date.now();
  transaction(() => {
    const limit = db
      .prepare("SELECT attempts,window FROM auth_limits WHERE key=?")
      .get(key) as { attempts: number; window: number } | undefined;
    if (limit && now - limit.window < 600000 && limit.attempts >= 20)
      throw new Error(
        "Zu viele Versuche. Bitte in 10 Minuten erneut versuchen.",
      );
    db.prepare(
      "INSERT INTO auth_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN ?-window>600000 THEN 1 ELSE attempts+1 END,window=CASE WHEN ?-window>600000 THEN ? ELSE window END",
    ).run(key, now, now, now, now);
  });
  return transaction(() => {
    let id: string;
    if (mode === "register") {
      const salt = randomBytes(16).toString("hex");
      id = randomUUID();
      const hash = scryptSync(password, salt, 64).toString("hex");
      const player: Player = {
        id,
        username,
        cash: 10000,
        bank: 0,
        xp: 0,
        earned: 0,
        passiveEarned: 0,
        inventory: [],
        fit: {},
        companies: [],
        jobsDone: 0,
        lastSettled: now,
        created: now,
        playSeconds: 0,
        activeJob: null,
      };
      if (db.prepare("SELECT id FROM users WHERE username=?").get(username))
        throw new Error("Dieser Username ist schon vergeben.");
      db.prepare("INSERT INTO users VALUES(?,?,?,?,?)").run(
        id,
        username,
        `${salt}:${hash}`,
        JSON.stringify(player),
        now,
      );
      log(id, "Startkapital · Viel Glück, zukünftiger CEO", 10000, now);
    } else {
      const row = db
        .prepare("SELECT id,password FROM users WHERE username=?")
        .get(username) as { id: string; password: string } | undefined;
      const [salt, stored] = (
        row?.password || "00000000000000000000000000000000:" + "0".repeat(128)
      ).split(":");
      const valid = timingSafeEqual(
        scryptSync(password, salt, 64),
        Buffer.from(stored, "hex"),
      );
      if (!row || !valid) throw new Error("Username oder Passwort ist falsch.");
      id = row.id;
    }
    const token = randomBytes(32).toString("hex");
    db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
      createHash("sha256").update(token).digest("hex"),
      id,
      now + 30 * 86400000,
    );
    return { token, id };
  });
}
export function snapshot(id: string): GameState {
  return transaction(() => {
    const p = readPlayer(id);
    const now = Date.now();
    const elapsed = Math.min(20, Math.max(0, (now - p.lastSettled) / 1000));
    const gain = settle(p, now);
    p.playSeconds += elapsed;
    save(p);
    if (gain) log(id, "Unternehmensgewinn", gain, now);
    return {
      player: p,
      netWorth: netWorth(p),
      aura: aura(p),
      level: level(p),
      income: p.companies.reduce((a, c) => a + finances(c).profit, 0),
      leaderboard: leaderboard(),
      achievements: unlocked(p),
      transactions: db
        .prepare(
          "SELECT id,reason,amount,created FROM transactions WHERE user_id=? ORDER BY created DESC LIMIT 20",
        )
        .all(id) as GameState["transactions"],
    };
  });
}
export function leaderboard() {
  return (db.prepare("SELECT state FROM users").all() as { state: string }[])
    .map((r) => publicPlayer(JSON.parse(r.state)))
    .sort((a, b) => b.netWorth - a.netWorth)
    .slice(0, 50);
}
export function action(id: string, input: Record<string, unknown>) {
  transaction(() => {
    const now = Date.now();
    const rate = db
      .prepare("SELECT last_action FROM action_limits WHERE user_id=?")
      .get(id) as { last_action: number } | undefined;
    if (rate && now - rate.last_action < 500)
      throw new Error("Einen Moment. Deine letzte Aktion wird verarbeitet.");
    const p = readPlayer(id);
    const gain = settle(p, now);
    if (gain) log(id, "Unternehmensgewinn", gain, now);
    const result = mutate(p, input, now, randomUUID);
    save(p);
    log(id, result.reason, result.amount, now);
    db.prepare(
      "INSERT INTO action_limits VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET last_action=?",
    ).run(id, now, now);
  });
  return snapshot(id);
}
