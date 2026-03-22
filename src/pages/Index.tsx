import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { VocalRadar } from "@/components/VocalRadar";
import { PhaseProgress } from "@/components/PhaseProgress";
import { StreakFlame } from "@/components/StreakFlame";
import { trackEvent } from "@/lib/trackEvent";

interface HomeData {
  streak: number;
  sessionToday: boolean;
  challengeTitle: string | null;
  lastRecording: string | null;
  xp: number;
  radarValues: number[];
  hasFingerprint: boolean;
  displayName: string | null;
  unseenBadge: boolean;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function getTension(data: HomeData): string {
  // P1: Racha en riesgo
  if (data.streak > 3 && !data.sessionToday) {
    return `Tu racha de ${data.streak} noches está a punto de enfriarse.`;
  }
  // P2: Badge no visto
  if (data.unseenBadge) {
    return "Desbloqueaste algo nuevo. Abrilo.";
  }
  // P3: Reto del día
  if (data.challengeTitle) {
    return `El reto de hoy: ${data.challengeTitle}.`;
  }
  // P4: Mejora vs ayer
  if (data.lastRecording) {
    return `Tu última toma fue ${data.lastRecording}. Tu voz te está esperando.`;
  }
  // P5: Fallback
  return "Tu voz te está esperando.";
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [voiceCount, setVoiceCount] = useState<number>(847);

  // Track app_opened
  useEffect(() => {
    if (user) trackEvent(user.id, "app_opened");
  }, [user]);

  // Fetch social proof count
  useEffect(() => {
    supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (count && count > 0) setVoiceCount(count);
      });
  }, []);

  // Fetch authenticated home data
  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      let streak = 0, xp = 0, sessionToday = false;
      let challengeTitle: string | null = null;
      let lastRecording: string | null = null;
      let radarValues = [0, 0, 0, 0, 0, 0];
      let hasFingerprint = false;
      let displayName: string | null = null;
      let unseenBadge = false;

      try {
        const { data } = await supabase.functions.invoke("gamification-engine", {
          body: { action: "get_progress", user_id: user!.id },
        });
        if (data) {
          streak = data.streak_days ?? 0;
          xp = data.xp ?? 0;
          // Check unseen badges
          const badges = data.badges as any[] ?? [];
          unseenBadge = badges.some((b: any) => b.seen === false);
        }
      } catch {
        const { data: p } = await supabase
          .from("user_progress")
          .select("streak_days, xp, badges")
          .eq("user_id", user!.id)
          .maybeSingle();
        streak = p?.streak_days ?? 0;
        xp = p?.xp ?? 0;
        const badges = (p?.badges as any[]) ?? [];
        unseenBadge = badges.some((b: any) => b.seen === false);
      }

      // Check session today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("training_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("created_at", todayStart.toISOString());
      sessionToday = (count ?? 0) > 0;

      // Daily challenge
      try {
        const { data } = await supabase.functions.invoke("daily-challenge", {
          body: { action: "get_today", user_id: user!.id },
        });
        challengeTitle = data?.challenge?.title ?? null;
      } catch {
        const today = new Date().toISOString().split("T")[0];
        const { data: c } = await supabase
          .from("daily_challenges")
          .select("title")
          .eq("active_date", today)
          .limit(1)
          .maybeSingle();
        challengeTitle = c?.title ?? null;
      }

      // Last recording
      const { data: recData } = await supabase
        .from("recordings")
        .select("created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (recData?.[0]?.created_at) {
        const diff = Math.floor((Date.now() - new Date(recData[0].created_at).getTime()) / 86400000);
        lastRecording = diff === 0 ? "hoy" : diff === 1 ? "ayer" : `hace ${diff} días`;
      }

      // Fingerprint
      const { data: fp } = await supabase
        .from("vocal_fingerprints")
        .select("dimensions")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (fp?.dimensions) {
        hasFingerprint = true;
        const d = fp.dimensions as any;
        radarValues = [d.pitch ?? 0, d.rhythm ?? 0, d.vibrato ?? 0, d.sustain ?? 0, d.control ?? 0, d.range ?? 0];
      }

      // Profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      displayName = profile?.display_name ?? null;

      setHomeData({ streak, sessionToday, challengeTitle, lastRecording, xp, radarValues, hasFingerprint, displayName, unseenBadge });

      // Onboarding redirect: if no fingerprint, go to vocal DNA test
      if (!hasFingerprint) {
        navigate("/vocal-dna-test", { replace: true });
      }
    }
    fetchData();
  }, [user, navigate]);

  // ══ NON-AUTH HOME ══
  if (!user) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm w-full text-center space-y-8"
        >
          <h1 className="font-display text-4xl text-foreground leading-tight">
            Tu voz deja una huella
          </h1>
          <p className="text-base text-muted-foreground">
            Cantá una sola vez y descubrí qué hace única a tu voz.
          </p>
          <motion.button
            onClick={() => navigate("/vocal-dna-test")}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wide shadow-[0_0_30px_-8px_hsl(var(--primary)/0.5)] transition-all hover:shadow-[0_0_40px_-8px_hsl(var(--primary)/0.6)]"
          >
            Descubrir mi voz
          </motion.button>
          <p className="text-xs text-muted-foreground">
            Sin registro. Resultado en segundos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute bottom-12 text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            Hoy ya dejaron su huella <span className="font-mono text-foreground">{voiceCount}</span> voces
          </p>
          <button
            onClick={() => navigate("/karaoke")}
            className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
          >
            ¿Preferís ir directo a una canción?
          </button>
        </motion.div>
      </div>
    );
  }

  // ══ AUTH HOME ══
  const name = homeData?.displayName ?? user.email?.split("@")[0] ?? "artista";
  const tension = homeData ? getTension(homeData) : "Cargando...";

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto space-y-8">
      {/* Bloque 1: Saludo + Tensión */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-2">
        <p className="text-base text-muted-foreground">
          {getGreeting()}, <span className="text-foreground font-medium">{name}</span>
        </p>
        <p className="font-display text-lg text-foreground leading-snug">{tension}</p>
      </motion.div>

      {/* Bloque 2: CTA */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        onClick={() => navigate("/karaoke")}
        whileTap={{ scale: 0.96 }}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wide shadow-[0_0_30px_-8px_hsl(var(--primary)/0.5)] flex items-center justify-center gap-3"
      >
        <Mic className="w-5 h-5" />
        Cantar ahora
      </motion.button>

      {/* Bloque 3: Dos cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate("/fingerprint")} className="glass-card p-4 text-left space-y-3 hover:border-primary/30 transition-all">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Mi Vocal DNA</p>
          {homeData?.hasFingerprint ? (
            <div className="flex justify-center"><VocalRadar values={homeData.radarValues} size="mini" /></div>
          ) : (
            <p className="text-sm text-primary">Descubrí tu huella</p>
          )}
        </button>
        <button onClick={() => navigate("/skill-tree")} className="glass-card p-4 text-left space-y-3 hover:border-primary/30 transition-all">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Soy Leyenda</p>
          <PhaseProgress xp={homeData?.xp ?? 0} compact />
        </button>
      </motion.div>

      {/* Bloque 4: Contexto bottom */}
      {homeData && homeData.streak > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="flex items-center justify-center gap-2">
          <StreakFlame days={homeData.streak} />
          <span className="text-sm text-muted-foreground">{homeData.streak} noches encendiendo tu voz</span>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
