import {
  industries,
  items,
  employees,
  upgrades,
  achievements,
  jobs,
} from "./catalog";
import type { Player, Company, PublicPlayer } from "./types";
export const level = (p: Player) => 1 + Math.floor(Math.sqrt(p.xp / 50));
export function finances(c: Company) {
  const industry = industries.find((x) => x.id === c.industry)!;
  const boost = c.upgrades.reduce(
    (a, id) => a + (upgrades.find((x) => x.id === id)?.boost || 0),
    0,
  );
  const staff = c.employees.map((id) => employees.find((x) => x.id === id)!);
  const revenue = Math.round(
    industry.revenue *
      (1 + boost + staff.reduce((a, e) => a + e.boost, 0)) *
      100,
  );
  const costs = Math.round(
    (industry.costs * (1 + boost * 0.35) +
      staff.reduce((a, e) => a + e.salary, 0)) *
      100,
  );
  return {
    revenue,
    costs,
    profit: revenue - costs,
    value:
      industry.cost * 100 +
      c.upgrades.reduce(
        (a, id) => a + upgrades.find((x) => x.id === id)!.price * 70,
        0,
      ) +
      staff.reduce((a, e) => a + e.hireCost * 50, 0),
  };
}
export const netWorth = (p: Player) =>
  p.cash +
  p.bank +
  p.companies.reduce((a, c) => a + c.cash + finances(c).value, 0) +
  p.inventory.reduce(
    (a, id) => a + (items.find((x) => x.id === id)?.price || 0) * 60,
    0,
  );
export const aura = (p: Player) =>
  Object.values(p.fit).reduce(
    (a, id) => a + (items.find((x) => x.id === id)?.aura || 0),
    0,
  ) +
  p.companies.length * 25;
