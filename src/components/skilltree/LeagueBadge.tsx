import { motion } from "framer-motion";
import { LEAGUE_TIERS } from "./skillTreeData";

interface LeagueBadgeProps {
  weeklyXP: number;
  rank?: number;
  positionChange?: number;
}

export function LeagueBadge({ weeklyXP, rank, positionChange }: LeagueBadgeProps) {
  let league = LEAGUE_TIERS[0];
  for (const tier of LEAGUE_TIERS) {
    if (weeklyXP >= tier.minXP) league = tier;
    else break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
      style={{ borderColor: `${league.color}40`, background: `${league.color}10` }}
    >
      <span className="text-sm">{league.icon}</span>
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: league.color, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {league.name}
      </span>
      {rank && (
        <span className="text-[10px] text-white/50 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          #{rank}
        </span>
      )}
      {positionChange !== undefined && positionChange !== 0 && (
        <span className={`text-[10px] font-bold ${positionChange > 0 ? "text-[#00E5A0]" : "text-[#FF4757]"}`}>
          {positionChange > 0 ? `↑${positionChange}` : `↓${Math.abs(positionChange)}`}
        </span>
      )}
    </motion.div>
  );
}
