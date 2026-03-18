import { CheckCircle2, Circle, Play, Flame, Target, TrendingUp, Award } from "lucide-react";

const weekDays = [
  { day: "L", done: true },
  { day: "M", done: true },
  { day: "X", done: true },
  { day: "J", done: false, today: true },
  { day: "V", done: false },
  { day: "S", done: false },
  { day: "D", done: false },
];

const exercises = [
  { name: "Warm-up: Lip Trills", duration: "3 min", status: "done" },
  { name: "Escala Cromática Ascendente", duration: "5 min", status: "active" },
  { name: "Sustain: Notas Largas", duration: "4 min", status: "pending" },
];

const Exercises = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Ejercicios Diarios</h1>
        <p className="text-muted-foreground text-sm mt-1">Mantén tu racha y transforma tu voz</p>
      </div>

      {/* Streak alert */}
      <div className="glass-card p-4 border-primary/20 glow-gold flex items-center gap-3">
        <Flame className="h-6 w-6 text-primary breathing" />
        <div>
          <p className="text-sm font-medium text-foreground">¡Racha de 3 días! 🔥</p>
          <p className="text-xs text-muted-foreground">Completa hoy para mantenerla</p>
        </div>
      </div>

      {/* Week calendar */}
      <div className="glass-card p-4">
        <div className="flex justify-between">
          {weekDays.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase">{d.day}</span>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  d.done
                    ? "gold-gradient text-primary-foreground"
                    : d.today
                    ? "border-2 border-primary text-primary breathing"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {d.done ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's routine */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Rutina del día</h3>
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div
              key={ex.name}
              className={`glass-card p-4 flex items-center gap-4 ${
                ex.status === "active" ? "border-primary/20 glow-gold" : ""
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  ex.status === "done"
                    ? "gold-gradient"
                    : ex.status === "active"
                    ? "border-2 border-primary"
                    : "bg-muted"
                }`}
              >
                {ex.status === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                ) : ex.status === "active" ? (
                  <Play className="h-4 w-4 text-primary ml-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  ex.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
                }`}>
                  {ex.name}
                </p>
                <p className="text-xs text-muted-foreground">{ex.duration}</p>
              </div>
              {ex.status === "active" && (
                <button className="px-4 py-2 rounded-lg gold-gradient text-primary-foreground text-xs font-medium">
                  Iniciar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Side metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Sesiones / semana", value: "5", icon: Target },
          { label: "Mejora promedio", value: "+14%", icon: TrendingUp },
          { label: "Racha más larga", value: "21 días", icon: Flame },
          { label: "Próximo badge", value: "Gold Voice", icon: Award },
        ].map((m) => (
          <div key={m.label} className="glass-card p-3">
            <m.icon className="h-4 w-4 text-primary mb-2" />
            <p className="text-lg font-serif font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Exercises;
