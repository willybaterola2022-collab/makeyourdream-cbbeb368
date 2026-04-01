import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Mic, MicOff, Send } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const MOODS = [
  { id: "sunset", label: "Atardecer", gradient: "from-orange-500/20 to-pink-500/20" },
  { id: "night", label: "Nocturno", gradient: "from-indigo-500/20 to-purple-500/20" },
  { id: "ocean", label: "Oceano", gradient: "from-cyan-500/20 to-blue-500/20" },
  { id: "fire", label: "Fuego", gradient: "from-red-500/20 to-amber-500/20" },
];

const VocalStory = () => {
  const { user } = useAuth();
  const { isListening, volume, requestMic, stopMic } = useMicrophone(2048);
  const [phase, setPhase] = useState<"mood" | "record" | "preview">("mood");
  const [mood, setMood] = useState(MOODS[0]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "vocal-story" }); }, []);

  useEffect(() => {
    if (phase !== "record" || !isListening) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); stopMic(); setPhase("preview"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, isListening]);

  const startRecording = () => { setTimeLeft(30); requestMic(); setPhase("record"); };

  const publishStory = async () => {
    if (!user) return;
    setPublishing(true);
    try {
      await supabase.functions.invoke("social-feed", {
        body: {
          action: "publish",
          user_id: user.id,
          caption: `Vocal Story — ${mood.label}`,
          song_title: `Story: ${mood.label}`,
          score: 0,
        },
      });
      toast.success("Story publicada en el feed");
      setPhase("mood");
      setTimeLeft(30);
    } catch {
      toast.error("Error al publicar");
    }
    setPublishing(false);
  };

  return (
    <StudioRoom roomId="emotion" heroContent={<div className="text-center"><Camera className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Vocal Story</h1><p className="text-sm text-muted-foreground">30 segundos de audio con mood visual</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        {phase === "mood" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="text-lg font-display text-center">Elige un mood</h2>
            <div className="grid grid-cols-2 gap-3">
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setMood(m)}
                  className={`p-6 rounded-2xl bg-gradient-to-br ${m.gradient} text-center ${m.id === mood.id ? "ring-2 ring-primary" : ""}`}>
                  <p className="font-display">{m.label}</p>
                </button>
              ))}
            </div>
            <StageButton onClick={startRecording}>Grabar story</StageButton>
          </motion.div>
        )}

        {phase === "record" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-8 rounded-2xl bg-gradient-to-br ${mood.gradient} text-center space-y-4`}>
            <p className="text-5xl font-mono text-primary">{timeLeft}s</p>
            <motion.div animate={{ scale: [1, 1 + volume * 0.3, 1] }} transition={{ duration: 0.15 }}
              className="w-16 h-16 mx-auto rounded-full bg-destructive/30 flex items-center justify-center">
              <Mic className="w-8 h-8 text-destructive" />
            </motion.div>
            <p className="text-sm text-muted-foreground">{mood.label}</p>
          </motion.div>
        )}

        {phase === "preview" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
            <div className={`p-8 rounded-2xl bg-gradient-to-br ${mood.gradient}`}>
              <p className="text-lg font-display">Tu Vocal Story</p>
              <p className="text-sm text-muted-foreground mt-2">{mood.label} · 30s</p>
            </div>
            <div className="flex gap-3 justify-center">
              <StageButton variant="glass" onClick={() => { setPhase("mood"); setTimeLeft(30); }}>Otra vez</StageButton>
              <StageButton onClick={publishStory} disabled={publishing}>
                <Send className="w-4 h-4 mr-2" /> {publishing ? "Publicando..." : "Publicar"}
              </StageButton>
            </div>
          </motion.div>
        )}
      </div>
    </StudioRoom>
  );
};

export default VocalStory;
