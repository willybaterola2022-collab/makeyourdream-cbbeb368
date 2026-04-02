import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Disc3, Mic, Play, Share2, CheckCircle2, Search } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

interface Track {
  id: string;
  title: string;
  artist: string;
  difficulty: string | null;
  genre: string | null;
}

const SECTIONS = ["Intro", "Verso 1", "Coro", "Verso 2", "Bridge", "Coro Final"];

const diffColor: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  hard: "bg-red-500/10 text-red-400",
};
const diffLabel: Record<string, string> = { easy: "Fácil", medium: "Media", hard: "Difícil" };

const CoverStudio = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<"select" | "practice" | "record" | "review">("select");
  const [song, setSong] = useState<Track | null>(null);
  const [section, setSection] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "cover-studio" }); }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const body: Record<string, any> = search.trim()
        ? { action: "search", query: search.trim(), limit: 30 }
        : { action: "list", limit: 30 };
      const { data } = await supabase.functions.invoke("karaoke-tracks", { body });
      setTracks(data?.tracks || []);
      setLoading(false);
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  const selectSong = (t: Track) => {
    setSong(t);
    setPhase("practice");
    supabase.functions.invoke("karaoke-tracks", { body: { action: "log_play", track_id: t.id, user_id: user?.id } }).catch(() => {});
  };

  const finishRecording = async () => {
    setPhase("review");
    if (!user?.id || !song) return;
    try {
      const { data } = await supabase.functions.invoke("save-training-session", {
        body: { user_id: user.id, module: "cover-studio", scores: { pitch: 72, timing: 68, expression: 75 }, song_title: song.title },
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar canción o artista..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>

            {/* Loading */}
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}

            {/* Empty */}
            {!loading && tracks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🎵</p>
                <p className="text-sm text-muted-foreground">No se encontraron canciones</p>
              </div>
            )}

            {/* Track list */}
            {!loading && tracks.map(t => (
              <button key={t.id} onClick={() => selectSong(t)}
                className="glass-card p-4 rounded-xl w-full text-left flex items-center gap-3 hover:bg-primary/5 transition-colors active:scale-[0.98]">
                <Disc3 className="w-8 h-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.artist}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${diffColor[t.difficulty || "medium"]}`}>
                  {diffLabel[t.difficulty || "medium"]}
                </span>
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
