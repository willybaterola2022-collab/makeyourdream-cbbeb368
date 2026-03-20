import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Palette, Target, TrendingUp, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DreamCanvas = () => {
  const { user } = useAuth();
  const [dream, setDream] = useState("Cantar en un escenario frente a 500 personas");
  const [targetDate, setTargetDate] = useState("2026-06-15");
  const [evidence, setEvidence] = useState("Grabar una cover profesional y subirla a redes");
  const [dimensions, setDimensions] = useState([
    { name: "Afinación", current: 0, target: 90 },
    { name: "Timing", current: 0, target: 88 },
    { name: "Vibrato", current: 0, target: 80 },
    { name: "Sustain", current: 0, target: 85 },
    { name: "Control", current: 0, target: 92 },
    { name: "Registro", current: 0, target: 78 },
  ]);
  const [sessionCount, setSessionCount] = useState(0);

  // Load real data from vocal_fingerprints + training_sessions
  useEffect(() => {
    if (!user) return;
    async function fetch() {
      // Latest fingerprint for current values
      const { data: fp } = await supabase
        .from("vocal_fingerprints")
        .select("dimensions")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fp?.dimensions && typeof fp.dimensions === "object") {
        const dims = fp.dimensions as Record<string, number>;
        setDimensions((prev) =>
          prev.map((d) => ({ ...d, current: dims[d.name] ?? d.current }))
        );
      }

      // Training session count
      const { count } = await supabase
        .from("training_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);

      setSessionCount(count ?? 0);
    }
    fetch();
  }, [user]);

  const milestones = [
    { week: 4, title: "Dominar respiración diafragmática", done: sessionCount >= 10 },
    { week: 8, title: "Ampliar rango medio tono arriba", done: sessionCount >= 25 },
    { week: 12, title: "Controlar vibrato consistente", done: sessionCount >= 50 },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <StaggerContainer>
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

        <StaggerItem>
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" /> Mi Sueño Musical
            </h3>
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
            <p className="text-xs text-muted-foreground">{sessionCount} sesiones de entrenamiento completadas</p>
          </div>
        </StaggerItem>

        {/* Gap Map with real data */}
        <StaggerItem>
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Mapa de Brechas
            </h3>
            {dimensions.map((d) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{d.name}</span>
                  <span className="text-muted-foreground">{d.current} → {d.target}</span>
                </div>
                <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.target}%` }}
                    transition={{ duration: 1.2, delay: 0.4 }}
                    className="absolute h-full rounded-full bg-primary/20 border-r-2 border-primary"
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
          </div>
        </StaggerItem>

        {/* Milestones */}
        <StaggerItem>
          <div className="glass-card p-5">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-primary" /> Milestones
            </h3>
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
              {milestones.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15 }} className="relative flex items-start gap-3">
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
          </div>
        </StaggerItem>
      </StaggerContainer>
    </div>
  );
};

export default DreamCanvas;
