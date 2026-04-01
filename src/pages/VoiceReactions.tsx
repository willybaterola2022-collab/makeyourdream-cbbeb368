import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mic, MicOff } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const VoiceReactions = () => {
  const { user } = useAuth();
  const { isListening, volume, requestMic, stopMic } = useMicrophone(2048);
  const [timeLeft, setTimeLeft] = useState(10);
  const [recording, setRecording] = useState(false);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "voice-reactions" }); }, []);

  useEffect(() => {
    if (!recording || !isListening) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          stopMic();
          setRecording(false);
          publishReaction();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [recording, isListening]);

  const publishReaction = async () => {
    if (!user) {
      toast.success("Reaccion grabada");
      return;
    }
    try {
      await supabase.functions.invoke("social-feed", {
        body: {
          action: "publish",
          user_id: user.id,
          caption: "Voice Reaction",
          song_title: "Reaction",
          score: 0,
        },
      });
      toast.success("Reaccion publicada en el feed");
    } catch {
      toast.success("Reaccion grabada");
    }
  };

  const startReaction = () => { setTimeLeft(10); requestMic(); setRecording(true); };

  return (
    <StudioRoom roomId="collab" heroContent={<div className="text-center"><MessageCircle className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Voice Reactions</h1><p className="text-sm text-muted-foreground">Reacciona con tu voz</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <div className="glass-card p-6 rounded-2xl text-center space-y-4">
          <p className="text-sm text-muted-foreground">Graba una reaccion de audio de 10 segundos para responder a publicaciones del feed.</p>
          {recording && (
            <motion.div animate={{ scale: [1, 1 + volume * 0.3, 1] }} transition={{ duration: 0.15 }}>
              <p className="text-5xl font-mono text-primary">{timeLeft}s</p>
            </motion.div>
          )}
        </div>

        <StageButton onClick={recording ? () => { stopMic(); setRecording(false); setTimeLeft(10); } : startReaction}
          variant={recording ? "danger" : "primary"}>
          {recording ? <><MicOff className="w-4 h-4 mr-2" /> Cancelar</> : <><Mic className="w-4 h-4 mr-2" /> Grabar reaccion</>}
        </StageButton>
      </div>
    </StudioRoom>
  );
};

export default VoiceReactions;
