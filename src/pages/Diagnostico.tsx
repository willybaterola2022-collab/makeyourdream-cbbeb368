import { useState } from "react";
import { Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroOscilloscope } from "@/components/studio/HeroOscilloscope";

const dimensions = [
  { name: "Registro", value: 88, emoji: "🎵" },
  { name: "Potencia", value: 76, emoji: "💪" },
  { name: "Agilidad", value: 82, emoji: "⚡" },
  { name: "Resonancia", value: 91, emoji: "🔔" },
  { name: "Expresividad", value: 85, emoji: "🎭" },
];

const similarArtists = [
  { name: "Adele", match: 87, emoji: "🎤" },
  { name: "Amy Winehouse", match: 74, emoji: "🎵" },
  { name: "Sia", match: 68, emoji: "✨" },
];

const Diagnostico = () => {
  const [analyzed, setAnalyzed] = useState(false);

  return (
    <StudioRoom
      roomId="diagnostico"
      heroContent={
        <HeroOscilloscope
          isAnalyzing={false}
          onClick={() => setAnalyzed(!analyzed)}
        />
      }
    >
      {/* Main Result */}
      {analyzed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-6 text-center border-emerald-500/20 shadow-[0_0_30px_-10px_hsl(140_80%_50%/0.3)]">
            <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "hsl(140 80% 50%)" }}>CLASIFICACIÓN VOCAL</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold neon-text">Mezzosoprano Lírica</h2>
            <p className="text-muted-foreground text-sm mt-2">A3 — E5</p>
            <div className="mt-3 inline-flex glass-card px-4 py-2 rounded-xl">
              <span className="text-lg font-bold" style={{ color: "hsl(140 80% 50%)" }}>Top 12%</span>
            </div>
          </div>

          {/* Dimension gauges */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dimensions.map((d, i) => (
              <motion.div key={d.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="glass-card p-4 flex flex-col items-center gap-2">
                <span className="text-2xl">{d.emoji}</span>
                {/* Circular gauge */}
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(0 0% 16%)" strokeWidth="3" />
                    <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(140 80% 50%)" strokeWidth="3"
                      strokeDasharray={`${d.value} ${100 - d.value}`} strokeLinecap="round"
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${d.value} ${100 - d.value}` }}
                      transition={{ duration: 1, delay: i * 0.1 }} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{d.value}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{d.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Similar Artists */}
          <div className="space-y-2">
            {similarArtists.map((a, i) => (
              <motion.div key={a.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-card p-4 flex items-center gap-4">
                <span className="text-3xl">{a.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{a.name}</p>
                  <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: "hsl(140 80% 50%)" }}
                      initial={{ width: 0 }} animate={{ width: `${a.match}%` }} transition={{ duration: 0.8, delay: 0.7 + i * 0.1 }} />
                  </div>
                </div>
                <span className="text-lg font-bold" style={{ color: "hsl(140 80% 50%)" }}>{a.match}%</span>
              </motion.div>
            ))}
          </div>

          <motion.button whileTap={{ scale: 0.95 }}
            className="w-full glass-card p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground rounded-2xl">
            <Share2 className="h-5 w-5" /> Compartir
          </motion.button>
        </motion.div>
      )}
    </StudioRoom>
  );
};

export default Diagnostico;
