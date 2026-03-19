import { motion } from "framer-motion";
import { Clock, Music, MapPin, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroTrophy } from "@/components/studio/HeroTrophy";

const leaderboard = [
  { rank: 1, name: "Valentina R.", score: 96.4, city: "CDMX", initials: "VR" },
  { rank: 2, name: "Carlos M.", score: 94.8, city: "Madrid", initials: "CM" },
  { rank: 3, name: "Ana P.", score: 93.1, city: "Buenos Aires", initials: "AP" },
  { rank: 4, name: "Tu", score: 91.7, city: "Bogotá", initials: "MK", isUser: true },
  { rank: 5, name: "Diego L.", score: 90.2, city: "Lima", initials: "DL" },
];

const Challenges = () => {
  return (
    <StudioRoom
      roomId="challenges"
      heroContent={<HeroTrophy rank={4} onClick={() => {}} />}
    >
      {/* Active challenge */}
      <div className="glass-card p-5 border-yellow-500/20 shadow-[0_0_25px_-8px_hsl(45_90%_55%/0.3)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "hsl(45 90% 55%)" }}>
            ⚡ CHALLENGE SEMANAL
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> 3d 14h
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
            <Music className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground">Bohemian Rhapsody</h3>
            <p className="text-sm text-muted-foreground">Queen · ⭐⭐⭐</p>
          </div>
        </div>
      </div>

      {/* Leaderboard as coliseum */}
      <div className="space-y-2">
        {leaderboard.map((u, i) => (
          <motion.div
            key={u.rank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card p-3 flex items-center gap-3 ${
              u.isUser ? "border-yellow-500/30 shadow-[0_0_20px_-8px_hsl(45_90%_55%/0.3)]" : ""
            }`}
          >
            <span className={`text-xl font-serif font-bold w-8 text-center ${
              u.rank <= 3 ? "" : "text-muted-foreground"
            }`} style={u.rank <= 3 ? { color: "hsl(45 90% 55%)" } : undefined}>
              {u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : `#${u.rank}`}
            </span>
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`text-xs font-bold ${u.isUser ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {u.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${u.isUser ? "text-primary" : "text-foreground"}`}>{u.name}</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" /> {u.city}
              </div>
            </div>
            <span className="text-lg font-serif font-bold text-foreground">{u.score}</span>
          </motion.div>
        ))}
      </div>

      {/* Submit */}
      <motion.button whileTap={{ scale: 0.95 }}
        className="w-full h-14 rounded-2xl stage-gradient text-primary-foreground font-bold flex items-center justify-center gap-2 text-lg shadow-[0_0_25px_-5px_hsl(var(--primary)/0.4)]">
        <Send className="h-5 w-5" /> ENVIAR PERFORMANCE
      </motion.button>
    </StudioRoom>
  );
};

export default Challenges;
