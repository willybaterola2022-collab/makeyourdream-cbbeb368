import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, BrainCircuit, Play, Clock, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { StageButton } from "@/components/ui/StageButton";

interface MetricData {
  label: string;
  value: number;
  delta: number;
}

const Coach = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [observations, setObservations] = useState<string[]>([]);
  const [recommendedExercise, setRecommendedExercise] = useState<{ name: string; duration: number; description: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function loadCoachData() {
      // Try edge function first
      try {
        const { data, error } = await supabase.functions.invoke("ai-coach-feedback", {
          body: { user_id: user!.id },
        });
        if (!error && data?.metrics) {
          setMetrics(data.metrics);
          setObservations(data.observations || []);
          setRecommendedExercise(data.recommended_exercise || null);
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback: local logic
      const { data: sessions } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!sessions || sessions.length === 0) {
        setMetrics([
          { label: "Afinación", value: 0, delta: 0 },
          { label: "Timing", value: 0, delta: 0 },
          { label: "Expresión", value: 0, delta: 0 },
        ]);
        setObservations(["Aún no tienes sesiones. ¡Empieza a cantar para recibir feedback!"]);
        setLoading(false);
        return;
      }

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const thisWeek = sessions.filter((s) => new Date(s.created_at) >= weekAgo);
      const lastWeek = sessions.filter((s) => new Date(s.created_at) >= twoWeeksAgo && new Date(s.created_at) < weekAgo);

      const avg = (arr: (number | null)[]) => {
        const valid = arr.filter(Boolean) as number[];
        return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
      };

      const pitchThis = avg(thisWeek.map((s) => s.pitch_score));
      const pitchLast = avg(lastWeek.map((s) => s.pitch_score));
      const timingThis = avg(thisWeek.map((s) => s.timing_score));
      const timingLast = avg(lastWeek.map((s) => s.timing_score));
      const exprThis = avg(thisWeek.map((s) => s.expression_score));
      const exprLast = avg(lastWeek.map((s) => s.expression_score));

      setMetrics([
        { label: "Afinación", value: pitchThis || avg(sessions.map((s) => s.pitch_score)), delta: pitchThis - pitchLast },
        { label: "Timing", value: timingThis || avg(sessions.map((s) => s.timing_score)), delta: timingThis - timingLast },
        { label: "Expresión", value: exprThis || avg(sessions.map((s) => s.expression_score)), delta: exprThis - exprLast },
      ]);

      const obs: string[] = [];
      const lowest = [
        { name: "pitch", val: pitchThis },
        { name: "timing", val: timingThis },
        { name: "expresión", val: exprThis },
      ].sort((a, b) => a.val - b.val)[0];

      if (pitchThis > pitchLast && pitchLast > 0) obs.push(`Tu afinación mejoró ${pitchThis - pitchLast}% esta semana — ¡sigue así!`);
      if (timingThis > timingLast && timingLast > 0) obs.push(`Tu timing subió ${timingThis - timingLast}% — el ritmo va mejor.`);
      if (exprThis < exprLast && exprLast > 0) obs.push("Tu expresividad bajó un poco — intenta variar la dinámica.");
      if (lowest.val > 0) obs.push(`Tu punto más débil es ${lowest.name} (${lowest.val}%). Enfócate en eso.`);
      if (thisWeek.length >= 3) obs.push(`Llevas ${thisWeek.length} sesiones esta semana. ¡Gran constancia!`);
      if (obs.length === 0) obs.push("Sigue practicando para generar insights más precisos.");

      setObservations(obs);
      setLoading(false);
    }

    loadCoachData();
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <BrainCircuit className="h-16 w-16 text-secondary/40" />
        <h2 className="font-serif text-2xl font-bold text-foreground text-center">AI Vocal Coach</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Inicia sesión para ver tu análisis personalizado basado en tus sesiones de entrenamiento.
        </p>
        <StageButton variant="primary" icon={<LogIn className="h-5 w-5" />} onClick={() => navigate("/login")}>
          INICIAR SESIÓN
        </StageButton>
      </div>
    );
  }

  const exerciseName = recommendedExercise?.name || (
    metrics.length > 0 && metrics[0].value > 0
      ? metrics.reduce((a, b) => a.value < b.value ? a : b).label === "Afinación"
        ? "Escala Cromática con Feedback"
        : metrics.reduce((a, b) => a.value < b.value ? a : b).label === "Timing"
        ? "Ejercicio de Ritmo con Metrónomo"
        : "Lip Trill con Variación Dinámica"
      : "Lip Trill con Escala Mayor"
  );

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">AI Vocal Coach</h1>
        <p className="text-muted-foreground text-sm mt-1">Análisis basado en tus sesiones reales</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => {
          const DeltaIcon = m.delta > 0 ? TrendingUp : m.delta < 0 ? TrendingDown : Minus;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 text-center"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
              <p className="text-2xl font-serif font-bold text-foreground">{m.value || "—"}</p>
              <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${
                m.delta > 0 ? "text-primary" : m.delta < 0 ? "text-destructive" : "text-muted-foreground"
              }`}>
                <DeltaIcon className="h-3 w-3" />
                <span>{m.delta > 0 ? "+" : ""}{m.delta}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="h-5 w-5 text-secondary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Observaciones del Coach</h3>
        </div>
        <div className="space-y-3">
          {observations.map((obs, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-3">
              <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-secondary">{i + 1}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{obs}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5 border-primary/20 glow-stage"
      >
        <p className="text-[11px] text-primary uppercase tracking-widest mb-2">Ejercicio recomendado</p>
        <h3 className="font-serif text-xl font-semibold text-foreground">{exerciseName}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          {recommendedExercise?.description || "Fortalece tu punto más débil con este ejercicio personalizado"}
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{recommendedExercise?.duration || 5} min</span>
          </div>
        </div>
        <StageButton variant="primary" icon={<Play className="h-5 w-5" />} onClick={() => navigate("/warmup")} className="w-full">
          INICIAR EJERCICIO
        </StageButton>
      </motion.div>
    </div>
  );
};

export default Coach;
