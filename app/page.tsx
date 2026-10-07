"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDownLeft,
  Home,
  BriefcaseBusiness,
  Building2,
  ShoppingBag,
  Shirt,
  User,
  Wallet,
  Trophy,
  Plus,
  Check,
  ChevronRight,
  LogOut,
  X,
  Menu,
  Clock,
  TrendingUp,
  Sparkles,
  Lock,
  LoaderCircle,
  CheckCheck,
  Target,
} from "lucide-react";
import {
  jobs,
  industries,
  items,
  employees,
  upgrades,
  achievements,
  money,
  type Slot,
} from "@/lib/catalog";
import { finances } from "@/lib/economy";
import type { GameState, Player, PublicPlayer } from "@/lib/types";
import Avatar from "@/components/Avatar";
import ItemArt from "@/components/ItemArt";
import Profile from "@/components/Profile";
import CityArt from "@/components/CityArt";
const nav = [
  { id: "home", label: "Overview", icon: Home },
  { id: "work", label: "Work", icon: BriefcaseBusiness },
  { id: "business", label: "Business", icon: Building2 },
  { id: "market", label: "Market", icon: ShoppingBag },
  { id: "style", label: "My wardrobe", icon: Shirt },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "profile", label: "My profile", icon: User },
];
const emptyPlayer: Player = {
  id: "preview",
  username: "Future CEO",
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
};
export default function Game() {
  const [game, setGame] = useState<GameState | null>(null),
    [tab, setTab] = useState("home"),
    [authOpen, setAuthOpen] = useState(false),
    [mode, setMode] = useState("register"),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState<{ text: string; error?: boolean } | null>(
      null,
    ),
    [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [authError, setAuthError] = useState(""),
    [companyName, setCompanyName] = useState(""),
    [industry, setIndustry] = useState("kiosk"),
    [foundOpen, setFoundOpen] = useState(false),
    [selectedCompany, setSelectedCompany] = useState(""),
    [choice, setChoice] = useState<number | null>(null),
    [now, setNow] = useState(Date.now()),
    [filter, setFilter] = useState("all"),
    [rankBy, setRankBy] = useState("wealth"),
    [profile, setProfile] = useState<PublicPlayer | null>(null),
    [mobile, setMobile] = useState(false),
    [loaded, setLoaded] = useState(false);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/game");
      const data = await r.json();
      if (r.ok) {
        setGame(data.player ? data : null);
        setLoaded(true);
      }
    } catch {
      setToast({
        text: "Verbindung unterbrochen. Bitte erneut versuchen.",
        error: true,
      });
    }
  }, []);
  useEffect(() => {
    void refresh();
    const t = setInterval(() => {
      void refresh();
    }, 10000);
    return () => clearInterval(t);
  }, [refresh]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  const p = game?.player || emptyPlayer,
    active = p.activeJob,
    job = jobs.find((j) => j.id === active?.id),
    seconds =
      job && active
        ? Math.max(
            0,
            Math.ceil((job.seconds * 1000 - now + active.started) / 1000),
          )
        : 0;
  const company =
    p.companies.find((c) => c.id === selectedCompany) || p.companies[0];
  const requireAuth = () => {
    if (!game) {
      setAuthOpen(true);
      return false;
    }
    return true;
  };
  const act = async (input: Record<string, unknown>, message?: string) => {
    if (!requireAuth() || busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setGame(data);
      if (message) setToast({ text: message });
      if (input.type === "finishJob") {
        setChoice(null);
        const amount = data.transactions.find(
          (t: { reason: string }) =>
            t.reason.includes("Schicht") || t.reason.includes("Bonus"),
        )?.amount;
        setToast({
          text: `Schicht geschafft! ${money(amount || 0)} verdient.`,
        });
      }
      if (input.type === "found") setFoundOpen(false);
    } catch (e) {
      setToast({
        text: e instanceof Error ? e.message : "Aktion fehlgeschlagen.",
        error: true,
      });
    } finally {
      setBusy(false);
    }
  };
  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setAuthError("");
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, username, password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      await refresh();
      setAuthOpen(false);
      setToast({
        text:
          mode === "register"
            ? "Willkommen! Dein erstes Imperium beginnt mit 100 €."
            : "Willkommen zurück.",
      });
      setPassword("");
    } catch (e) {
      setAuthError(
        e instanceof Error ? e.message : "Anmeldung fehlgeschlagen.",
      );
    } finally {
      setBusy(false);
    }
  };
  const openProfile = async (id: string) => {
    try {
      const r = await fetch(`/api/profile?id=${encodeURIComponent(id)}`);
      if (!r.ok) throw new Error();
      setProfile(await r.json());
    } catch {
      setToast({ text: "Profil nicht verfügbar.", error: true });
    }
  };
  const go = (id: string) => {
    setTab(id);
    setMobile(false);
  };
  const ranks = [...(game?.leaderboard || [])].sort((a, b) =>
    rankBy === "aura"
      ? b.aura - a.aura
      : rankBy === "company"
        ? Math.max(0, ...b.companies.map((c) => finances(c).value)) -
          Math.max(0, ...a.companies.map((c) => finances(c).value))
        : b.netWorth - a.netWorth,
  );
  const rank = game ? game.leaderboard.findIndex((x) => x.id === p.id) + 1 : 0;
  const button = (
    text: string,
    onClick: () => void,
    disabled = false,
    cls = "button",
  ) => (
    <button className={cls} disabled={disabled || busy} onClick={onClick}>
      {text}
      <ArrowUpRight size={16} />
    </button>
  );
  const progress = p.companies.length
    ? Math.min(100, p.inventory.length ? 100 : 75)
    : Math.min(65, (p.cash / 50000) * 65);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <Link href="/" className="brand">
          <span className="brand-symbol">
            L<span>↗</span>
          </span>
          <span>
            LARP<span className="brand-light">TYCOON</span>
          </span>
        </Link>
        <div className="season-label">
          <span className="live-dot" /> THE WORLD IS YOURS <span>01</span>
        </div>
        <div className="nav-label">YOUR EMPIRE</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.id}
              className={tab === n.id ? "nav-item active" : "nav-item"}
              onClick={() => go(n.id)}
            >
              <n.icon size={19} />
              {n.label}
              {n.id === "business" && p.companies.length > 0 && (
                <span className="nav-count">{p.companies.length}</span>
              )}
              {tab === n.id && <span className="nav-marker" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="virtual-note">
            <span>✦</span>
            <strong>Big dreams. Virtual money.</strong>
            <p>Alles im Spiel. Kein Echtgeld.</p>
          </div>
          <button
            className="sidebar-user"
            onClick={() => (game ? go("profile") : setAuthOpen(true))}
          >
            <span className="user-initial">
              {game ? p.username[0].toUpperCase() : "?"}
            </span>
            <span>
              <strong>{game ? p.username : "Dein nächstes Kapitel"}</strong>
              <small>
                {game
                  ? `Level ${game.level} · The come-up`
                  : "Account erstellen"}
              </small>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Navigation öffnen"
            onClick={() => setMobile(!mobile)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            Your empire <ChevronRight size={12} />
            <strong>{nav.find((n) => n.id === tab)?.label}</strong>
          </div>
          <div className="topbar-right">
            <span className="server-status">
              <span className="live-dot" /> LIVE ECONOMY
            </span>
            <span className="top-cash">
              <Wallet size={16} />
              {money(p.cash)}
            </span>
            <button
              className="user-initial small-initial"
              aria-label="Profil öffnen"
              onClick={() => (game ? go("profile") : setAuthOpen(true))}
            >
              {game ? p.username[0].toUpperCase() : "↗"}
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {tab === "home"
                  ? "THE COME-UP STARTS HERE"
                  : tab === "work"
                    ? "NO SHORTCUTS. JUST HUSTLE."
                    : tab === "business"
                      ? "BUILD SOMETHING THAT PAYS"
                      : tab === "market"
                        ? "LOOK THE PART"
                        : tab === "leaderboard"
                          ? "THE HALL OF HUSTLE"
                          : "MAKE IT PERSONAL"}
              </div>
              <h1>
                {tab === "home" ? (
                  <>
                    Let’s build your empire<span>.</span>
                  </>
                ) : tab === "work" ? (
                  "Clock in. Level up."
                ) : tab === "business" ? (
                  "From side hustle to CEO."
                ) : tab === "market" ? (
                  "A little more aura."
                ) : tab === "style" ? (
                  "Your fit. Your statement."
                ) : tab === "leaderboard" ? (
                  "The ones to watch."
                ) : (
                  "Meet the next big thing."
                )}
              </h1>
              <p>
                {tab === "home"
                  ? `Willkommen${game ? ` zurück, ${p.username}` : ""}. Jeder Mogul fängt irgendwo an.`
                  : tab === "work"
                    ? "Ehrliches Geld. Kleine Entscheidungen. Dein erster großer Schritt."
                    : tab === "business"
                      ? "Gründen, investieren, einstellen. Dein Geld geht jetzt arbeiten."
                      : tab === "market"
                        ? "Fiktive Brands. Echter Geschmack. Alles für deinen nächsten Fit."
                        : tab === "leaderboard"
                          ? "Echte Spieler, eine gemeinsame Welt. Alle 10 Sekunden aktualisiert."
                          : "Ein Nobody mit ziemlich großen Plänen."}
              </p>
            </div>
            {tab === "home" ? (
              <button className="outline-button" onClick={() => go("profile")}>
                <User size={15} /> Mein Profil <ArrowUpRight size={15} />
              </button>
            ) : tab === "business" ? (
              button("Firma gründen", () => requireAuth() && setFoundOpen(true))
            ) : null}
          </div>
          {tab === "home" && (
            <>
              <section className="stats-grid">
                <div className="stat-card worth">
                  <div className="stat-label">
                    NET WORTH <TrendingUp size={17} />
                  </div>
                  <div className="stat-value">
                    {money(game?.netWorth || 10000)}
                  </div>
                  <div className="stat-footer">
                    <span className="mini-pill">↗ THE COME-UP</span>
                    <span>Dein gesamtes Vermögen</span>
                  </div>
                  <div className="stat-line" />
                </div>
                <div className="stat-card">
                  <div className="stat-label">
                    CASH <Wallet size={17} />
                  </div>
                  <div className="stat-value">{money(p.cash)}</div>
                  <div className="stat-footer">
                    <span className="stat-dot green" /> Bereit für deinen
                    nächsten Move
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">
                    PASSIVE INCOME <Building2 size={17} />
                  </div>
                  <div className="stat-value">
                    {money(game?.income || 0)}
                    <small>/min</small>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-dot green" />
                    {p.companies.length
                      ? p.companies.length + " aktive Unternehmen"
                      : "Dein Geld arbeitet bald für dich"}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">
                    AURA <Sparkles size={17} />
                  </div>
                  <div className="stat-value">
                    {game?.aura || 0}
                    <span className="aura-star">✦</span>
                  </div>
                  <div className="stat-footer">
                    <span className="stat-dot gold" />
                    {(game?.aura || 0) > 100
                      ? "Du fällst langsam auf."
                      : "Noch undercover. Das ändern wir."}
                  </div>
                </div>
              </section>
              <section className="dashboard-main">
                <div className="hero-card">
                  <div className="hero-copy">
                    <span className="hero-tag">
                      <span className="live-dot" /> YOUR NEXT CHAPTER
                    </span>
                    <h2>
                      Started from
                      <br />
                      the Kinderzimmer.
                    </h2>
                    <p>
                      100 € in der Tasche. Eine Million Möglichkeiten.
                      <br />
                      Dein Imperium baut sich nicht von allein.
                    </p>
                    <button
                      className="cream-button"
                      onClick={() => (game ? go("work") : setAuthOpen(true))}
                    >
                      {game ? "Erstes Geld verdienen" : "Starte deinen Come-up"}
                      <ArrowUpRight size={17} />
                    </button>
                    <div className="hero-footnote">
                      {game
                        ? "Kleine Schichten. Große Ambitionen."
                        : "Kostenlos spielen · Nur virtuelles Geld"}
                    </div>
                  </div>
                  <CityArt />
                  <span className="hero-stamp">
                    EST.
                    <br />
                    <strong>NOW</strong>
                  </span>
                </div>
                <div className="fit-card">
                  <div className="card-heading">
                    <h3>Your current fit</h3>
                    <button className="text-link" onClick={() => go("style")}>
                      Bearbeiten <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <div className="fit-stage">
                    <span className="fit-stage-label">
                      {p.inventory.length
                        ? "THE COLLECTION"
                        : "THE STARTER PACK"}
                    </span>
                    <Avatar fit={p.fit} />
                    <div className="fit-aura">
                      <Sparkles size={13} /> {game?.aura || 0} AURA
                    </div>
                  </div>
                  <div className="fit-caption">
                    <div>
                      <strong>
                        {Object.keys(p.fit).length
                          ? "Your signature look"
                          : "Basic, aber ambitioniert."}
                      </strong>
                      <small>
                        {Object.keys(p.fit).length
                          ? "Dress like your future self."
                          : "Jeder Iconic Fit fängt irgendwo an."}
                      </small>
                    </div>
                    <button
                      className="round-button"
                      aria-label="Kleidung kaufen"
                      onClick={() => go("market")}
                    >
                      <ArrowUpRight size={19} />
                    </button>
                  </div>
                </div>
              </section>
              <section className="dashboard-bottom">
                <div className="card business-overview">
                  <div className="card-heading">
                    <h3>Your business</h3>
                    <button
                      className="text-link"
                      onClick={() => go("business")}
                    >
                      Alle ansehen <ArrowUpRight size={13} />
                    </button>
                  </div>
                  {company ? (
                    <>
                      <div className="company-preview">
                        <span className="business-icon">
                          {
                            industries.find((i) => i.id === company.industry)
                              ?.icon
                          }
                        </span>
                        <div>
                          <strong>{company.name}</strong>
                          <small>
                            {
                              industries.find((i) => i.id === company.industry)
                                ?.name
                            }
                          </small>
                        </div>
                        <span className="tag">ACTIVE</span>
                      </div>
                      <div className="company-numbers">
                        <div>
                          <small>GEWINN / MIN</small>
                          <strong>{money(finances(company).profit)}</strong>
                        </div>
                        <div>
                          <small>FIRMENKONTO</small>
                          <strong>{money(company.cash)}</strong>
                        </div>
                      </div>
                      {button(
                        "Business verwalten",
                        () => go("business"),
                        false,
                        "soft-button",
                      )}
                    </>
                  ) : (
                    <>
                      <div className="business-empty">
                        <div className="empty-icon">
                          <Building2 size={25} />
                          <Plus size={13} />
                        </div>
                        <strong>Dein Name. Über einer Tür.</strong>
                        <p>
                          Gründe deine erste Firma und lass
                          <br />
                          dein Geld für dich arbeiten.
                        </p>
                      </div>
                      {button(
                        "Entdecke die Branchen",
                        () => go("business"),
                        false,
                        "soft-button",
                      )}
                    </>
                  )}
                </div>
                <div className="card goals-card">
                  <div className="card-heading">
                    <h3>The next milestone</h3>
                    <Target size={17} />
                  </div>
                  <div className="goal-title">
                    <span>01</span>
                    <div>
                      <h4>Vom Hustler zum Founder</h4>
                      <p>Dein erster Schritt zum Imperium.</p>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div style={{ width: `${progress}%` }} />
                  </div>
                  <div className="goal-list">
                    {[
                      ["Erstes Kapital verdienen", p.jobsDone > 0],
                      ["Deine erste Firma gründen", p.companies.length > 0],
                      ["Deinen ersten Fit upgraden", p.inventory.length > 0],
                    ].map(([label, done], i) => (
                      <div key={i}>
                        <span
                          className={
                            done ? "check-circle done" : "check-circle"
                          }
                        >
                          {done ? <Check size={12} /> : i + 1}
                        </span>
                        <span>{label}</span>
                        {done && <small>DONE</small>}
                      </div>
                    ))}
                  </div>
                  <button
                    className="text-link bottom-link"
                    onClick={() => go(p.companies.length ? "market" : "work")}
                  >
                    Nächsten Schritt machen <ArrowRight size={15} />
                  </button>
                </div>
                <div className="card leaderboard-card">
                  <div className="card-heading">
                    <h3>The rich list</h3>
                    <span className="tag">LIVE</span>
                  </div>
                  {game?.leaderboard.length ? (
                    <div className="mini-ranking">
                      {game.leaderboard.slice(0, 3).map((r, i) => (
                        <button
                          key={r.id}
                          onClick={() => void openProfile(r.id)}
                        >
                          <span className="rank-num">0{i + 1}</span>
                          <span className="rank-avatar">
                            {r.username[0].toUpperCase()}
                          </span>
                          <span>
                            <strong>
                              {r.username}
                              {r.id === p.id && <em>YOU</em>}
                            </strong>
                            <small>{money(r.netWorth)}</small>
                          </span>
                          <ArrowUpRight size={14} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="ranking-empty">
                      <Trophy size={29} />
                      <strong>Dein Platz wartet auf dich.</strong>
                      <p>
                        Erstelle deinen Account und schreib
                        <br />
                        die erste Zeile der Rich List.
                      </p>
                    </div>
                  )}
                  <button
                    className="soft-button"
                    onClick={() => go("leaderboard")}
                  >
                    Zum Leaderboard <ArrowUpRight size={15} />
                  </button>
                </div>
              </section>
              <div className="world-strip">
                <span className="world-icon">↗</span>
                <span>
                  <strong>Small steps. Unreasonably big dreams.</strong>
                  <small>
                    Kein Pay-to-win. Kein Echtgeld. Nur dein nächster cleverer
                    Move.
                  </small>
                </span>
                <span className="world-strip-right">
                  FROM BROKE TO BESPOKE <Sparkles size={16} />
                </span>
              </div>
            </>
          )}
          {tab === "work" && (
            <>
              {active && job && (
                <div className="card active-job">
                  <div className="card-heading">
                    <h3>
                      {job.icon} Deine Schicht: {job.name}
                    </h3>
                    <span className="tag">
                      <Clock size={13} /> {seconds ? `${seconds}s` : "BEREIT"}
                    </span>
                  </div>
                  <h2>{job.prompt}</h2>
                  <div className="choices">
                    {job.choices.map((c, i) => (
                      <button
                        key={c}
                        className={choice === i ? "choice selected" : "choice"}
                        onClick={() => setChoice(i)}
                      >
                        <span>{i + 1}</span>
                        {c}
                        {choice === i && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                  <div className="job-finish">
                    <p>
                      {seconds
                        ? `Noch ${seconds} Sekunden. Deine Entscheidung wartet nicht auf den Chef.`
                        : "Schicht fertig. Hol dir deinen Lohn."}
                    </p>
                    {button(
                      "Schicht abschließen",
                      () =>
                        void act({
                          type: "finishJob",
                          nonce: active.nonce,
                          choice,
                        }),
                      seconds > 0 || choice === null,
                    )}
                  </div>
                </div>
              )}
              <div className="section-heading">
                <h3>Find your hustle</h3>
                <span>10 Jobs · Beförderung durch Level</span>
              </div>
              <div className="jobs-grid">
                {jobs.map((j) => (
                  <div className="card job-card" key={j.id}>
                    <div className="job-top">
                      <span className="catalog-icon">{j.icon}</span>
                      <span className="tag">{j.category}</span>
                    </div>
                    <h3>{j.name}</h3>
                    <p>
                      {j.seconds}s Schicht · +{j.xp} XP
                    </p>
                    <div className="job-pay">
                      <strong>{money(j.pay * 100)}</strong>
                      <span>bis +25 % Bonus</span>
                    </div>
                    {button(
                      (game?.level || 1) < j.level
                        ? `Ab Level ${j.level}`
                        : "Schicht starten",
                      () => {
                        setChoice(null);
                        void act({ type: "startJob", id: j.id });
                      },
                      !!active || (game?.level || 1) < j.level,
                      "soft-button",
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "business" && (
            <>
              {p.companies.length > 0 && (
                <>
                  <div className="company-tabs">
                    {p.companies.map((c) => (
                      <button
                        className={c.id === company?.id ? "selected" : ""}
                        key={c.id}
                        onClick={() => setSelectedCompany(c.id)}
                      >
                        {industries.find((i) => i.id === c.industry)?.icon}{" "}
                        {c.name}
                      </button>
                    ))}
                  </div>
                  {company && (
                    <>
                      <div className="card company-detail">
                        <div className="company-detail-title">
                          <span className="business-icon">
                            {
                              industries.find((i) => i.id === company.industry)
                                ?.icon
                            }
                          </span>
                          <div>
                            <h2>{company.name}</h2>
                            <p>
                              {
                                industries.find(
                                  (i) => i.id === company.industry,
                                )?.name
                              }{" "}
                              · {company.employees.length} Mitarbeiter ·{" "}
                              {company.upgrades.length} Upgrades
                            </p>
                          </div>
                          <span className="tag">ACTIVE</span>
                        </div>
                        <div className="business-stats">
                          {[
                            ["Umsatz / min", finances(company).revenue],
                            ["Kosten / min", finances(company).costs],
                            ["Gewinn / min", finances(company).profit],
                            ["Unternehmenswert", finances(company).value],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <small>{label}</small>
                              <strong>{money(Number(value))}</strong>
                            </div>
                          ))}
                        </div>
                        <div className="withdraw">
                          <span>
                            Firmenkonto <strong>{money(company.cash)}</strong>
                          </span>
                          {button(
                            "Gewinn entnehmen",
                            () =>
                              void act(
                                { type: "withdraw", company: company.id },
                                "Gewinn aufs Privatkonto überwiesen.",
                              ),
                            company.cash <= 0,
                          )}
                        </div>
                      </div>
                      <div className="section-heading">
                        <h3>Invest in your business</h3>
                        <span>Mehr Wachstum, mehr laufende Kosten.</span>
                      </div>
                      <div className="upgrade-grid">
                        {upgrades.map((u) => {
                          const owned = company.upgrades.includes(u.id);
                          return (
                            <div className="card upgrade-card" key={u.id}>
                              <span className="catalog-icon">
                                <TrendingUp size={21} />
                              </span>
                              <h3>{u.name}</h3>
                              <p>
                                +{Math.round(u.boost * 100)} % Umsatz · +
                                {Math.round(u.boost * 35)} % Betriebskosten
                              </p>
                              {button(
                                owned ? "Installiert" : money(u.price * 100),
                                () =>
                                  void act(
                                    {
                                      type: "upgrade",
                                      id: u.id,
                                      company: company.id,
                                    },
                                    "Upgrade installiert. Dein Business wächst.",
                                  ),
                                owned,
                                "soft-button",
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="section-heading">
                        <h3>Meet your next hire</h3>
                        <span>
                          Gehälter werden laufend vom Umsatz abgezogen.
                        </span>
                      </div>
                      <div className="employee-grid">
                        {employees.map((e) => {
                          const hired = company.employees.includes(e.id);
                          return (
                            <div className="card employee-card" key={e.id}>
                              <div className="employee-avatar">{e.name[0]}</div>
                              <div>
                                <h3>{e.name}</h3>
                                <p>
                                  {e.role} · Skill {e.skill}
                                </p>
                                <small>
                                  +{Math.round(e.boost * 100)} % Umsatz ·{" "}
                                  {money(e.salary * 100)}/min Gehalt
                                </small>
                              </div>
                              {button(
                                hired
                                  ? "Im Team"
                                  : `Einstellen · ${money(e.hireCost * 100)}`,
                                () =>
                                  void act(
                                    {
                                      type: "hire",
                                      id: e.id,
                                      company: company.id,
                                    },
                                    `${e.name} gehört jetzt zum Team.`,
                                  ),
                                hired,
                                "soft-button",
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
              <div className="section-heading">
                <h3>
                  {p.companies.length
                    ? "Your next venture"
                    : "Choose your first venture"}
                </h3>
                <span>4 Branchen. Vier Wege nach oben.</span>
              </div>
              <div className="industry-grid">
                {industries.map((i) => (
                  <div className="card industry-card" key={i.id}>
                    <div
                      className="industry-art"
                      style={{ "--industry": i.accent } as React.CSSProperties}
                    >
                      <span>{i.icon}</span>
                      <span className="industry-art-text">
                        {i.name.toUpperCase()}
                      </span>
                    </div>
                    <h3>{i.name}</h3>
                    <p>{i.description}</p>
                    <div className="industry-info">
                      <span>
                        Gründung <strong>{money(i.cost * 100)}</strong>
                      </span>
                      <span>
                        Gewinn{" "}
                        <strong>
                          {money((i.revenue - i.costs) * 100)}/min
                        </strong>
                      </span>
                    </div>
                    {button(
                      "Firma gründen",
                      () => {
                        if (requireAuth()) {
                          setIndustry(i.id);
                          setFoundOpen(true);
                        }
                      },
                      false,
                      "soft-button",
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "market" && (
            <>
              <div className="shop-banner">
                <div>
                  <span className="eyebrow">THE FIRST COLLECTION</span>
                  <h2>
                    Dress for the life
                    <br />
                    you’re building.
                  </h2>
                  <p>NØRD · OFF HOURS · MAISON VOID</p>
                </div>
                <div className="shop-banner-art">
                  <Shirt strokeWidth={1} size={116} />
                  <span>01 / ESSENTIALS</span>
                </div>
              </div>
              <div className="filter-row">
                {[
                  ["all", "All items"],
                  ["top", "Tops & jackets"],
                  ["pants", "Pants"],
                  ["shoes", "Sneakers"],
                  ["hat", "Caps"],
                  ["accessory", "Accessories"],
                ].map(([id, label]) => (
                  <button
                    className={filter === id ? "selected" : ""}
                    key={id}
                    onClick={() => setFilter(id)}
                  >
                    {label}
                  </button>
                ))}
                <span>30 pieces. Zero real brands.</span>
              </div>
              <div className="items-grid">
                {items
                  .filter((i) => filter === "all" || i.slot === filter)
                  .map((i) => {
                    const owned = p.inventory.includes(i.id);
                    return (
                      <div className="item-card" key={i.id}>
                        <div
                          className={`item-visual slot-${i.slot}`}
                          style={
                            { "--item-color": i.color } as React.CSSProperties
                          }
                        >
                          <span className={`rarity ${i.rarity.toLowerCase()}`}>
                            {i.rarity}
                          </span>
                          <ItemArt slot={i.slot} color={i.color} />
                          <span className="item-aura">✦ +{i.aura}</span>
                        </div>
                        <div className="item-copy">
                          <span className="item-brand">{i.brand}</span>
                          <h3>{i.name}</h3>
                          <div className="item-bottom">
                            <strong>{money(i.price * 100)}</strong>
                            <button
                              className={
                                owned ? "buy-button owned" : "buy-button"
                              }
                              disabled={busy}
                              aria-label={
                                owned
                                  ? `${i.name} anziehen`
                                  : `${i.name} kaufen`
                              }
                              onClick={() =>
                                void act(
                                  { type: owned ? "equip" : "buy", id: i.id },
                                  owned
                                    ? "Fit aktualisiert. Fresh."
                                    : "Neues Item! Du findest es in deiner Garderobe.",
                                )
                              }
                            >
                              {owned ? <Check size={17} /> : <Plus size={19} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
          {tab === "style" && (
            <div className="wardrobe-layout">
              <div className="card wardrobe-avatar">
                <span className="eyebrow">THE CURRENT FIT</span>
                <Avatar fit={p.fit} />
                <h2>{p.username}</h2>
                <div className="fit-aura">
                  <Sparkles size={15} /> {game?.aura || 0} AURA
                </div>
                <p>Dein Status ist mehr als dein Kontostand.</p>
              </div>
              <div>
                <div className="card equipped-card">
                  <div className="card-heading">
                    <h3>Was du gerade trägst</h3>
                    <span className="tag">
                      {Object.keys(p.fit).length}/5 SLOTS
                    </span>
                  </div>
                  {(
                    ["top", "pants", "shoes", "hat", "accessory"] as Slot[]
                  ).map((slot, i) => {
                    const item = items.find((x) => x.id === p.fit[slot]);
                    return (
                      <div className="equipped-row" key={slot}>
                        <span>
                          {
                            ["Oberteil", "Hose", "Schuhe", "Cap", "Accessoire"][
                              i
                            ]
                          }
                        </span>
                        <strong>{item?.name || "Basic"}</strong>
                        {item ? (
                          <button
                            className="icon-button"
                            aria-label={`${item.name} ausziehen`}
                            onClick={() =>
                              void act(
                                { type: "unequip", slot },
                                "Zurück zu Basics.",
                              )
                            }
                          >
                            <X size={14} />
                          </button>
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="section-heading">
                  <h3>Your collection</h3>
                  <span>{p.inventory.length} Items</span>
                </div>
                {!p.inventory.length ? (
                  <div className="card wardrobe-empty">
                    <Shirt size={35} />
                    <h3>Dein erster guter Fit wartet.</h3>
                    <p>Mit dem Essential Tee fängt alles an. Ab 45 €.</p>
                    {button("Zum Clothing Shop", () => go("market"))}
                  </div>
                ) : (
                  <div className="inventory-grid">
                    {p.inventory.map((id) => {
                      const item = items.find((i) => i.id === id)!;
                      return (
                        <div className="card inventory-item" key={id}>
                          <ItemArt slot={item.slot} color={item.color} />
                          <h3>{item.name}</h3>
                          <p>
                            {item.brand} · +{item.aura} Aura
                          </p>
                          {button(
                            p.fit[item.slot] === id ? "Angezogen" : "Anziehen",
                            () =>
                              void act(
                                { type: "equip", id },
                                "Fit aktualisiert.",
                              ),
                            p.fit[item.slot] === id,
                            "soft-button",
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          {tab === "leaderboard" && (
            <>
              <div className="filter-row">
                {[
                  ["wealth", "Richest players"],
                  ["aura", "Freshest players"],
                  ["company", "Biggest businesses"],
                ].map(([id, name]) => (
                  <button
                    key={id}
                    className={rankBy === id ? "selected" : ""}
                    onClick={() => setRankBy(id)}
                  >
                    {name}
                  </button>
                ))}
                <span>
                  <span className="live-dot" /> Live · 10s
                </span>
              </div>
              <div className="card full-ranking">
                <div className="ranking-header">
                  <span>RANK</span>
                  <span>PLAYER</span>
                  <span>
                    {rankBy === "aura"
                      ? "AURA"
                      : rankBy === "company"
                        ? "FIRMENWERT"
                        : "NET WORTH"}
                  </span>
                  <span>LEVEL</span>
                </div>
                {ranks.length ? (
                  ranks.map((r, i) => (
                    <button
                      className="ranking-row"
                      key={r.id}
                      onClick={() => void openProfile(r.id)}
                    >
                      <span className="rank-num">
                        {i + 1 < 10 ? "0" : ""}
                        {i + 1}
                      </span>
                      <div>
                        <Avatar fit={r.fit} small />
                        <strong>
                          {r.username}
                          {r.id === p.id && <em>YOU</em>}
                        </strong>
                      </div>
                      <strong>
                        {rankBy === "aura"
                          ? `${r.aura} ✦`
                          : rankBy === "company"
                            ? money(
                                Math.max(
                                  0,
                                  ...r.companies.map((c) => finances(c).value),
                                ),
                              )
                            : money(r.netWorth)}
                      </strong>
                      <span>
                        LVL {r.level}
                        <ArrowUpRight size={15} />
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="wardrobe-empty">
                    <Trophy size={40} />
                    <h3>Noch ist die Spitze frei.</h3>
                    <p>Registriere dich und werde der erste Tycoon.</p>
                    {button("Account erstellen", () => setAuthOpen(true))}
                  </div>
                )}
              </div>
              {rank > 0 && (
                <div className="rank-note">
                  Du stehst aktuell auf Platz <strong>#{rank}</strong>. Dein
                  nächster Move zählt.
                </div>
              )}
            </>
          )}
          {tab === "profile" && (
            <>
              <Profile
                player={
                  game
                    ? {
                        id: p.id,
                        username: p.username,
                        fit: p.fit,
                        netWorth: game.netWorth,
                        aura: game.aura,
                        level: game.level,
                        companies: p.companies,
                        achievements: game.achievements,
                      }
                    : {
                        id: p.id,
                        username: "Future CEO",
                        fit: {},
                        netWorth: 10000,
                        aura: 0,
                        level: 1,
                        companies: [],
                        achievements: [],
                      }
                }
              />
              <div className="profile-bottom">
                <div className="card">
                  <div className="card-heading">
                    <h3>Your milestones</h3>
                    <span>{game?.achievements.length || 0}/20</span>
                  </div>
                  <div className="achievement-grid">
                    {achievements.map((a) => (
                      <div
                        className={
                          game?.achievements.includes(a.id)
                            ? "achievement unlocked"
                            : "achievement"
                        }
                        key={a.id}
                      >
                        {game?.achievements.includes(a.id) ? (
                          <Trophy size={20} />
                        ) : (
                          <Lock size={18} />
                        )}
                        <strong>{a.name}</strong>
                        <small>{a.description}</small>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card activity-card">
                  <div className="card-heading">
                    <h3>The paper trail</h3>
                    <CheckCheck size={17} />
                  </div>
                  {game?.transactions.length ? (
                    game.transactions.slice(0, 8).map((t) => (
                      <div className="activity" key={t.id}>
                        <span
                          className={
                            t.amount >= 0
                              ? "activity-icon positive"
                              : "activity-icon"
                          }
                        >
                          {t.amount >= 0 ? (
                            <ArrowDownLeft size={16} />
                          ) : (
                            <ArrowUpRight size={16} />
                          )}
                        </span>
                        <div>
                          <strong>{t.reason}</strong>
                          <small>
                            {new Date(t.created).toLocaleTimeString("de-DE", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </div>
                        <strong className={t.amount > 0 ? "positive-text" : ""}>
                          {t.amount > 0 ? "+" : ""}
                          {money(t.amount)}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className="muted">
                      Deine Geschichte wird hier gespeichert.
                    </p>
                  )}
                  <div className="account-stats">
                    <span>{p.jobsDone} Schichten</span>
                    <span>{Math.floor(p.playSeconds / 60)} Min. Spielzeit</span>
                  </div>
                  {game ? (
                    <button
                      className="outline-button logout"
                      onClick={async () => {
                        await fetch("/api/auth", { method: "DELETE" });
                        setGame(null);
                        setTab("home");
                      }}
                    >
                      <LogOut size={16} /> Abmelden
                    </button>
                  ) : (
                    button("Deine Geschichte starten", () => setAuthOpen(true))
                  )}
                </div>
              </div>
            </>
          )}
          <footer>
            <span>
              LARP TYCOON <span>© 2026</span>
            </span>
            <span>
              Build your empire. Keep it fictional.{" "}
              <span className="footer-star">✦</span>
            </span>
          </footer>
        </main>
      </div>
      {authOpen && (
        <div className="modal-backdrop" onClick={() => setAuthOpen(false)}>
          <div
            className="modal auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Schließen"
              onClick={() => setAuthOpen(false)}
            >
              <X size={21} />
            </button>
            <div className="modal-mark">↗</div>
            <span className="eyebrow">FROM BROKE TO BESPOKE</span>
            <h2 id="auth-title">
              {mode === "register"
                ? "Big dreams start small."
                : "Back to business."}
            </h2>
            <p>
              {mode === "register"
                ? "Dein Kinderzimmer. 100 €. Und alles, was du daraus machst."
                : "Dein Imperium wartet auf dich."}
            </p>
            <div className="auth-tabs">
              <button
                className={mode === "register" ? "selected" : ""}
                onClick={() => {
                  setMode("register");
                  setAuthError("");
                }}
              >
                Account erstellen
              </button>
              <button
                className={mode === "login" ? "selected" : ""}
                onClick={() => {
                  setMode("login");
                  setAuthError("");
                }}
              >
                Einloggen
              </button>
            </div>
            <form onSubmit={authenticate}>
              <label>
                Username
                <input
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  minLength={3}
                  maxLength={20}
                  required
                  placeholder="Dein zukünftiger Forbes-Name"
                  pattern="[a-zA-Z0-9_]{3,20}"
                />
              </label>
              <label>
                Passwort
                <input
                  type="password"
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                  placeholder="Mindestens 8 Zeichen"
                />
              </label>
              {authError && (
                <div className="form-error" role="alert">
                  {authError}
                </div>
              )}
              <button className="button full" disabled={busy}>
                {busy ? (
                  <LoaderCircle className="spin" size={18} />
                ) : mode === "register" ? (
                  "Mein Imperium starten"
                ) : (
                  "Einloggen"
                )}
                <ArrowUpRight size={17} />
              </button>
            </form>
            <p className="auth-note">
              <Lock size={12} /> Nur virtuelles Geld. Kein Pay-to-win.
            </p>
          </div>
        </div>
      )}
      {foundOpen && (
        <div className="modal-backdrop" onClick={() => setFoundOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="found-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Schließen"
              onClick={() => setFoundOpen(false)}
            >
              <X size={21} />
            </button>
            <span className="eyebrow">HELLO, CEO.</span>
            <h2 id="found-title">Mach es offiziell.</h2>
            <p>Die nächste große Firma braucht einen Namen.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void act(
                  { type: "found", industry, name: companyName },
                  "Du bist jetzt CEO. Mach was draus.",
                );
              }}
            >
              <label>
                Firmenname
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  minLength={3}
                  maxLength={32}
                  required
                  placeholder="z. B. Corner Culture"
                />
              </label>
              <label>
                Branche
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  {industries.map((i) => (
                    <option value={i.id} key={i.id}>
                      {i.icon} {i.name} · {money(i.cost * 100)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="found-summary">
                <span>Gründungskosten</span>
                <strong>
                  {money(industries.find((i) => i.id === industry)!.cost * 100)}
                </strong>
              </div>
              <div className="found-summary">
                <span>Dein Cash</span>
                <strong>{money(p.cash)}</strong>
              </div>
              <button
                className="button full"
                disabled={
                  busy ||
                  p.cash < industries.find((i) => i.id === industry)!.cost * 100
                }
              >
                Firma gründen <ArrowUpRight size={17} />
              </button>
            </form>
          </div>
        </div>
      )}
      {profile && (
        <div className="modal-backdrop" onClick={() => setProfile(null)}>
          <div
            className="modal public-profile"
            role="dialog"
            aria-modal="true"
            aria-label={`Profil von ${profile.username}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              aria-label="Schließen"
              onClick={() => setProfile(null)}
            >
              <X size={21} />
            </button>
            <Profile player={profile} />
            <Link className="soft-button" href={`/player/${profile.id}`}>
              Öffentliches Profil öffnen <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      )}
      {toast && (
        <div className={toast.error ? "toast error" : "toast"} role="status">
          {toast.error ? <X size={19} /> : <Check size={19} />}
          <span>{toast.text}</span>
          <button
            aria-label="Benachrichtigung schließen"
            onClick={() => setToast(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {!loaded && (
        <div className="loading-indicator">
          <LoaderCircle size={15} className="spin" /> Economy verbinden …
        </div>
      )}
    </div>
  );
}
