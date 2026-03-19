import { Play, SlidersHorizontal, Share2, Users } from "lucide-react";
import { useState } from "react";

const artists = [
  { name: "Freddie Mercury", genre: "Rock", emoji: "👑" },
  { name: "Frank Sinatra", genre: "Jazz", emoji: "🎩" },
  { name: "Shakira", genre: "Pop Latino", emoji: "💃" },
  { name: "Ed Sheeran", genre: "Pop", emoji: "🎸" },
];

const Duetos = () => {
  const [selectedArtist, setSelectedArtist] = useState(0);

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Duetos con IA</h1>
        <p className="text-muted-foreground text-sm mt-1">Canta junto a los grandes</p>
      </div>

      {/* Artist selector */}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-3">Elige tu compañero</p>
        <div className="grid grid-cols-2 gap-3">
          {artists.map((a, i) => (
            <button
              key={a.name}
              onClick={() => setSelectedArtist(i)}
              className={`glass-card p-4 text-left transition-all duration-200 ${
                selectedArtist === i
                  ? "border-primary/30 glow-stage"
                  : "hover:border-border/60"
              }`}
            >
              <div className="text-3xl mb-2">{a.emoji}</div>
              <p className="text-sm font-medium text-foreground">{a.name}</p>
              <p className="text-[10px] text-muted-foreground">{a.genre}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Split waveform */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Vista del dueto</p>
        </div>

        {/* Your voice */}
        <div className="mb-3">
          <p className="text-[10px] text-primary uppercase tracking-widest mb-2">Tu voz</p>
          <div className="flex items-center gap-0.5 h-10">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={`u-${i}`}
                className="flex-1 rounded-full gold-gradient"
                style={{ height: `${30 + Math.sin(i * 0.4) * 50 + Math.random() * 20}%` }}
              />
            ))}
          </div>
        </div>

        {/* AI voice */}
        <div>
          <p className="text-[10px] text-secondary uppercase tracking-widest mb-2">
            {artists[selectedArtist].name} (IA)
          </p>
          <div className="flex items-center gap-0.5 h-10">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={`a-${i}`}
                className="flex-1 rounded-full bg-secondary"
                style={{ height: `${25 + Math.cos(i * 0.35) * 45 + Math.random() * 20}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tone controls */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Ajuste tonal</p>
        </div>
        {["Tu volumen", "Volumen IA", "Armonización"].map((label) => (
          <div key={label} className="mb-3 last:mb-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground">75%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full gold-gradient" style={{ width: "75%" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 h-12 rounded-xl gold-gradient text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Play className="h-4 w-4" />
          Escuchar preview
        </button>
        <button className="h-12 w-12 rounded-xl glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Duetos;
