import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { VocalRadar } from "@/components/VocalRadar";
import { PhaseProgress } from "@/components/PhaseProgress";
import { StreakFlame } from "@/components/StreakFlame";
import { StoriesCarousel } from "@/components/StoriesCarousel";
import { trackEvent } from "@/lib/trackEvent";
import VintageMicrophone from "@/components/karaoke/VintageMicrophone";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Buenas noches";
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

function getTension(progress: any, challenge: any, fingerprint: any): string {
  if (!progress) return "Tu voz te está esperando.";
  const today = new Date().toISOString().split("T")[0];
  const practicoHoy = progress.last_active_date === today;
  if (progress.streak_days > 3 && !practicoHoy) {
    return `Tu racha de ${progress.streak_days} noches está a punto de enfriarse.`;
  }
  const badges = (progress.badges as any[]) ?? [];
  if (badges.some((b: any) => b.seen === false)) {
    return "Desbloqueaste algo nuevo. Abrilo.";
  }
  if (challenge?.challenge && !challenge.completed) {
    return `El reto de hoy: ${challenge.challenge.description || challenge.challenge.title}`;
  }
  return "Tu voz te está esperando.";
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [voiceCount, setVoiceCount] = useState<number>(847);

  useEffect(() => { if (user) trackEvent(user.id, "app_opened"); }, [user]);

  useEffect(() => {
    supabase.from("analytics_events").select("id", { count: "exact", head: true })
      .then(({ count }) => { if (count && count > 0) setVoiceCount(count); });
  }, []);

  const { data: progressData } = useQuery({
    queryKey: ["home-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("gamification-engine", {
        body: { action: "get_progress", user_id: user!.id },
      });
      if (error) {
        const { data: p } = await supabase.from("user_progress")
          .select("streak_days, xp, badges, last_active_date, level")
          .eq("user_id", user!.id).maybeSingle();
        return p;
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: challengeData } = useQuery({
    queryKey: ["home-challenge", user?.id],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke("daily-challenge", {
        body: { action: "get_today", user_id: user!.id },
      });
      return data;
    },
    enabled: !!user,
  });

  const { data: fingerprintData } = useQuery({
    queryKey: ["home-fingerprint", user?.id],
    queryFn: async () => {
      const { data: fp } = await supabase.from("vocal_fingerprints")
        .select("dimensions").eq("user_id", user!.id)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      return fp;
    },
    enabled: !!user,
  });

  const { data: profileData } = useQuery({
    queryKey: ["home-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles")
        .select("display_name").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user && fingerprintData !== undefined && !fingerprintData?.dimensions) {
      navigate("/vocal-dna-test", { replace: true });
    }
  }, [user, fingerprintData, navigate]);

  // ══ NON-AUTH HOME ══
  if (!user) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm w-full flex flex-col items-center text-center space-y-4"
        >
          {/* Hero Microphone */}
          <VintageMicrophone
            isActive={false}
            volume={0}
            onClick={() => navigate("/vocal-dna-test")}
            state="idle"
            size="hero"
          />

          <h1 className="font-display text-3xl text-foreground leading-tight -mt-2">
            Tu voz deja una huella
          </h1>
          <p className="text-base text-muted-foreground">
            Cantá una sola vez y descubrí qué hace única a tu voz.
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
  const progress = progressData;
  const streak = progress?.streak_days ?? 0;
  const xp = progress?.xp ?? 0;
  const name = profileData?.display_name ?? user.email?.split("@")[0] ?? "artista";
  const tension = getTension(progress, challengeData, fingerprintData);

  const hasFingerprint = !!fingerprintData?.dimensions;
  const radarValues = hasFingerprint
    ? (() => {
        const d = fingerprintData!.dimensions as any;
        return [d.pitch ?? 0, d.rhythm ?? 0, d.vibrato ?? 0, d.sustain ?? 0, d.control ?? 0, d.range ?? 0];
      })()
    : [0, 0, 0, 0, 0, 0];

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 max-w-md mx-auto space-y-6">
      {/* Saludo + Tensión */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-2">
        <p className="text-base text-muted-foreground">
          {getGreeting()}, <span className="text-foreground font-medium">{name}</span>
        </p>
        <p className="font-display text-lg text-foreground leading-snug">{tension}</p>
      </motion.div>

      {/* CTA: Microphone section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <VintageMicrophone
          isActive={false}
          volume={0}
          onClick={() => navigate("/karaoke")}
          state="idle"
          size="mini"
        />
      </motion.div>

      {/* Dos cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate("/fingerprint")} className="glass-card p-4 text-left space-y-3 hover:border-primary/30 transition-all">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Mi Vocal DNA</p>
          {hasFingerprint ? (
            <div className="flex justify-center"><VocalRadar values={radarValues} size="mini" /></div>
          ) : (
            <p className="text-sm text-primary">Descubrí tu huella</p>
          )}
        </button>
        <button onClick={() => navigate("/skill-tree")} className="glass-card p-4 text-left space-y-3 hover:border-primary/30 transition-all">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Soy Leyenda</p>
          <PhaseProgress xp={xp} compact />
        </button>
      </motion.div>

      {/* Streak */}
      {streak > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="flex items-center justify-center gap-2">
          <StreakFlame days={streak} />
          <span className="text-sm text-muted-foreground">{streak} noches encendiendo tu voz</span>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
