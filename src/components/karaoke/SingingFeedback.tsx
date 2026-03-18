import { motion, AnimatePresence } from "framer-motion";

interface ScoreData {
  pitch: number;
  timing: number;
  expression: number;
}

interface Props {
  scores: ScoreData;
  isActive: boolean;
  finished: boolean;
}

function getGrade(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "S", color: "text-primary" };
  if (score >= 70) return { label: "A", color: "text-green-400" };
  if (score >= 55) return { label: "B", color: "text-blue-400" };
  if (score >= 40) return { label: "C", color: "text-yellow-400" };
  if (score >= 25) return { label: "D", color: "text-orange-400" };
  return { label: "E", color: "text-destructive" };
}

function getOverallFeedback(global: number): { emoji: string; text: string; sub: string } {
  if (global >= 85) return { emoji: "🌟", text: "¡Increíble!", sub: "Tu voz brilla con luz propia" };
  if (global >= 70) return { emoji: "🔥", text: "¡Muy bien!", sub: "Sigue así, vas por buen camino" };
  if (global >= 55) return { emoji: "👏", text: "¡Bien hecho!", sub: "Con un poco más de práctica serás imparable" };
  if (global >= 40) return { emoji: "💪", text: "Buen intento", sub: "La afinación necesita trabajo, ¡tú puedes!" };
  if (global >= 25) return { emoji: "🎯", text: "A seguir practicando", sub: "Intenta cantar más lento y escuchar la melodía" };
  return { emoji: "🌱", text: "Todos empezamos así", sub: "Practica con canciones que te gusten, ¡la clave es no parar!" };
}

function getPitchTip(score: number): string {
  if (score >= 80) return "Tu afinación es excelente 🎯";
  if (score >= 60) return "Buena afinación, afina un poco los agudos";
  if (score >= 40) return "Intenta mantener las notas más estables";
  return "Escucha la melodía e intenta imitarla poco a poco";
}

function getTimingTip(score: number): string {
  if (score >= 80) return "Ritmo impecable ⏱️";
  if (score >= 60) return "Buen ritmo, canta con más confianza";
  if (score >= 40) return "Intenta cantar justo cuando toca cada línea";
  return "Usa el metrónomo para sentir el ritmo";
}

function getExpressionTip(score: number): string {
  if (score >= 70) return "Gran expresividad, se siente la emoción 🎭";
  if (score >= 45) return "Varía un poco más el volumen para dar emoción";
  return "Canta con más fuerza, ¡no tengas miedo de sonar fuerte!";
}

export default function SingingFeedback({ scores, isActive, finished }: Props) {
  const global = Math.round(scores.pitch * 0.5 + scores.timing * 0.3 + scores.expression * 0.2);
  const grade = getGrade(global);

  if (!isActive && !finished) return null;

  // During singing: compact live score
  if (isActive && !finished) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Afinación", value: scores.pitch },
          { label: "Timing", value: scores.timing },
          { label: "Expresión", value: scores.expression },
        ].map((s) => {
          const g = getGrade(s.value);
          return (
            <div key={s.label} className="glass-card p-2 text-center">
              <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
              <p className={`text-lg font-serif font-bold ${g.color}`}>
                {s.value > 0 ? s.value : "—"}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  // After finishing: full feedback card
  if (finished) {
    const feedback = getOverallFeedback(global);
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 space-y-4"
        >
          {/* Big score */}
          <div className="text-center space-y-1">
            <p className="text-3xl">{feedback.emoji}</p>
            <p className={`text-4xl font-serif font-bold ${grade.color}`}>
              {global}<span className="text-lg text-muted-foreground">/100</span>
            </p>
            <p className="font-serif text-lg font-semibold text-foreground">{feedback.text}</p>
            <p className="text-sm text-muted-foreground">{feedback.sub}</p>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            {[
              { label: "Afinación", value: scores.pitch, tip: getPitchTip(scores.pitch) },
              { label: "Timing", value: scores.timing, tip: getTimingTip(scores.timing) },
              { label: "Expresión", value: scores.expression, tip: getExpressionTip(scores.expression) },
            ].map((s) => {
              const g = getGrade(s.value);
              return (
                <div key={s.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
                    <span className={`text-sm font-bold font-serif ${g.color}`}>{s.value} ({g.label})</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full gold-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{s.tip}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}
