import { useState } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StudioRoom } from "@/components/studio/StudioRoom";

interface Challenger { name: string; initials: string; elo: number; wins: number; }

const LEADERBOARD: Challenger[] = [
  { name: "Luna Vox", initials: "LV", elo: 1850, wins: 42 },
  { name: "Echo Rivera", initials: "ER", elo: 1780, wins: 38 },
  { name: "Tú", initials: "MK", elo: 1620, wins: 23 },
  { name: "Aria Storm", initials: "AS", elo: 1590, wins: 21 },
  { name: "Nova Beat", initials: "NB", elo: 1540, wins: 19 },
];

const ACTIVE_DUELS = [
  { song: "Bohemian Rhapsody", opponent: "Luna Vox", status: "Tu turno", timeLeft: "2h 15m" },
  { song: "Rolling in the Deep", opponent: "Echo Rivera", status: "Esperando", timeLeft: "5h 30m" },
];

export default function Duelos() {
  const [myElo] = useState(1620);

  return (
    <StudioRoom
      roomId="duelos"
      heroContent={
        <motion.div className="flex flex-col items-center z-10"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {/* Crossed swords / arena hero */}
          <motion.div className="text-8xl md:text-[130px]"
            animate={{ rotateZ: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity }}>
            ⚔️
          </motion.div>
          <motion.p className="mt-2 text-4xl md:text-5xl font-bold" style={{ color: "hsl(0 80% 55%)" }}>
            {myElo}
          </motion.p>
          <Badge className="mt-2 stage-gradient text-primary-foreground text-sm px-4 py-1">Plata II</Badge>
          <motion.p className="mt-3 text-lg font-bold uppercase tracking-[0.2em]"
            style={{ color: "hsl(0 80% 55%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}>
            ⚡ BUSCAR RIVAL ⚡
          </motion.p>
        </motion.div>
      }
    >
      {/* Active Duels */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">🔥 Duelos activos</span>
        {ACTIVE_DUELS.map((duel, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">{duel.song}</p>
              <p className="text-xs text-muted-foreground">vs {duel.opponent}</p>
            </div>
            <div className="text-right">
              <Badge variant={duel.status === "Tu turno" ? "default" : "outline"}
                className={duel.status === "Tu turno" ? "bg-primary text-primary-foreground animate-pulse" : ""}>
                {duel.status}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{duel.timeLeft}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" style={{ color: "hsl(0 80% 55%)" }} />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ranking</span>
        </div>
        {LEADERBOARD.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className={`glass-card p-3 flex items-center gap-3 ${c.initials === "MK" ? "border-red-500/30 shadow-[0_0_15px_-5px_hsl(0_80%_55%/0.3)]" : ""}`}>
            <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
            <Avatar className="h-9 w-9">
              <AvatarFallback className={`text-xs font-bold ${c.initials === "MK" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {c.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.wins} W</p>
            </div>
            <span className="text-sm font-bold" style={{ color: "hsl(0 80% 55%)" }}>{c.elo}</span>
          </motion.div>
        ))}
      </div>
    </StudioRoom>
  );
}
