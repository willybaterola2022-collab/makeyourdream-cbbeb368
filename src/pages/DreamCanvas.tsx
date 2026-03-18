import { motion } from "framer-motion";
import { useState } from "react";
import { Palette, Target, Calendar, TrendingUp, Sparkles, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";

const dimensions = [
  { name: "Afinación", current: 62, target: 90 },
  { name: "Timing", current: 75, target: 88 },
  { name: "Vibrato", current: 40, target: 80 },
  { name: "Sustain", current: 55, target: 85 },
  { name: "Control", current: 68, target: 92 },
  { name: "Registro", current: 50, target: 78 },
];

const milestones = [
  { week: 4, title: "Dominar respiración diafragmática", done: true },
  { week: 8, title: "Ampliar rango medio tono arriba", done: false },
  { week: 12, title: "Controlar vibrato consistente", done: false },
];

const DreamCanvas = () => {
  const [dream, setDream] = useState("Cantar en un escenario frente a 500 personas");
  const [targetDate, setTargetDate] = useState("2026-06-15");
  const [evidence, setEvidence] = useState("Grabar una cover profesional y subirla a redes");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <StaggerContainer>
        {/* Header */}
        <StaggerItem>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Dream Canvas Vocal</h1>
              <p className="text-sm text-muted-foreground">Define tu sueño musical y traza el camino</p>
            </div>
          </div>
        </StaggerItem>

        {/* Dream definition */}
        <StaggerItem>
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-4 w-4 text-primary" />
                Mi Sueño Musical
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">¿Cuál es tu sueño?</label>
                <Input value={dream} onChange={(e) => setDream(e.target.value)} className="mt-1 bg-muted/30 border-border/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Fecha objetivo</label>
                  <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1 bg-muted/30 border-border/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Evidencia de éxito</label>
                  <Input value={evidence} onChange={(e) => setEvidence(e.target.value)} className="mt-1 bg-muted/30 border-border/50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Gap Map */}
        <StaggerItem>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
                Mapa de Brechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dimensions.map((d) => (
                <div key={d.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{d.name}</span>
                    <span className="text-muted-foreground">{d.current} → {d.target}</span>
                  </div>
                  <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.current}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="absolute h-full rounded-full bg-muted-foreground/30"
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.target}%` }}
                      transition={{ duration: 1.2, delay: 0.4 }}
                      className="absolute h-full rounded-full bg-primary/20 border-r-2 border-primary"
                      style={{ width: `${d.target}%` }}
                    />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.current}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="absolute h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Milestones */}
        <StaggerItem>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-4 w-4 text-primary" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
                {milestones.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="relative flex items-start gap-3"
                  >
                    <div className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${m.done ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"}`}>
                      {m.done && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Semana {m.week}</p>
                      <p className={`text-sm font-medium ${m.done ? "text-foreground" : "text-muted-foreground"}`}>{m.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
};

export default DreamCanvas;
