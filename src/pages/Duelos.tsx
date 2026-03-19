import { useState } from "react";
import { motion } from "framer-motion";
import { Swords, Trophy, Star, Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Challenger {
  name: string;
  initials: string;
  elo: number;
  wins: number;
}

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
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Swords className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Duelos 1v1</h1>
          <p className="text-muted-foreground mt-1">Reta, canta, gana. Sistema ELO competitivo.</p>
        </div>
      </div>

      {/* My ELO */}
      <Card className="p-5 bg-card border-primary/20 text-center">
        <p className="text-sm text-muted-foreground mb-1">Tu rating</p>
        <p className="text-5xl font-bold text-primary">{myElo}</p>
        <Badge className="mt-2 stage-gradient text-primary-foreground">Rango: Plata II</Badge>
      </Card>

      {/* New Duel */}
      <Button className="stage-gradient text-primary-foreground w-full text-lg py-6" size="lg">
        <Swords className="h-5 w-5 mr-2" />
        BUSCAR RIVAL
      </Button>

      {/* Active Duels */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">🔥 Duelos activos</h2>
        <div className="space-y-2">
          {ACTIVE_DUELS.map((duel, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-4 bg-card border-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{duel.song}</p>
                    <p className="text-xs text-muted-foreground">vs {duel.opponent}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={duel.status === "Tu turno" ? "default" : "outline"} className={duel.status === "Tu turno" ? "bg-primary text-primary-foreground" : ""}>
                      {duel.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{duel.timeLeft}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Ranking semanal
        </h2>
        <div className="space-y-2">
          {LEADERBOARD.map((c, i) => (
            <Card key={i} className={`p-3 bg-card border-border/40 flex items-center gap-3 ${c.initials === "MK" ? "border-primary/30" : ""}`}>
              <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className={`text-xs font-semibold ${c.initials === "MK" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {c.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.wins} victorias</p>
              </div>
              <span className="text-sm font-bold text-primary">{c.elo}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
