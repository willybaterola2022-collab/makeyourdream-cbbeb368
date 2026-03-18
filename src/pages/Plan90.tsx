import { motion } from "framer-motion";
import { Sparkles, Calendar, CheckCircle2, Circle, Clock, TrendingUp, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";

type WeekStatus = "completed" | "active" | "pending";

interface Week {
  week: number;
  title: string;
  objective: string;
  exercises: string[];
  status: WeekStatus;
}

const phases: { name: string; color: string; weeks: Week[] }[] = [
  {
    name: "Fundación",
    color: "text-emerald-400",
    weeks: [
      { week: 1, title: "Diagnóstico base", objective: "Establecer línea base vocal", exercises: ["Grabación de referencia", "Test de rango", "Evaluación de respiración"], status: "completed" },
      { week: 2, title: "Respiración diafragmática", objective: "Dominar apoyo de aire básico", exercises: ["4-7-8 breathing", "Sostenimiento de nota", "Lip trills 3 min"], status: "completed" },
      { week: 3, title: "Afinación básica", objective: "Precisión en escala mayor", exercises: ["Escalas con piano", "Ear training notas", "Cantar con guía"], status: "completed" },
      { week: 4, title: "Integración Fase 1", objective: "Combinar respiración + afinación", exercises: ["Canción completa lenta", "Grabación de progreso", "Auto-evaluación"], status: "active" },
    ],
  },
  {
    name: "Desarrollo",
    color: "text-primary",
    weeks: [
      { week: 5, title: "Extensión de rango", objective: "Ganar medio tono arriba", exercises: ["Sirenas ascendentes", "Lip rolls agudos", "Escala cromática"], status: "pending" },
      { week: 6, title: "Vibrato controlado", objective: "Vibrato natural en notas largas", exercises: ["Pulso diafragmático", "Vibrato lento → rápido", "Canciones con vibrato"], status: "pending" },
      { week: 7, title: "Timing y ritmo", objective: "Cantar con precisión rítmica", exercises: ["Metrónomo a 80bpm", "Síncopas básicas", "Canción rítmica"], status: "pending" },
      { week: 8, title: "Integración Fase 2", objective: "Performance con técnica intermedia", exercises: ["Canción de dificultad media", "Grabación comparativa", "Coaching IA"], status: "pending" },
    ],
  },
  {
    name: "Dominio",
    color: "text-violet-400",
    weeks: [
      { week: 9, title: "Dinámica y expresión", objective: "Controlar piano a forte", exercises: ["Crescendos", "Susurro a belting", "Canción emotiva"], status: "pending" },
      { week: 10, title: "Estilo personal", objective: "Desarrollar identidad vocal", exercises: ["Riffs básicos", "Ornamentación", "Interpretación libre"], status: "pending" },
      { week: 11, title: "Performance completa", objective: "Cantar 3 canciones con técnica", exercises: ["Setlist de 3 canciones", "Grabación HD", "Auto-Mix"], status: "pending" },
      { week: 12, title: "Graduación", objective: "Evaluación final y nuevo plan", exercises: ["Fingerprint comparativo", "Portfolio actualizado", "Nuevo Dream Canvas"], status: "pending" },
    ],
  },
];

const currentWeek = 4;
const totalWeeks = 12;
const completedSessions = 18;
const daysRemaining = 63;
const improvement = 23;

const statusIcon = (s: WeekStatus) => {
  if (s === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (s === "active") return <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}><Circle className="h-4 w-4 text-primary fill-primary" /></motion.div>;
  return <Circle className="h-4 w-4 text-muted-foreground/30" />;
};

const Plan90 = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
    <StaggerContainer>
      <StaggerItem>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Plan de 90 Días</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Tu ruta personalizada</p>
              <Badge variant="secondary" className="text-[10px] gap-1"><Sparkles className="h-3 w-3" />Generado por IA</Badge>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* Stats */}
      <StaggerItem>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Semana actual", value: `${currentWeek}/${totalWeeks}`, icon: Calendar },
            { label: "Días restantes", value: daysRemaining, icon: Clock },
            { label: "Sesiones", value: completedSessions, icon: Dumbbell },
            { label: "Mejora", value: `+${improvement}%`, icon: TrendingUp },
          ].map((s) => (
            <Card key={s.label} className="bg-muted/30">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </StaggerItem>

      {/* Progress */}
      <StaggerItem>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progreso general</span>
            <span>{Math.round((currentWeek / totalWeeks) * 100)}%</span>
          </div>
          <Progress value={(currentWeek / totalWeeks) * 100} className="h-2" />
        </div>
      </StaggerItem>

      {/* Timeline */}
      {phases.map((phase) => (
        <StaggerItem key={phase.name}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm uppercase tracking-wider ${phase.color}`}>{phase.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {phase.weeks.map((w) => (
                <motion.div
                  key={w.week}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 rounded-lg border transition-colors ${w.status === "active" ? "border-primary/40 bg-primary/5" : "border-border/40 bg-muted/20"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{statusIcon(w.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">S{w.week}</span>
                        <span className="text-sm font-medium text-foreground">{w.title}</span>
                        {w.status === "active" && <Badge className="text-[9px] h-4 bg-primary/20 text-primary border-0">ACTIVA</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{w.objective}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {w.exercises.map((e) => (
                          <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{e}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </StaggerItem>
      ))}
    </StaggerContainer>
  </div>
);

export default Plan90;
