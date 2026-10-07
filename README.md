# LARP TYCOON — Phase 1

Ein spielbarer Multiplayer-Tycoon mit Next.js, TypeScript und React. Alles ist virtuell. Die App braucht keine externen Keys.

## Start

Node.js **24 LTS** (wegen `node:sqlite` und dem Test-Runner).

```sh
cd /workspace/larp-tycoon
npm ci
npm run dev
```

Öffne `http://localhost:3000`. Registriere einen Username (3–20 Buchstaben, Zahlen oder Unterstriche) mit einem Passwort ab 8 Zeichen. Weitere Spieler können auf demselben Server eigene Accounts erstellen. Der SQLite-Fallback ist eine gemeinsame serverseitige Datenbank, kein Browser-LocalStorage.

Für den Produktionsmodus:

```sh
npm run build
npm start
```

## Spielbarer Loop

100 € Startkapital → bezahlte Schichten mit Entscheidung und Wartezeit → erster Kiosk ab 500 € → Mitarbeiter und Upgrades → laufender Gewinn im Firmenkonto → Gewinn entnehmen → Kleidung kaufen → Fit anziehen → mehr Aura und Rang im Leaderboard.

Schichten bringen bei richtiger Entscheidung einen 25-%-Bonus, sonst 80 % des Grundlohns. XP schalten besser bezahlte Jobs frei. Der Kiosk ist nach ungefähr neun Zeitungsschichten erreichbar. Größere Firmen kosten 1.200 €, 1.800 € und 4.000 €. Geldbeträge sind ausschließlich ganzzahlige Euro-Cents.

Enthalten: Landing-Dashboard, Registrierung/Login/Logout, einzigartige Usernames, Spielerprofile inklusive öffentlich teilbarer `/player/<id>`-Seite, Cash und Net Worth, 10 Jobs, 4 Branchen, 10 Upgrades, 15 Mitarbeiterkandidaten, 30 Kleidungsstücke, Inventar, fünf sichtbare Avatar-Slots, Aura, drei Leaderboard-Ansichten und 20 Achievements. Es gibt keine erfundenen Leaderboard-Spieler. Die Liste wird aus echten Accounts erzeugt und alle 10 Sekunden aktualisiert.

## Architektur

- `app/page.tsx`: responsive Spieloberfläche, Navigation und API-Aufrufe.
- `components/`: Avatar, Item-Illustrationen, Stadtillustration und Profil.
- `lib/catalog.ts`: balancierter Content-Katalog mit fiktiven Brands.
- `lib/economy.ts`: reine, testbare Economy-Regeln; serverseitige Preise, Jobs, Kosten und Gewinne.
- `lib/db.ts`: persistenter SQLite-Store, atomare Schreibtransaktionen, Auth, Sessions, Logs und Limits.
- `app/api/`: Auth, Spielzustand, Economy-Aktionen und öffentliche Profile.
- `supabase/schema.sql`: vorbereitetes normalisiertes PostgreSQL-Schema mit Foreign Keys, Indizes, RLS und einer atomaren Kauf-Funktion als Migration-Vorlage.

Der **aktive** Adapter ist SQLite. Supabase Auth/Realtime sind noch nicht angebunden. Die `.env.example` enthält die später benötigten Variablennamen; das Eintragen dieser Keys allein aktiviert keine Supabase-Anbindung. Das PostgreSQL-Schema ist eine geprüfte Entwurfsvorlage, wurde in dieser Umgebung aber nicht auf einem Supabase-Projekt ausgeführt. Vor dem Wechsel müssen der Auth- und Datenbankadapter sowie die serverseitigen Economy-Transaktionen portiert werden. Phase-2-/3-Systeme werden nicht als funktionierende Platzhalter angezeigt.

## Economy und Sicherheit

