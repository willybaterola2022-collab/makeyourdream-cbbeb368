import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, RotateCcw, Play, Pause, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useRecorder } from "@/hooks/useRecorder";
import { useMicrophone } from "@/hooks/useMicrophone";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const MOODS = [
  { id: "sunset", label: "Atardecer", icon: "🌅", gradient: "from-primary/20 to-primary/5" },
  { id: "night", label: "Nocturno", icon: "🌙", gradient: "from-accent/20 to-accent/5" },
  { id: "ocean", label: "Oceano", icon: "🌊", gradient: "from-primary/10 to-accent/10" },
  { id: "fire", label: "Fuego", icon: "🔥", gradient: "from-destructive/20 to-primary/10" },
  { id: "dream", label: "Sueño", icon: "✨", gradient: "from-primary/15 to-muted/20" },
  { id: "power", label: "Poder", icon: "⚡", gradient: "from-accent/15 to-destructive/10" },
];

const RECORD_SECONDS = 15;

const VocalStory = () => {
  const { user } = useAuth();
  const { volume, requestMic, stopMic } = useMicrophone(2048);
  const { isRecording, audioBlob, audioUrl, startRecording, stopRecording, clearRecording } = useRecorder();
  const [phase, setPhase] = useState<"mood" | "record" | "preview">("mood");
  const [mood, setMood] = useState(MOODS[0]);
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const [publishing, setPublishing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "vocal-story" }); }, []);

  // Auto-stop at 15s
  useEffect(() => {
    if (phase !== "record" || !isRecording) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleStopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, isRecording]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      requestMic();
      startRecording(stream);
      setTimeLeft(RECORD_SECONDS);
      setPhase("record");
    } catch {
      toast.error("No se pudo acceder al micrófono");
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    stopMic();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setPhase("preview");
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetStory = () => {
    clearRecording();
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
    setPhase("mood");
    setTimeLeft(RECORD_SECONDS);
  };

  const publishStory = async () => {
    if (!user) return;
    setPublishing(true);
    try {
      // Upload audio if available
      let recordingUrl = "";
      if (audioBlob) {
        const filePath = `stories/${user.id}/${Date.now()}.webm`;
        const { error: uploadErr } = await supabase.storage
          .from("recordings")
          .upload(filePath, audioBlob, { contentType: "audio/webm" });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage.from("recordings").getPublicUrl(filePath);
          recordingUrl = urlData.publicUrl;
        }
      }

      await supabase.functions.invoke("social-feed", {
        body: {
          action: "publish",
          user_id: user.id,
          caption: `Vocal Story — ${mood.label}`,
          song_title: `Story: ${mood.label}`,
          score: 0,
        },
      });

      await supabase.functions.invoke("save-training-session", {
        body: {
          user_id: user.id,
          module: "vocal-story",
          song_title: `Story: ${mood.label}`,
          scores: { pitch: 50, timing: 50, expression: 70 },
        },
      });

      toast.success("+15 XP — Story publicada");
      resetStory();
    } catch {
      toast.error("Error al publicar");
    }
    setPublishing(false);
  };

  const pct = ((RECORD_SECONDS - timeLeft) / RECORD_SECONDS) * 100;

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1">
        <h1 className="font-serif text-2xl text-foreground">Vocal Story</h1>
        <p className="text-sm text-muted-foreground">15 segundos de pura voz</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* MOOD PICKER */}
        {phase === "mood" && (
          <motion.div key="mood" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Elige tu mood</p>
            <div className="grid grid-cols-3 gap-3">
              {MOODS.map(m => (
                <motion.button
                  key={m.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMood(m)}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${m.gradient} text-center border transition-all duration-200 ${
                    m.id === mood.id ? "border-primary/40 shadow-[0_0_20px_-6px_hsl(var(--primary)/0.3)]" : "border-border/20"
                  }`}
                >
                  <span className="text-2xl block mb-1">{m.icon}</span>
                  <p className="text-xs font-medium text-foreground">{m.label}</p>
                </motion.button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStartRecording}
              className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 transition-transform duration-200 shadow-[0_0_30px_-8px_hsl(var(--primary)/0.4)]"
            >
              <Mic className="h-5 w-5" /> Grabar story
            </motion.button>
          </motion.div>
        )}

        {/* RECORDING */}
        {phase === "record" && (
          <motion.div key="record" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
            <div className={`p-8 rounded-2xl bg-gradient-to-br ${mood.gradient} border border-border/20 text-center`}>
              <span className="text-3xl block mb-3">{mood.icon}</span>
              <p className="text-xs text-muted-foreground mb-4">{mood.label}</p>

              {/* Circular timer */}
              <div className="relative w-32 h-32 mx-auto">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <circle
                    cx="50" cy="50" r="44" fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={276.46}
                    strokeDashoffset={276.46 * (1 - pct / 100)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-3xl text-foreground">{timeLeft}</span>
              </div>

              {/* Volume ring */}
              <motion.div
                animate={{ scale: [1, 1 + volume * 0.2, 1] }}
                transition={{ duration: 0.15, repeat: Infinity }}
                className="w-16 h-16 mx-auto mt-4 rounded-full bg-destructive/20 border-2 border-destructive/30 flex items-center justify-center"
              >
                <Mic className="h-6 w-6 text-destructive" />
              </motion.div>
            </div>

            {timeLeft < RECORD_SECONDS - 3 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStopRecording}
                className="w-full h-12 rounded-xl glass-card text-foreground font-medium transition-transform duration-200"
              >
                Terminar
              </motion.button>
            )}
          </motion.div>
        )}

        {/* PREVIEW */}
        {phase === "preview" && (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-5">
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${mood.gradient} border border-border/20 text-center`}>
              <span className="text-3xl block mb-2">{mood.icon}</span>
              <p className="font-serif text-xl text-foreground">Tu Vocal Story</p>
              <p className="text-sm text-muted-foreground mt-1">{mood.label} · 15s</p>

              {/* Playback button */}
              {audioUrl && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlayback}
                  className="mt-4 w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto transition-transform duration-200"
                >
                  {isPlaying ? <Pause className="h-6 w-6 text-primary" /> : <Play className="h-6 w-6 text-primary ml-0.5" />}
                </motion.button>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={resetStory}
                className="flex-1 h-12 rounded-xl glass-card text-foreground font-medium flex items-center justify-center gap-2 transition-transform duration-200"
              >
                <RotateCcw className="h-4 w-4" /> Otra vez
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={publishStory}
                disabled={publishing}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50 transition-transform duration-200"
              >
                {publishing ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {publishing ? "Publicando..." : "Publicar"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VocalStory;
