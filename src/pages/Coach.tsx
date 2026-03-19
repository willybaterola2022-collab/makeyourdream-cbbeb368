import { TrendingUp, TrendingDown, Minus, BrainCircuit, Play, Clock } from "lucide-react";

const metrics = [
  { label: "Afinación", value: 94, delta: +3, icon: TrendingUp },
  { label: "Sustain", value: 82, delta: -1, icon: TrendingDown },
  { label: "Vibrato", value: 78, delta: 0, icon: Minus },
];

const observations = [
  "Tu afinación mejoró notablemente en el registro alto — sigue así.",
  "El sustain en notas largas necesita más soporte diafragmático.",
  "Intenta relajar la mandíbula en las transiciones de registro.",
  "Tu vibrato es natural pero inconsistente — trabájalo con ejercicios de pulso.",
];

const Coach = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">AI Vocal Coach</h1>
        <p className="text-muted-foreground text-sm mt-1">Análisis post-performance y recomendaciones</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="glass-card p-4 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-2xl font-serif font-bold text-foreground">{m.value}</p>
            <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${
              m.delta > 0 ? "text-primary" : m.delta < 0 ? "text-destructive" : "text-muted-foreground"
            }`}>
              <m.icon className="h-3 w-3" />
              <span>{m.delta > 0 ? "+" : ""}{m.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Observations */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="h-5 w-5 text-secondary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Observaciones del Coach</h3>
        </div>
        <div className="space-y-3">
          {observations.map((obs, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-secondary">{i + 1}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{obs}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Exercise */}
      <div className="glass-card-hover p-5 border-primary/20 glow-stage">
        <p className="text-[11px] text-primary uppercase tracking-widest mb-2">Ejercicio recomendado</p>
        <h3 className="font-serif text-xl font-semibold text-foreground">Lip Trill con Escala Mayor</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Fortalece el soporte y estabiliza el sustain en notas largas
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>5 min</span>
          </div>
          <div className="text-sm text-muted-foreground">3 series × 8 reps</div>
        </div>
        <button className="w-full h-12 rounded-xl stage-gradient text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <Play className="h-4 w-4" />
          Iniciar ejercicio
        </button>
      </div>
    </div>
  );
};

export default Coach;