- Der Client sendet nur Aktionen und IDs. Cash, Rewards, XP, Kosten, Firmenwerte und Aura berechnet der Server.
- SQLite `BEGIN IMMEDIATE` und WAL schützen alle Aktionen atomar vor parallelen Ausgaben. Ein Timeout verhindert vorübergehende Lock-Fehler bei mehreren Prozessen.
- Schichten werden durch einen serverseitigen Startzeitpunkt und eine Einmal-ID abgesichert. Dieselbe Schicht kann nur einmal ausbezahlt werden.
- Käufe, Ownership, Job-Level, Mitarbeiter und Upgrades werden serverseitig geprüft.
- Jede Economy-Aktion und jede Gewinnabrechnung erhält einen Transaktionslog. Fehlgeschlagene Aktionen rollen vollständig zurück.
- Aktionstakt: mindestens 500 ms zwischen erfolgreichen Aktionen. Login/Registrierung: maximal 20 Versuche je IP-/Username-Kombination in 10 Minuten, auch fehlgeschlagene Versuche werden gezählt.
- Passwörter sind mit zufälligem Salt und `scrypt` gehasht. Sessions verwenden zufällige Tokens; in der DB steht nur deren SHA-256-Hash. Cookies sind HttpOnly, SameSite Strict und unter HTTPS Secure.
- Schreibendpunkte prüfen den Origin. Hinter einem Reverse Proxy müssen Host und Protokoll korrekt weitergeleitet werden.
- Einkommen liegt zuerst im Firmenkonto und muss entnommen werden. Umsätze, laufende Kosten und Gehälter werden separat dargestellt.
- Unternehmenswert: Gründungskosten + 70 % der Upgradekosten + 50 % der Einstellungskosten. Net Worth: Cash + Bank + Firmenwert + Firmenkonto + 60 % der Kleiderpreise. Aura: nur getragene Items + 25 pro Firma.
- Zeitbasierte Gewinnabrechnung beim Abruf; Abwesenheiten sind vorsorglich auf 8 Stunden begrenzt. Es gibt noch kein separates Offline-Rewards-UI oder Wirtschaftsevents.

## Persistenz & Deployment

Die Datenbank liegt standardmäßig in `data/game.sqlite`. Optional `DATABASE_PATH` setzen. In Produktion braucht der Server ein **persistentes Volume** und HTTPS. SQLite passt für einen einzelnen Node-Server; mehrere voneinander getrennte Instanzen dürfen nicht mit unabhängigen DB-Dateien betrieben werden. Ein flüchtiges Serverless-Dateisystem ist ungeeignet. Backups sollten über die SQLite-Backup-API bzw. eine konsistente Snapshot-Methode erfolgen.

Das Repository enthält keine Zugangsdaten und keine vorgegebenen Spielerpasswörter. Der Content-Katalog wird direkt von der Anwendung geladen; die lokale Datenbank speichert Accounts und Spielzustände. `supabase/seed.sql` enthält alle 89 Katalogeinträge für das normalisierte Supabase-Schema und lässt sich mit `node --import tsx scripts/export-catalog.ts` neu erzeugen.

Die Sites-Plugin-Helfer für Registrierung und Veröffentlichung waren in der Ausführungsumgebung nicht installiert. Daher wurde keine gehostete Site erstellt oder veröffentlicht. Der lokale Next.js-Produktionsbuild ist die nutzbare Lieferung.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Neun automatisierte Tests prüfen die Economy, Einmal-Rewards, fremde Ownership, Limits, Transaktionslogs, Auth und Rollbacks. Zusätzlich wurden die Produktions-HTTP-Routen mit zwei Accounts getestet. Visuelle Browser-QA konnte mangels Browser-Tool nicht durchgeführt werden.

## Nächste Phasen

Phase 2: Immobilien, Fahrzeuge, Investments, Daily/Random Events und ein dedizierter Offline-Bericht. Phase 3: atomarer Player-Marketplace, Deals, Firmenanteile und weitergehende Marktsimulation. Die bestehenden Aktions- und Transaktionsgrenzen bilden die Grundlage dafür.
