import { useState } from "react";
import { Mic, Music, FileText, ListMusic } from "lucide-react";
import FreestyleMode from "@/components/karaoke/FreestyleMode";
import CustomLyricsMode from "@/components/karaoke/CustomLyricsMode";
import PresetSongsMode from "@/components/karaoke/PresetSongsMode";

type KaraokeMode = "freestyle" | "custom" | "preset";

const modes = [
  { id: "freestyle" as const, label: "Freestyle", icon: Mic, desc: "Canta lo que quieras" },
  { id: "custom" as const, label: "Tu letra", icon: FileText, desc: "Pega tu propia letra" },
  { id: "preset" as const, label: "Canciones", icon: ListMusic, desc: "Elige una canción" },
];

const genres = ["Freestyle", "Pop", "Rock", "Balada", "R&B", "Rap"];
const pitchRanges = [
  { id: "low", label: "Grave", emoji: "🎸" },
  { id: "mid", label: "Medio", emoji: "🎤" },
  { id: "high", label: "Agudo", emoji: "🎵" },
];

const Karaoke = () => {
  const [mode, setMode] = useState<KaraokeMode | null>(null);
  const [genre, setGenre] = useState("Freestyle");
  const [pitchRange, setPitchRange] = useState("mid");
  const [bpm, setBpm] = useState(0); // 0 = sin metrónomo

  // If no mode selected, show selector
  if (!mode) {
    return (
      <div className="p-4 md:p-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">🎤 Karaoke Libre</h1>
          <p className="text-muted-foreground text-sm mt-1">Elige cómo quieres cantar</p>
        </div>

        {/* Mode selector */}
        <div className="grid gap-3">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="glass-card p-5 flex items-center gap-4 text-left hover:border-primary/30 transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <m.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-serif font-semibold text-foreground">{m.label}</p>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Genre selector */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Género / Estilo</p>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  genre === g
                    ? "stage-gradient text-primary-foreground font-medium"
                    : "glass-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Pitch range */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Tono base</p>
          <div className="grid grid-cols-3 gap-2">
            {pitchRanges.map((p) => (
              <button
                key={p.id}
                onClick={() => setPitchRange(p.id)}
                className={`glass-card p-3 text-center rounded-xl transition-all ${
                  pitchRange === p.id ? "border-primary/40 bg-primary/5" : ""
                }`}
              >
                <span className="text-lg">{p.emoji}</span>
                <p className="text-xs text-muted-foreground mt-1">{p.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* BPM / Metronome */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Metrónomo (BPM)</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBpm(0)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                bpm === 0 ? "gold-gradient text-primary-foreground" : "glass-card text-muted-foreground"
              }`}
            >
              Sin ritmo
            </button>
            {[80, 100, 120, 140].map((b) => (
              <button
                key={b}
                onClick={() => setBpm(b)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  bpm === b ? "gold-gradient text-primary-foreground" : "glass-card text-muted-foreground"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <div className="p-4 pb-0 md:px-8">
        <button
          onClick={() => setMode(null)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver a modos
        </button>
      </div>

      {mode === "freestyle" && <FreestyleMode genre={genre} pitchRange={pitchRange} bpm={bpm} />}
      {mode === "custom" && <CustomLyricsMode genre={genre} pitchRange={pitchRange} bpm={bpm} />}
      {mode === "preset" && <PresetSongsMode genre={genre} pitchRange={pitchRange} bpm={bpm} />}
    </div>
  );
};

export default Karaoke;
