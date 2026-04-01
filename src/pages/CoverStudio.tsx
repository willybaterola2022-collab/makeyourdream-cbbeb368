import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Disc3, Mic, Play, Share2, CheckCircle2 } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const SONGS = [
  { title: "Bohemian Rhapsody", artist: "Queen", difficulty: "Difícil" },
  { title: "Someone Like You", artist: "Adele", difficulty: "Media" },
  { title: "Imagine", artist: "John Lennon", difficulty: "Fácil" },
  { title: "Despacito", artist: "Luis Fonsi", difficulty: "Media" },
  { title: "Hallelujah", artist: "Leonard Cohen", difficulty: "Media" },
  { title: "Shallow", artist: "Lady Gaga", difficulty: "Difícil" },
];

const SECTIONS = ["Intro", "Verso 1", "Coro", "Verso 2", "Bridge", "Coro Final"];

const CoverStudio = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<"select" | "practice" | "record" | "review">("select");
  const [song, setSong] = useState<typeof SONGS[0] | null>(null);
  const [section, setSection] = useState(0);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "cover-studio" }); }, []);

  const finishRecording = async () => {
    setPhase("review");
    if (!user?.id) return;
    try {
      const { data } = await supabase.functions.invoke("save-training-session", {
        body: { user_id: user.id, module: "cover-studio", scores: { pitch: 72, timing: 68, expression: 75 }, song_title: song?.title },
      });
      if (data?.grade) toast.success(`${data.grade} — +${data.xp_earned} XP`);
    } catch {}
  };

  return (
    <StudioRoom roomId="karaoke" heroContent={<div className="text-center"><Disc3 className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Cover Studio</h1><p className="text-sm text-muted-foreground">Graba tu versión definitiva</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        {phase === "select" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-lg font-display text-center">Elige una canción</h2>
            {SONGS.map(s => (
              <button key={s.title} onClick={() => { setSong(s); setPhase("practice"); }}
                className="glass-card p-4 rounded-xl w-full text-left flex items-center gap-3 hover:bg-primary/5 transition-colors">
                <Disc3 className="w-8 h-8 text-primary shrink-0" />
                <div className="flex-1"><p className="font-medium text-sm">{s.title}</p><p className="text-xs text-muted-foreground">{s.artist}</p></div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s.difficulty}</span>
              </button>
            ))}
          </motion.div>
        )}

        {phase === "practice" && song && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <h2 className="text-lg font-display">{song.title}</h2>
            <p className="text-sm text-muted-foreground">Practica por secciones</p>
            <div className="space-y-2">
              {SECTIONS.map((sec, i) => (
                <div key={sec} className={`glass-card p-3 rounded-xl flex items-center gap-3 ${i <= section ? "opacity-100" : "opacity-40"}`}>
                  <Play className="w-4 h-4 text-primary" />
                  <span className="text-sm flex-1">{sec}</span>
                  {i < section && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <StageButton variant="glass" onClick={() => setSection(Math.min(section + 1, 5))}>Siguiente sección</StageButton>
              <StageButton onClick={() => setPhase("record")}>Grabar versión final</StageButton>
            </div>
          </motion.div>
        )}

        {phase === "record" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
              <Mic className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-lg font-display">Grabando tu cover</h2>
            <p className="text-sm text-muted-foreground">{song?.title} — {song?.artist}</p>
            <StageButton onClick={finishRecording}>Terminar grabación</StageButton>
          </motion.div>
        )}

        {phase === "review" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
            <CheckCircle2 className="w-16 h-16 mx-auto text-primary" />
            <h2 className="text-xl font-display">¡Cover completado!</h2>
            <div className="flex gap-3 justify-center">
              <StageButton variant="glass" onClick={() => { setPhase("select"); setSong(null); setSection(0); }}>Otra canción</StageButton>
              <StageButton><Share2 className="w-4 h-4 mr-2" /> Publicar</StageButton>
            </div>
          </motion.div>
        )}
      </div>
    </StudioRoom>
  );
};

export default CoverStudio;
