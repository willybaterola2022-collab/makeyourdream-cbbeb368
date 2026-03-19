import { Share2, Award } from "lucide-react";

const dimensions = [
  { name: "Registro", value: 88 },
  { name: "Potencia", value: 76 },
  { name: "Agilidad", value: 82 },
  { name: "Resonancia", value: 91 },
  { name: "Expresividad", value: 85 },
];

const similarArtists = [
  { name: "Adele", match: 87, img: "🎤" },
  { name: "Amy Winehouse", match: 74, img: "🎵" },
  { name: "Sia", match: 68, img: "✨" },
];

const Diagnostico = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Diagnóstico Vocal</h1>
        <p className="text-muted-foreground text-sm mt-1">Tu clasificación vocal detallada</p>
      </div>

      {/* Main Result */}
      <div className="glass-card p-6 text-center glow-stage border-primary/20">
        <Award className="h-10 w-10 text-primary mx-auto mb-3" />
        <p className="text-[11px] text-primary uppercase tracking-widest mb-1">Clasificación vocal</p>
        <h2 className="font-serif text-3xl font-bold neon-text">Mezzosoprano Lírica</h2>
        <p className="text-muted-foreground text-sm mt-2">Rango detectado: A3 — E5</p>
        <div className="mt-4 inline-flex items-center gap-2 glass-card px-4 py-2">
          <span className="text-sm text-muted-foreground">Percentil:</span>
          <span className="text-lg font-serif font-bold text-primary">Top 12%</span>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-semibold text-foreground">Análisis dimensional</h3>
        {dimensions.map((d) => (
          <div key={d.name} className="glass-card p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-foreground">{d.name}</span>
              <span className="text-sm font-medium text-primary">{d.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full stage-gradient transition-all duration-700" style={{ width: `${d.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Similar Artists */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Artistas similares</h3>
        <div className="space-y-2">
          {similarArtists.map((a) => (
            <div key={a.name} className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
                {a.img}
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

      {/* Share */}
      <button className="w-full glass-card-hover p-4 flex items-center justify-center gap-2 text-primary font-medium">
        <Share2 className="h-4 w-4" />
        Compartir mi diagnóstico
      </button>
    </div>
  );
};

export default Diagnostico;
