import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Mic, FileText, ListMusic } from "lucide-react";
import FreestyleMode from "@/components/karaoke/FreestyleMode";
import CustomLyricsMode from "@/components/karaoke/CustomLyricsMode";
import PresetSongsMode from "@/components/karaoke/PresetSongsMode";

type KaraokeMode = "freestyle" | "custom" | "preset";

const modes = [
  {
    id: "freestyle" as const,
    label: "CANTA LIBRE",
    sub: "Sin reglas, solo tu voz",
    icon: Mic,
    gradient: "from-[hsl(275_85%_50%)] to-[hsl(285_80%_60%)]",
  },
  {
    id: "custom" as const,
    label: "TU LETRA",
    sub: "Pegá tu letra y cantá",
    icon: FileText,
    gradient: "from-[hsl(185_90%_40%)] to-[hsl(195_85%_50%)]",
  },
  {
    id: "preset" as const,
    label: "ELIGE CANCIÓN",
    sub: "200+ canciones disponibles",
    icon: ListMusic,
    gradient: "from-[hsl(275_70%_45%)] to-[hsl(185_80%_50%)]",
  },
];

const genres = ["Freestyle", "Pop", "Rock", "Balada", "R&B", "Rap"];

const Karaoke = () => {
  const [mode, setMode] = useState<KaraokeMode | null>(null);
  const [genre, setGenre] = useState("Freestyle");
  const [pitchRange, setPitchRange] = useState("mid");
  const [bpm, setBpm] = useState(0);

  // BACKEND-REQUEST: save-training-session
  // Input: { user_id: string, scores: {pitch, timing, expression}, module: string, song_title: string }
  // Output: { session_id: string, xp_earned: number }
  // Descripción: Guarda la sesión de entrenamiento y otorga XP

  if (!mode) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-fade-in">
        {/* Mode selector — 3 GIANT cards */}
        <div className="space-y-4 max-w-lg mx-auto pt-2">
          {modes.map((m, i) => (
            <motion.button
              key={m.id}
              onClick={() => setMode(m.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.95 }}
              className={`w-full rounded-2xl bg-gradient-to-br ${m.gradient} p-6 md:p-8 flex items-center gap-5 text-left shadow-lg cursor-pointer overflow-hidden relative`}
            >
              <motion.span
                className="absolute inset-0 rounded-2xl border-2 border-white/10"
                animate={{ scale: [1, 1.03, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                <m.icon className="h-9 w-9 md:h-11 md:w-11 text-white/90" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">{m.label}</p>
                <p className="text-sm text-white/60 mt-1">{m.sub}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Genre chips */}
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {genres.map((g) => (
            <motion.button
              key={g}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGenre(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                genre === g
                  ? "stage-gradient text-primary-foreground shadow-[0_0_16px_-4px_hsl(275_85%_60%/0.4)]"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </motion.button>
          ))}
        </div>

        {/* BPM selector */}
        <div className="flex items-center justify-center gap-2">
          {[0, 80, 100, 120, 140].map((b) => (
            <motion.button
              key={b}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBpm(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                bpm === b ? "stage-gradient text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {b === 0 ? "∅ BPM" : `${b}`}
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Persistent tabs at top */}
      <div className="flex gap-1 px-4 pt-3 pb-1">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              mode === m.id
                ? "stage-gradient text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.label.split(" ")[0]}
          </button>
        ))}
        <button
          onClick={() => setMode(null)}
          className="px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground glass-card transition-all"
        >
          ✕
        </button>
      </div>

      {mode === "freestyle" && <FreestyleMode genre={genre} pitchRange={pitchRange} bpm={bpm} />}
      {mode === "custom" && <CustomLyricsMode genre={genre} pitchRange={pitchRange} bpm={bpm} />}
      {mode === "preset" && <PresetSongsMode genre={genre} pitchRange={pitchRange} bpm={bpm} />}
    </div>
  );
};

export default Karaoke;
