import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, Dumbbell, Fingerprint, Zap, Music, TrendingUp, Clock } from "lucide-react";
import VintageMicrophone from "@/components/karaoke/VintageMicrophone";
import { SongBrowser } from "@/components/SongBrowser";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// BACKEND-REQUEST: daily-challenge
// Input: { user_id: string }
// Output: { challenge_id, title, description, reward_xp, expires_at }
// Descripción: Genera un reto diario personalizado basado en el nivel del usuario

const CTAs = [
  {
    label: "CANTA",
    sub: "Tu escenario te espera",
    path: "/karaoke",
    icon: Mic,
    gradient: "from-[hsl(275_85%_50%)] to-[hsl(275_85%_65%)]",
    glow: "shadow-[0_0_30px_-6px_hsl(275_85%_60%/0.5)]",
  },
  {
    label: "ENTRENA",
    sub: "Ejercicios con feedback real",
    path: "/warmup",
    icon: Dumbbell,
    gradient: "from-[hsl(25_90%_50%)] to-[hsl(35_90%_55%)]",
    glow: "shadow-[0_0_30px_-6px_hsl(25_90%_50%/0.5)]",
  },
  {
    label: "TU VOZ",
    sub: "Descubre tu perfil vocal",
    path: "/fingerprint",
    icon: Fingerprint,
    gradient: "from-[hsl(185_90%_45%)] to-[hsl(185_90%_55%)]",
    glow: "shadow-[0_0_30px_-6px_hsl(185_90%_55%/0.5)]",
  },
];

interface UserStats {
  totalRecordings: number;
  totalSessions: number;
  avgScore: number;
  xp: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchStats() {
      const [recRes, sessRes, profRes] = await Promise.all([
        supabase.from("recordings").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("training_sessions").select("overall_score").eq("user_id", user!.id),
        supabase.from("profiles").select("xp").eq("user_id", user!.id).single(),
      ]);
      const sessions = sessRes.data || [];
      const scores = sessions.map((s) => s.overall_score).filter(Boolean) as number[];
      setStats({
        totalRecordings: recRes.count || 0,
        totalSessions: sessions.length,
        avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        xp: profRes.data?.xp || 0,
      });
    }
    fetchStats();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ═══ HERO — MICRÓFONO CELEBRITY ═══ */}
      <section className="min-h-[70vh] md:min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden px-4"
        style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(275 85% 15% / 0.4) 0%, hsl(0 0% 4%) 70%)" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] md:w-[900px] md:h-[600px] rounded-full opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, hsl(275 85% 60% / 0.35), transparent 70%)" }}
        />

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            style={{ left: `${15 + Math.random() * 70}%`, top: `${10 + Math.random() * 60}%` }}
            animate={{ y: [-20, 20, -20], opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          />
        ))}

        <VintageMicrophone
          isActive={false}
          volume={0}
          onClick={() => navigate("/karaoke")}
          state="idle"
          size="hero"
        />
      </section>

      {/* ═══ 3 CTAs GIGANTES ═══ */}
      <section className="py-8 md:py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {CTAs.map((cta, i) => (
            <motion.button
              key={cta.label}
              onClick={() => navigate(cta.path)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.95 }}
              className={`relative rounded-2xl bg-gradient-to-br ${cta.gradient} ${cta.glow} p-6 md:p-8 flex flex-col items-center gap-3 text-center overflow-hidden cursor-pointer`}
            >
              <motion.span
                className="absolute inset-0 rounded-2xl border-2 border-white/10"
                animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <cta.icon className="h-12 w-12 md:h-14 md:w-14 text-white/90" strokeWidth={1.5} />
              <span className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-white">
                {cta.label}
              </span>
              <span className="text-sm text-white/70">{cta.sub}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ═══ STATS DEL USUARIO ═══ */}
      <section className="py-6 px-4">
        {user && stats ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-4 gap-3 max-w-2xl mx-auto"
          >
            {[
              { value: stats.totalRecordings, label: "Grabaciones", icon: Music },
              { value: stats.totalSessions, label: "Sesiones", icon: Clock },
              { value: stats.avgScore || "—", label: "Score Prom.", icon: TrendingUp },
              { value: stats.xp, label: "XP", icon: Zap },
            ].map((s) => (
              <div key={s.label} className="glass-card p-3 md:p-4 text-center">
                <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-xl md:text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>
        ) : !user ? (
          <p className="text-center text-sm text-muted-foreground">
            <button onClick={() => navigate("/login")} className="text-primary hover:underline">
              Inicia sesión
            </button>{" "}
            para ver tu progreso
          </p>
        ) : null}
      </section>

      {/* ═══ RETO DEL DÍA ═══ */}
      <section className="py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto glass-card p-5 md:p-6 border-primary/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Reto del Día</span>
          </div>
          <h3 className="font-serif text-lg md:text-xl font-bold text-foreground mb-1">
            Canta una balada con vibrato controlado
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Elige una balada, canta al menos 30 segundos y logra un score de vibrato superior a 70.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Expira en 14h 32m
            </span>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/karaoke")}
              className="px-4 py-2 rounded-xl stage-gradient text-primary-foreground text-sm font-bold uppercase tracking-wider"
            >
              Aceptar reto
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ═══ CANCIONES ═══ */}
      <section className="py-8 md:py-12 px-4 space-y-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground uppercase tracking-wider text-center neon-text">
          Elige y Canta
        </h2>
        <SongBrowser />
      </section>
    </div>
  );
};

export default Index;
