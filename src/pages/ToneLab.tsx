import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Palette } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

const EMOTIONS = [
  { id: "happy", label: "Alegre", emoji: "😄", color: "bg-amber-500/20 text-amber-400" },
  { id: "sad", label: "Triste", emoji: "😢", color: "bg-blue-500/20 text-blue-400" },
  { id: "whisper", label: "Susurro", emoji: "🤫", color: "bg-purple-500/20 text-purple-400" },
  { id: "power", label: "Power", emoji: "💪", color: "bg-red-500/20 text-red-400" },
];

const PHRASE = "No importa lo que digan, yo sigo cantando";

const ToneLab = () => {
  const { user } = useAuth();
  const { isListening, volume, requestMic, stopMic } = useMicrophone(2048);
  const [currentEmotion, setCurrentEmotion] = useState(0);
  const [recordings, setRecordings] = useState<string[]>([]);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "tone-lab" }); }, []);

  const recordEmotion = () => {
    if (isListening) {
      stopMic();
      setRecordings(prev => [...prev, EMOTIONS[currentEmotion].id]);
      if (currentEmotion < EMOTIONS.length - 1) setCurrentEmotion(currentEmotion + 1);
    } else {
      requestMic();
    }
  };

  const emotion = EMOTIONS[currentEmotion];

  return (
    <StudioRoom roomId="emotion" heroContent={<div className="text-center"><Palette className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Tone Lab</h1><p className="text-sm text-muted-foreground">Explora los colores de tu voz</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <div className="glass-card p-6 rounded-2xl text-center space-y-4">
          <p className="text-sm text-muted-foreground">Canta esta frase con emoción:</p>
          <p className="text-lg font-display italic">"{PHRASE}"</p>
        </div>

        <div className="flex gap-2 justify-center">
          {EMOTIONS.map((e, i) => (
            <div key={e.id} className={`px-3 py-2 rounded-xl text-center ${i === currentEmotion ? e.color + " ring-2 ring-primary" : "opacity-40"} ${recordings.includes(e.id) ? "opacity-100" : ""}`}>
              <span className="text-2xl">{e.emoji}</span>
              <p className="text-[10px] mt-1">{e.label}</p>
            </div>
          ))}
        </div>

        <motion.div className="text-center space-y-4">
          <p className="text-sm">Ahora cántala con tono: <span className="text-primary font-bold">{emotion.label}</span> {emotion.emoji}</p>
          <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
            <motion.div className="h-full bg-primary/60 rounded-full" animate={{ width: `${Math.min(volume * 100, 100)}%` }} transition={{ duration: 0.1 }} />
          </div>
          <StageButton onClick={recordEmotion} variant={isListening ? "danger" : "primary"}>
            {isListening ? <><MicOff className="w-4 h-4 mr-2" /> Detener</> : <><Mic className="w-4 h-4 mr-2" /> Grabar {emotion.label}</>}
          </StageButton>
        </motion.div>

        {recordings.length === EMOTIONS.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl text-center">
            <p className="text-primary font-display">¡4 colores vocales capturados! 🎨</p>
          </motion.div>
        )}
      </div>
    </StudioRoom>
  );
};

export default ToneLab;
