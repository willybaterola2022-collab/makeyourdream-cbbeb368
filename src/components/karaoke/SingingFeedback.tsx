import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Share2, RotateCcw, Trophy, Save } from "lucide-react";
import { StageButton } from "@/components/ui/StageButton";
import ShareCard from "@/components/ShareCard";

interface ScoreData {
  pitch: number;
  timing: number;
  expression: number;
}

interface Props {
  scores: ScoreData;
  isActive: boolean;
  finished: boolean;
  onRetry?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  songTitle?: string;
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

// Animated counter that counts up from 0 to target
function AnimatedNumber({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / (duration * 1000);
      if (elapsed >= 1) {
        setCurrent(target);
        return;
      }
      // Ease out cubic
      const t = 1 - Math.pow(1 - elapsed, 3);
      setCurrent(Math.round(t * target));
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <>{current}</>;
}

export default function SingingFeedback({ scores, isActive, finished, onRetry, onSave, onShare, songTitle }: Props) {
  const global = Math.round(scores.pitch * 0.5 + scores.timing * 0.3 + scores.expression * 0.2);
  const grade = getGrade(global);
  const [showShare, setShowShare] = useState(false);

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

  // After finishing: SPECTACULAR results screen
  if (finished) {
    const feedback = getOverallFeedback(global);

    // Build radar dimensions from scores
    const radarDimensions = [
      { name: "Afinación", value: scores.pitch },
      { name: "Timing", value: scores.timing },
      { name: "Expresión", value: scores.expression },
      { name: "Sustain", value: Math.round((scores.pitch + scores.timing) / 2) },
      { name: "Control", value: Math.round((scores.timing + scores.expression) / 2) },
      { name: "Registro", value: Math.round((scores.pitch + scores.expression) / 2) },
    ];

    // Radar chart params
    const numDims = radarDimensions.length;
    const cx = 120, cy = 120, maxR = 90;
    const getPoint = (i: number, val: number) => {
      const angle = (2 * Math.PI * i) / numDims - Math.PI / 2;
      const r = (val / 100) * maxR;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    };
    const polygonPoints = radarDimensions.map((d, i) => {
      const p = getPoint(i, d.value);
      return `${p.x},${p.y}`;
    }).join(" ");
    const gridPolygon = (pct: number) =>
      Array.from({ length: numDims }).map((_, i) => {
        const p = getPoint(i, pct);
        return `${p.x},${p.y}`;
      }).join(" ");

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-5 md:p-6 space-y-5 border-primary/20 shadow-[0_0_40px_-10px_hsl(275_85%_60%/0.2)]"
        >
          {/* Big animated score */}
          <motion.div
            className="text-center space-y-2"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.p
              className="text-5xl md:text-6xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {feedback.emoji}
            </motion.p>
            <div className="relative">
              <p className={`text-6xl md:text-7xl font-serif font-bold ${grade.color}`}>
                <AnimatedNumber target={global} duration={1.5} />
              </p>
              <motion.span
                className={`absolute -top-2 -right-2 md:right-1/4 text-3xl font-serif font-bold ${grade.color}`}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.5, type: "spring" }}
              >
                {grade.label}
              </motion.span>
            </div>
            <p className="font-serif text-lg font-semibold text-foreground">{feedback.text}</p>
            <p className="text-sm text-muted-foreground">{feedback.sub}</p>
          </motion.div>

          {/* Radar 6D */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <svg viewBox="0 0 240 240" className="w-full max-w-[260px]">
              {[25, 50, 75, 100].map((pct) => (
                <polygon key={pct} points={gridPolygon(pct)} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
              ))}
              {radarDimensions.map((_, i) => {
                const p = getPoint(i, 100);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="0.5" />;
              })}
              <motion.polygon
                points={polygonPoints}
                fill="hsl(var(--primary) / 0.15)"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              />
              {radarDimensions.map((d, i) => {
                const p = getPoint(i, d.value);
                return (
                  <motion.circle key={i} cx={p.x} cy={p.y} r="4" fill="hsl(var(--primary))"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1 }}
                  />
                );
              })}
              {radarDimensions.map((d, i) => {
                const p = getPoint(i, 115);
                return (
                  <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
                    className="fill-muted-foreground text-[8px]">
                    {d.name}
                  </text>
                );
              })}
            </svg>
          </motion.div>

          {/* Score breakdown bars */}
          <div className="space-y-3">
            {[
              { label: "Afinación", value: scores.pitch, tip: getPitchTip(scores.pitch) },
              { label: "Timing", value: scores.timing, tip: getTimingTip(scores.timing) },
              { label: "Expresión", value: scores.expression, tip: getExpressionTip(scores.expression) },
            ].map((s, i) => {
              const g = getGrade(s.value);
              return (
                <motion.div
                  key={s.label}
                  className="space-y-1"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.15 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
                    <span className={`text-sm font-bold font-serif ${g.color}`}>{s.value} ({g.label})</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full stage-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 0.8, delay: 1.4 + i * 0.15, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{s.tip}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Action buttons */}
          <motion.div
            className="flex gap-3 justify-center pt-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
          >
            {onRetry && (
              <StageButton variant="glass" icon={<RotateCcw className="h-5 w-5" />} onClick={onRetry}>
                OTRA VEZ
              </StageButton>
            )}
            {onSave && (
              <StageButton variant="primary" icon={<Save className="h-5 w-5" />} onClick={onSave}>
                GUARDAR
              </StageButton>
            )}
            <StageButton variant="accent" icon={<Share2 className="h-5 w-5" />} onClick={() => setShowShare(true)}>
              COMPARTIR
            </StageButton>
          </motion.div>

          {/* Celebration particles for S or A grade */}
          {global >= 70 && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${10 + Math.random() * 30}%`,
                    background: i % 2 === 0 ? "hsl(275 85% 60%)" : "hsl(185 90% 55%)",
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    y: [0, -40 - Math.random() * 40],
                    x: [(Math.random() - 0.5) * 60],
                  }}
                  transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                />
              ))}
            </>
          )}
        </motion.div>

        {/* Share Card modal */}
        {showShare && (
          <ShareCard
            dimensions={[
              { name: "Afinación", value: scores.pitch },
              { name: "Timing", value: scores.timing },
              { name: "Expresión", value: scores.expression },
              { name: "Sustain", value: Math.round((scores.pitch + scores.timing) / 2) },
              { name: "Control", value: Math.round((scores.timing + scores.expression) / 2) },
              { name: "Registro", value: Math.round((scores.pitch + scores.expression) / 2) },
            ]}
            globalScore={global}
            similarArtist={songTitle || "Tu Performance"}
            vocalRange={{ low: "", high: "" }}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    );
  }

  return null;
}
