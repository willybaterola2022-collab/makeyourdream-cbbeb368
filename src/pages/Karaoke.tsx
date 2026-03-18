import { Play, Pause, RotateCcw, Volume2, Music } from "lucide-react";
import { useState } from "react";

const lyrics = [
  { time: 0, text: "Bésame, bésame mucho", active: true },
  { time: 4, text: "Como si fuera esta noche", active: false },
  { time: 8, text: "La última vez", active: false },
  { time: 12, text: "Bésame, bésame mucho", active: false },
  { time: 16, text: "Que tengo miedo a perderte", active: false },
  { time: 20, text: "Perderte después", active: false },
  { time: 24, text: "Quiero tenerte muy cerca", active: false },
  { time: 28, text: "Mirarme en tus ojos", active: false },
  { time: 32, text: "Verte junto a mí", active: false },
];

const Karaoke = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Karaoke Core</h1>
        <p className="text-muted-foreground text-sm mt-1">Canta, mide y mejora en tiempo real</p>
      </div>

      {/* Song Card */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Music className="h-7 w-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-foreground">Bésame Mucho</h3>
          <p className="text-sm text-muted-foreground">Consuelo Velázquez · 3:28</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-serif font-bold gold-text">92</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-1 h-20 mb-4">
          {Array.from({ length: 60 }).map((_, i) => {
            const height = 20 + Math.sin(i * 0.3) * 40 + Math.random() * 20;
            const isPast = i < 20;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPast ? "gold-gradient" : "bg-muted"
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0:32</span>
          <span>3:28</span>
        </div>
      </div>

      {/* Score indicators */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Afinación", value: 94, color: "gold-gradient" },
          { label: "Timing", value: 88, color: "bg-secondary" },
          { label: "Expresión", value: 91, color: "gold-gradient" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-serif font-bold text-foreground">{s.value}</p>
            <div className="h-1 rounded-full bg-muted mt-2 overflow-hidden">
              <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Lyrics */}
      <div className="glass-card p-5 space-y-3 max-h-64 overflow-y-auto">
        {lyrics.map((line, i) => (
          <p
            key={i}
            className={`font-serif text-lg transition-all duration-300 ${
              line.active
                ? "text-primary font-semibold text-xl scale-105 origin-left"
                : "text-muted-foreground"
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button className="h-10 w-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="h-14 w-14 rounded-full gold-gradient flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity glow-gold"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </button>
        <button className="h-10 w-10 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Volume2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Karaoke;
