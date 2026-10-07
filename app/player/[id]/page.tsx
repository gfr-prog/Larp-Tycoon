import Link from "next/link";
import { notFound } from "next/navigation";
import { readPlayer } from "@/lib/db";
import { publicPlayer } from "@/lib/economy";
import Profile from "@/components/Profile";
import { achievements } from "@/lib/catalog";
import { ArrowUpRight, Trophy } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let p;
  try {
    p = publicPlayer(readPlayer(id));
  } catch {
    notFound();
  }
  return (
    <main className="public-page">
      <Link href="/" className="public-brand">
        LARP TYCOON <ArrowUpRight size={19} />
      </Link>
      <Profile player={p} />
      <div className="card public-achievements">
        <div className="card-heading">
          <h3>Milestones</h3>
          <span className="tag">{p.achievements.length} ACHIEVEMENTS</span>
        </div>
        <div className="achievement-grid">
          {p.achievements.length ? (
            p.achievements.map((id) => {
              const a = achievements.find((x) => x.id === id)!;
              return (
                <div className="achievement unlocked" key={id}>
                  <Trophy size={20} />
                  <strong>{a.name}</strong>
                  <small>{a.description}</small>
                </div>
              );
            })
          ) : (
            <p className="muted">Eine große Geschichte beginnt gerade erst.</p>
          )}
        </div>
      </div>
      <Link href="/" className="button">
        Dein eigenes Imperium starten <ArrowUpRight size={17} />
      </Link>
      <footer>
        Nur virtuelles Geld. Alle Unternehmen und Marken sind fiktiv.
      </footer>
    </main>
  );
}
