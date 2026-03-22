import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, LogOut, ChevronRight, Play, Pause } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { VocalRadar } from "@/components/VocalRadar";
import { PhaseProgress } from "@/components/PhaseProgress";
import { StreakFlame } from "@/components/StreakFlame";
import { trackEvent } from "@/lib/trackEvent";

interface Recording {
  id: string;
  title: string | null;
  created_at: string;
  module: string;
  file_url: string;
  metadata: any;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [progress, setProgress] = useState<{ xp: number; streak_days: number } | null>(null);
  const [profile, setProfile] = useState<{ display_name: string | null; vocal_level: string | null } | null>(null);
  const [radarValues, setRadarValues] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [hasFingerprint, setHasFingerprint] = useState(false);
  const [classification, setClassification] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;
    trackEvent(user.id, "module_visited", { module: "profile" });

    Promise.all([
      supabase.from("recordings").select("id, title, created_at, module, file_url, metadata").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("user_progress").select("xp, streak_days").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("display_name, vocal_level").eq("user_id", user.id).maybeSingle(),
      supabase.from("vocal_fingerprints").select("dimensions, classification").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]).then(([recRes, progRes, profRes, fpRes]) => {
      setRecordings(recRes.data ?? []);
      setProgress(progRes.data);
      setProfile(profRes.data);
      if (fpRes.data?.dimensions) {
        setHasFingerprint(true);
        const d = fpRes.data.dimensions as any;
        setRadarValues([d.pitch ?? 0, d.rhythm ?? 0, d.vibrato ?? 0, d.sustain ?? 0, d.control ?? 0, d.range ?? 0]);
        setClassification(fpRes.data.classification);
      }
    });
  }, [user]);

  const togglePlay = (rec: Recording) => {
    if (playingId === rec.id) {
      audioEl?.pause();
      setPlayingId(null);
      return;
    }
    audioEl?.pause();
    const audio = new Audio(rec.file_url);
    audio.onended = () => setPlayingId(null);
    audio.play();
    setAudioEl(audio);
    setPlayingId(rec.id);
  };

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Iniciá sesión para ver tu perfil</p>
        <button onClick={() => navigate("/login")} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display">
          Iniciar sesión
        </button>
      </div>
    );
  }

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Artista";
  const xp = progress?.xp ?? 0;
  const streak = progress?.streak_days ?? 0;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <Avatar className="h-20 w-20 mx-auto">
          <AvatarFallback className="bg-primary/20 text-primary text-2xl font-display font-bold">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="font-display text-2xl text-foreground">{displayName}</h1>
        {classification && <p className="text-sm text-primary">{classification}</p>}
        {streak > 0 && (
          <div className="flex items-center justify-center gap-2">
            <StreakFlame days={streak} />
            <span className="text-sm text-muted-foreground">{streak} días</span>
          </div>
        )}
      </motion.div>

      {/* Phase Progress */}
      <PhaseProgress xp={xp} />

      {/* Vocal DNA section */}
      <button onClick={() => navigate("/fingerprint")} className="glass-card p-5 w-full text-left space-y-3 hover:border-primary/30 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Mi Vocal DNA</p>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
        {hasFingerprint ? (
          <div className="flex justify-center">
            <VocalRadar values={radarValues} size="mini" />
          </div>
        ) : (
          <p className="text-sm text-primary">Descubrí tu huella vocal →</p>
        )}
      </button>

      {/* Recordings */}
      <div>
        <h3 className="font-display text-lg text-foreground mb-3">Grabaciones</h3>
        {recordings.length > 0 ? (
          <div className="space-y-2">
            {recordings.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-3 flex items-center gap-3"
              >
                <button onClick={() => togglePlay(r)} className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {playingId === r.id
                    ? <Pause className="h-3.5 w-3.5 text-primary" />
                    : <Play className="h-3.5 w-3.5 text-primary ml-0.5" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.title || r.module}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("es", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">Tu primera canción te espera</p>
            <button onClick={() => navigate("/karaoke")} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-display">
              <Mic className="h-4 w-4 inline mr-2" />Cantar ahora
            </button>
          </div>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={async () => { await signOut(); navigate("/"); }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-muted-foreground hover:text-destructive transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
};

export default Profile;
