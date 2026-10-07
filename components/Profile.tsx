import { Building2, Home, Trophy } from "lucide-react";
import { money } from "@/lib/catalog";
import { finances } from "@/lib/economy";
import type { PublicPlayer } from "@/lib/types";
import Avatar from "./Avatar";
export default function Profile({ player }: { player: PublicPlayer }) {
  const main = player.companies
    .slice()
    .sort((a, b) => finances(b).value - finances(a).value)[0];
  return (
    <div className="profile-hero card">
      <div className="profile-avatar">
        <Avatar fit={player.fit} />
        <span className="tag">LEVEL {player.level}</span>
      </div>
      <div className="profile-info">
        <span className="eyebrow">THE NEXT GENERATION OF TYCOONS</span>
        <h2>
          {player.username}
          <span>↗</span>
        </h2>
        <p>
          {main
            ? `Founder & CEO at ${main.name}`
            : "Nobody today. Somebody tomorrow."}
        </p>
        <div className="profile-metrics">
          <div>
            <small>NET WORTH</small>
            <strong>{money(player.netWorth)}</strong>
          </div>
          <div>
            <small>AURA</small>
            <strong>
              {player.aura} <span>✦</span>
            </strong>
          </div>
        </div>
        <div className="profile-details">
          <div>
            <Building2 size={17} />
            <span>
              {main
                ? `${main.name} · ${money(finances(main).value)}`
                : "Noch kein Unternehmen"}
            </span>
          </div>
          <div>
            <Home size={17} />
            <span>Kinderzimmer · Humble beginnings</span>
          </div>
          <div>
            <Trophy size={17} />
            <span>{player.achievements.length} Achievements</span>
          </div>
        </div>
      </div>
    </div>
  );
}
