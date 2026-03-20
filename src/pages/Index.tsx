import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, Fingerprint, Dumbbell, Zap, Heart, Sparkles, Eye } from "lucide-react";
import DreamBooth from "@/components/DreamBooth";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/* ── Rotating live phrases ── */
const LIVE_PHRASES = [
  "Tu estudio está encendido",
  "Descubre cómo suena tu voz",
  "Haz una toma antes de pensarlo",
  "Graba lo que no estás diciendo",
  "Tu siguiente versión está a 20 segundos",
];

/* ── Mood capsules ── */
const MOODS = [
  { label: "Soltar", icon: Heart },
  { label: "Crear", icon: Sparkles },
  { label: "Entrenar", icon: Dumbbell },
  { label: "Mostrar", icon: Eye },
] as const;

/* ── Launch pads ── */
const PADS = [
  {
    label: "GRABAR",
    sub: "Hacer una toma",
    path: "/karaoke",
    icon: Mic,
    borderColor: "hsl(275 85% 60%/0.3)",
    glowColor: "hsl(275 85% 60%/0.2)",
  },
  {
    label: "DESCUBRIR",
    sub: "Escuchar mi voz",
    path: "/fingerprint",
    icon: Fingerprint,
    borderColor: "hsl(185 90% 55%/0.3)",
    glowColor: "hsl(185 90% 55%/0.2)",
  },
  {
    label: "ENTRENAR",
    sub: "Solo 2 minutos",
    path: "/warmup",
    icon: Dumbbell,
    borderColor: "hsl(25 90% 55%/0.3)",
    glowColor: "hsl(25 90% 55%/0.2)",
  },
] as const;

/* ── Life signal data ── */
interface LifeSignal {
  lastRecording: string | null;
  streak: number;
  challengeTitle: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [lifeSignal, setLifeSignal] = useState<LifeSignal | null>(null);

  /* Rotate phrases */
  useEffect(() => {
    const t = setInterval(() => setPhraseIdx((i) => (i + 1) % LIVE_PHRASES.length), 6000);
    return () => clearInterval(t);
  }, []);

  /* Fetch life signal */
  useEffect(() => {
    if (!user) return;
    async function fetch() {
      const { data } = await supabase
        .from("recordings")
        .select("created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastDate = data?.[0]?.created_at;
      let lastRecording: string | null = null;
      if (lastDate) {
        const diff = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
        lastRecording = diff === 0 ? "hoy" : diff === 1 ? "ayer" : `hace ${diff} días`;
      }

      setLifeSignal({
        lastRecording,
        streak: 3, // placeholder until backend
        challengeTitle: "Canta suave, no fuerte",
      });
    }
    fetch();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ═══════════ PANTALLA 1 — ESCENA INMERSIVA ═══════════ */}
      <section
        className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden px-4"
        style={{
          background: `
            radial-gradient(ellipse at 50% 20%, hsl(275 85% 15%/0.35) 0%, transparent 60%),
            radial-gradient(ellipse at 30% 70%, hsl(185 90% 15%/0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, hsl(275 60% 10%/0.2) 0%, transparent 50%),
            hsl(0 0% 4%)
          `,
        }}
      >
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 50%, hsl(0 0% 4%) 100%)",
          }}
        />

        {/* ── Live phrase ── */}
        <div className="relative h-8 mb-6 z-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIdx}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs md:text-sm tracking-[0.25em] uppercase text-muted-foreground/60 text-center"
            >
              {LIVE_PHRASES[phraseIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── Dream Booth ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="z-10"
        >
          <DreamBooth onClick={() => navigate("/karaoke")} />
        </motion.div>

        {/* ── Mood Capsules ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex gap-2 mt-6 z-10"
        >
          {MOODS.map((m) => (
            <StageButton
              key={m.label}
              variant="capsule"
              active={activeMood === m.label}
              onClick={() => setActiveMood(activeMood === m.label ? null : m.label)}
              icon={<m.icon className="h-3 w-3" />}
              className="text-[10px]"
            >
              {m.label}
            </StageButton>
          ))}
        </motion.div>

        {/* ── CTA Monolith ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 z-10 w-full max-w-xs"
        >
          <StageButton
            variant="monolith"
            pulse
            onClick={() => navigate("/karaoke")}
            icon={<Mic className="h-5 w-5" />}
            className="w-full"
          >
            Grabar ahora
          </StageButton>
        </motion.div>

        {/* ── Scroll hint ── */}
        <motion.div
          className="absolute bottom-6 z-10"
          animate={{ y: [0, 6, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-5 h-8 rounded-full border border-muted-foreground/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-1.5 rounded-full bg-muted-foreground/40" />
          </div>
        </motion.div>
      </section>

      {/* ═══════════ PANTALLA 2 — LAUNCH PADS ═══════════ */}
      <section className="py-12 md:py-16 px-4">
        <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-md mx-auto">
          {PADS.map((pad, i) => (
            <motion.button
              key={pad.label}
              onClick={() => navigate(pad.path)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.95, y: 2 }}
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden transition-all"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${pad.glowColor}, hsl(0 0% 7%) 70%)`,
                border: `1px solid ${pad.borderColor}`,
                boxShadow: `inset 0 -4px 12px hsl(0 0% 0%/0.5), inset 0 1px 0 hsl(0 0% 100%/0.04), 0 0 25px -8px ${pad.glowColor}`,
              }}
            >
              <pad.icon className="h-8 w-8 md:h-10 md:w-10 text-foreground/80" strokeWidth={1.5} />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">
                {pad.label}
              </span>
              {/* Breathing line */}
              <motion.span
                className="absolute bottom-3 left-[25%] right-[25%] h-[1.5px] rounded-full"
                style={{ background: pad.borderColor }}
                animate={{ scaleX: [0.5, 1, 0.5], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.button>
          ))}
        </div>
      </section>

      {/* ═══════════ PANTALLA 3 — SEÑAL DE VIDA ═══════════ */}
      <section className="py-8 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
        >
          {user && lifeSignal ? (
            <div className="glass-card p-5 space-y-3 border-primary/10">
              {lifeSignal.lastRecording && (
                <p className="text-xs text-muted-foreground">
                  Tu última toma fue <span className="text-foreground font-medium">{lifeSignal.lastRecording}</span>
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-primary" />
                  Racha: <span className="text-foreground font-medium">{lifeSignal.streak} 🔥</span>
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/karaoke")}
                  className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline"
                >
                  Reto: {lifeSignal.challengeTitle}
                </motion.button>
              </div>
            </div>
          ) : !user ? (
            <p className="text-center text-xs text-muted-foreground/50">
              <button onClick={() => navigate("/login")} className="text-primary/60 hover:text-primary hover:underline transition-colors">
                Inicia sesión
              </button>{" "}
              para que tu estudio te recuerde
            </p>
          ) : null}
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