export function unlocked(p: Player) {
  const nw = netWorth(p),
    au = aura(p),
    staff = p.companies.reduce((a, c) => a + c.employees.length, 0),
    ups = p.companies.reduce((a, c) => a + c.upgrades.length, 0);
  const checks = [
    p.earned >= 100000,
    p.companies.length >= 1,
    au >= 1000,
    nw >= 100000000,
    p.companies.length >= 5,
    nw >= 100000000000,
    p.jobsDone >= 1,
    p.jobsDone >= 10,
    p.jobsDone >= 50,
    p.inventory.length >= 1,
    p.inventory.length >= 5,
    p.inventory.length >= 15,
    staff >= 1,
    staff >= 5,
    ups >= 1,
    ups >= 5,
    p.passiveEarned >= 10000,
    level(p) >= 5,
    level(p) >= 10,
    au >= 100,
  ];
  return achievements.filter((_, i) => checks[i]).map((x) => x.id);
}
export const publicPlayer = (p: Player): PublicPlayer => ({
  id: p.id,
  username: p.username,
  netWorth: netWorth(p),
  aura: aura(p),
  level: level(p),
  fit: p.fit,
  companies: p.companies,
  achievements: unlocked(p),
});
export function settle(p: Player, now: number) {
  const minutes = Math.min(480, Math.max(0, (now - p.lastSettled) / 60000));
  const amount = p.companies.reduce((a, c) => {
    const gain = Math.floor(finances(c).profit * minutes);
    c.cash += gain;
    return a + gain;
  }, 0);
  p.passiveEarned += amount;
  p.earned += amount;
  p.lastSettled = now;
  return amount;
}
export function mutate(
  p: Player,
  action: Record<string, unknown>,
  now: number,
  uuid: () => string,
) {
  const str = (key: string) =>
    typeof action[key] === "string" ? (action[key] as string) : "";
  const pay = (amount: number) => {
    if (!Number.isSafeInteger(amount) || amount < 0 || p.cash < amount)
      throw new Error("Dafür fehlt dir noch das Kapital.");
    p.cash -= amount;
  };
  let amount = 0,
    reason = "";
  switch (action.type) {
    case "startJob": {
      if (p.activeJob) throw new Error("Deine Schicht läuft bereits.");
      const job = jobs.find((j) => j.id === str("id"));
      if (!job || level(p) < job.level)
        throw new Error("Dieser Job ist noch nicht freigeschaltet.");
      p.activeJob = { id: job.id, started: now, nonce: uuid() };
      reason = "Schicht gestartet";
      break;
    }
    case "finishJob": {
      const active = p.activeJob;
      if (!active || active.nonce !== str("nonce"))
        throw new Error("Diese Schicht wurde bereits abgeschlossen.");
      const job = jobs.find((j) => j.id === active.id)!;
      if (now - active.started < job.seconds * 1000)
        throw new Error("Deine Schicht ist noch nicht fertig.");
      if (
        !Number.isInteger(action.choice) ||
        Number(action.choice) < 0 ||
        Number(action.choice) > 2
      )
        throw new Error("Wähle eine Antwort.");
      amount = Math.round(
        job.pay * 100 * (action.choice === job.answer ? 1.25 : 0.8),
      );
      p.cash += amount;
      p.earned += amount;
      p.xp += job.xp;
      p.jobsDone++;
      p.activeJob = null;
      reason = `${job.name} · ${action.choice === job.answer ? "Bonus verdient" : "Schicht bezahlt"}`;
      break;
    }
    case "found": {
      const industry = industries.find((x) => x.id === str("industry"));
      const name = str("name").trim();
      if (!industry || name.length < 3 || name.length > 32)
        throw new Error("Firmenname: 3–32 Zeichen.");
      if (p.companies.length >= 10)
        throw new Error("Maximal 10 Firmen in Phase 1.");
      amount = -industry.cost * 100;
      pay(-amount);
      p.companies.push({
        id: uuid(),
        name,
        industry: industry.id,
        cash: 0,
        employees: [],
        upgrades: [],
        created: now,
      });
      p.xp += 50;
      reason = `${name} gegründet`;
      break;
    }
    case "hire":
    case "upgrade":
    case "withdraw": {
      const c = p.companies.find((c) => c.id === str("company"));
      if (!c) throw new Error("Firma nicht gefunden.");
      if (action.type === "withdraw") {
        if (c.cash <= 0) throw new Error("Noch kein Gewinn verfügbar.");
        amount = c.cash;
        c.cash = 0;
        p.cash += amount;
        reason = `Gewinnentnahme · ${c.name}`;
      } else if (action.type === "hire") {
        const e = employees.find((x) => x.id === str("id"));
        if (!e || c.employees.includes(e.id))
          throw new Error("Mitarbeiter nicht verfügbar.");
        if (c.employees.length >= 8) throw new Error("Dein Team ist voll.");
        amount = -e.hireCost * 100;
        pay(-amount);
        c.employees.push(e.id);
        reason = `${e.name} eingestellt`;
      } else {
        const u = upgrades.find((x) => x.id === str("id"));
        if (!u || c.upgrades.includes(u.id))
          throw new Error("Upgrade bereits vorhanden.");
        amount = -u.price * 100;
        pay(-amount);
        c.upgrades.push(u.id);
        reason = `${u.name} · ${c.name}`;
      }
      break;
    }
    case "buy": {
      const item = items.find((x) => x.id === str("id"));
      if (!item || p.inventory.includes(item.id))
        throw new Error("Item bereits in deinem Inventar.");
      amount = -item.price * 100;
      pay(-amount);
      p.inventory.push(item.id);
      reason = `${item.brand} ${item.name}`;
      break;
    }
    case "equip": {
      const item = items.find((x) => x.id === str("id"));
      if (!item || !p.inventory.includes(item.id))
        throw new Error("Dieses Item gehört dir nicht.");
      p.fit[item.slot] = item.id;
      reason = `${item.name} angezogen`;
      break;
    }
    case "unequip": {
      const slot = str("slot");
      if (!["top", "pants", "shoes", "hat", "accessory"].includes(slot))
        throw new Error("Ungültiger Slot.");
      delete p.fit[slot as keyof typeof p.fit];
      reason = "Basic-Fit angezogen";
      break;
    }
    default:
      throw new Error("Unbekannte Aktion.");
  }
  if (!Number.isSafeInteger(p.cash) || p.cash < 0)
    throw new Error("Ungültiger Kontostand.");
  return { amount, reason };
}
