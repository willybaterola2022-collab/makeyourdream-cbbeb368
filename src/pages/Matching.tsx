import { Share2, Sparkles } from "lucide-react";

const dimensions = [
  { name: "Timbre", value: 92 },
  { name: "Registro", value: 85 },
  { name: "Vibrato", value: 78 },
  { name: "Articulación", value: 88 },
  { name: "Expresividad", value: 81 },
];

const secondaryArtists = [
  { name: "Whitney Houston", match: 72, emoji: "🌟" },
  { name: "Celine Dion", match: 68, emoji: "💎" },
  { name: "Mariah Carey", match: 61, emoji: "🎵" },
];

const Matching = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Voice Matching</h1>
        <p className="text-muted-foreground text-sm mt-1">Descubre a quién suenas</p>
      </div>

      {/* Main match */}
      <div className="glass-card p-6 text-center glow-stage border-primary/20">
        <Sparkles className="h-8 w-8 text-primary mx-auto mb-3 breathing" />
        <p className="text-[11px] text-primary uppercase tracking-widest mb-2">Suenas a...</p>
        <div className="h-20 w-20 rounded-full bg-muted mx-auto flex items-center justify-center text-4xl mb-3">
          🎤
        </div>
        <h2 className="font-serif text-3xl font-bold text-foreground">Adele</h2>
        <p className="text-5xl font-serif font-bold neon-text mt-2">87%</p>
        <p className="text-sm text-muted-foreground mt-1">de similitud vocal</p>
      </div>

      {/* Dimension breakdown */}
      <div className="glass-card p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Desglose por dimensión</h3>
        <div className="space-y-3">
          {dimensions.map((d) => (
            <div key={d.name} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24">{d.name}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full stage-gradient" style={{ width: `${d.value}%` }} />
              </div>
              <span className="text-sm font-medium text-foreground w-8 text-right">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary matches */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">También suenas a</h3>
        <div className="space-y-2">
          {secondaryArtists.map((a) => (
            <div key={a.name} className="glass-card-hover p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
                {a.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{a.name}</p>
                <div className="h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                  <div className="h-full rounded-full stage-gradient" style={{ width: `${a.match}%` }} />
                </div>
              </div>
              <span className="text-lg font-serif font-bold neon-text">{a.match}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share Card */}
      <div className="glass-card p-6 text-center border-primary/10">
        <p className="text-sm text-muted-foreground mb-3">Comparte tu resultado en redes</p>
        <div className="glass-card p-5 mb-4 mx-auto max-w-[280px]">
          <p className="text-[10px] text-primary uppercase tracking-widest">MakeYourDream</p>
          <p className="font-serif text-lg font-semibold text-foreground mt-1">Sueno a Adele — 87%</p>
          <p className="text-xs text-muted-foreground mt-1">¿Y tú a quién suenas?</p>
        </div>
        <button className="w-full h-12 rounded-xl gold-gradient text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Share2 className="h-4 w-4" />
          Compartir
        </button>
      </div>
    </div>
  );
};

export default Matching;
