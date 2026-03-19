import { Clock, Music, Trophy, MapPin, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const criteria = [
  { name: "Afinación", weight: 30 },
  { name: "Timing", weight: 25 },
  { name: "Expresión", weight: 25 },
  { name: "Técnica", weight: 20 },
];

const leaderboard = [
  { rank: 1, name: "Valentina R.", score: 96.4, city: "CDMX", initials: "VR" },
  { rank: 2, name: "Carlos M.", score: 94.8, city: "Madrid", initials: "CM" },
  { rank: 3, name: "Ana P.", score: 93.1, city: "Buenos Aires", initials: "AP" },
  { rank: 4, name: "Tu", score: 91.7, city: "Bogotá", initials: "MK", isUser: true },
  { rank: 5, name: "Diego L.", score: 90.2, city: "Lima", initials: "DL" },
];

const Challenges = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Challenge Engine</h1>
        <p className="text-muted-foreground text-sm mt-1">Compite, crece y lidera el ranking</p>
      </div>

      {/* Active challenge */}
      <div className="glass-card p-5 border-primary/20 glow-stage">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <p className="text-[11px] text-primary uppercase tracking-widest font-medium">Challenge semanal</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>3d 14h restantes</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Music className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">Bohemian Rhapsody</h3>
            <p className="text-sm text-muted-foreground">Queen · Dificultad: Avanzada</p>
          </div>
        </div>
      </div>

      {/* Criteria */}
      <div className="glass-card p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Criterios de evaluación</h3>
        <div className="space-y-3">
          {criteria.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-20">{c.name}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full stage-gradient" style={{ width: `${c.weight * 3.3}%` }} />
              </div>
              <span className="text-xs font-medium text-foreground w-8 text-right">{c.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Your position */}
      <div className="glass-card p-5 text-center">
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Tu posición</p>
        <p className="text-5xl font-serif font-bold neon-text mt-1">#4</p>
        <p className="text-sm text-muted-foreground mt-1">Score: 91.7</p>
      </div>

      {/* Leaderboard */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Top 5</h3>
        <div className="space-y-2">
          {leaderboard.map((u) => (
            <div
              key={u.rank}
              className={`glass-card p-3 flex items-center gap-3 ${
                u.isUser ? "border-primary/20 glow-stage" : ""
              }`}
            >
              <span className={`text-lg font-serif font-bold w-8 text-center ${
                u.rank <= 3 ? "neon-text" : "text-muted-foreground"
              }`}>
                {u.rank}
              </span>
              <Avatar className="h-9 w-9">
                <AvatarFallback className={`text-xs font-semibold ${
                  u.isUser ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {u.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${u.isUser ? "text-primary" : "text-foreground"}`}>
                  {u.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" />
                  <span>{u.city}</span>
                </div>
              </div>
              <span className="text-sm font-serif font-bold text-foreground">{u.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button className="w-full h-12 rounded-xl gold-gradient text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        <Send className="h-4 w-4" />
        Enviar mi performance
      </button>
    </div>
  );
};

export default Challenges;
