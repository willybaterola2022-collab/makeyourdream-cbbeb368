import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, FileText, ListMusic } from "lucide-react";
import FreestyleMode from "@/components/karaoke/FreestyleMode";
import CustomLyricsMode from "@/components/karaoke/CustomLyricsMode";
import PresetSongsMode from "@/components/karaoke/PresetSongsMode";

type KaraokeMode = "freestyle" | "custom" | "preset";

const modes = [
  { id: "freestyle" as const, emoji: "🎤", label: "Freestyle", icon: Mic },
  { id: "custom" as const, emoji: "📝", label: "Tu Letra", icon: FileText },
  { id: "preset" as const, emoji: "💿", label: "Canciones", icon: ListMusic },
];

const genres = ["Freestyle", "Pop", "Rock", "Balada", "R&B", "Rap"];
const pitchRanges = [
  { id: "low", emoji: "🎸" },
  { id: "mid", emoji: "🎤" },
  { id: "high", emoji: "🎵" },
];

const Karaoke = () => {
  const [mode, setMode] = useState<KaraokeMode | null>(null);
  const [genre, setGenre] = useState("Freestyle");
  const [pitchRange, setPitchRange] = useState("mid");
  const [bpm, setBpm] = useState(0);

  if (!mode) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-fade-in">
        {/* Mode selector — big visual cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 pt-2">
          {modes.map((m, i) => (
            <motion.button
              key={m.id}
              onClick={() => setMode(m.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.05 }}
              className="glass-card p-5 md:p-6 flex flex-col items-center gap-3 hover:border-primary/30 transition-all"
            >
              <span className="text-4xl md:text-5xl">{m.emoji}</span>
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-foreground">
                {m.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Quick settings row */}
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                genre === g
                  ? "stage-gradient text-primary-foreground"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          {pitchRanges.map((p) => (
            <button
              key={p.id}
              onClick={() => setPitchRange(p.id)}
              className={`text-2xl p-2 rounded-xl transition-all ${
                pitchRange === p.id ? "glass-card border-primary/40" : "opacity-40 hover:opacity-70"
              }`}
            >
              {p.emoji}
            </button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          {[0, 80, 100, 120, 140].map((b) => (
            <button
              key={b}
              onClick={() => setBpm(b)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                bpm === b ? "stage-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {b === 0 ? "∅" : b}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="p-4 pb-0 md:px-8">
        <button
          onClick={() => setMode(null)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver
        </button>
      </div>

      {mode === "freestyle" && <FreestyleMode genre={genre} pitchRange={pitchRange} bpm={bpm} />}
      {mode === "custom" && <CustomLyricsMode genre={genre} pitchRange={pitchRange} bpm={bpm} />}
      {mode === "preset" && <PresetSongsMode genre={genre} pitchRange={pitchRange} bpm={bpm} />}
    </div>
  );
};

export default Karaoke;
