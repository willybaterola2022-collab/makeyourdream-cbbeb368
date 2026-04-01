import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Waves, Mic, MicOff } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

const VibratoCoach = () => {
  const { user } = useAuth();
  const { isListening, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const [pitchHistory, setPitchHistory] = useState<number[]>([]);
  const [vibratoRate, setVibratoRate] = useState<number | null>(null);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "vibrato-coach" }); }, []);

  useEffect(() => {
    if (!pitch?.frequency || !isListening) return;
    setPitchHistory(prev => {
      const next = [...prev, pitch.frequency].slice(-60);
      if (next.length >= 20) {
        let crossings = 0;
        const mean = next.reduce((a, b) => a + b, 0) / next.length;
        for (let i = 1; i < next.length; i++) {
          if ((next[i - 1] < mean && next[i] >= mean) || (next[i - 1] >= mean && next[i] < mean)) crossings++;
        }
        setVibratoRate(Math.round(crossings / 2 * (1000 / 50)));
      }
      return next;
    });
  }, [pitch?.frequency, isListening]);

  const maxPitch = pitchHistory.length > 0 ? Math.max(...pitchHistory) : 500;
  const minPitch = pitchHistory.length > 0 ? Math.min(...pitchHistory) : 100;
  const range = maxPitch - minPitch || 1;

  return (
    <StudioRoom roomId="exercises" heroContent={<div className="text-center"><Waves className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Vibrato Coach</h1><p className="text-sm text-muted-foreground">Mantén un vibrato estable</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-end gap-0.5 h-32">
            {pitchHistory.map((p, i) => (
              <motion.div key={i} className="flex-1 bg-primary/60 rounded-t-sm min-w-[2px]"
                style={{ height: `${((p - minPitch) / range) * 100}%` }} />
            ))}
            {pitchHistory.length === 0 && <div className="w-full text-center text-muted-foreground text-sm py-12">Empieza a cantar para ver la onda</div>}
          </div>
        </div>

        {vibratoRate !== null && isListening && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 rounded-2xl text-center space-y-2">
            <p className="text-4xl font-display text-primary">~{vibratoRate} Hz</p>
            <p className="text-sm text-muted-foreground">frecuencia de vibrato</p>
            <p className="text-xs text-muted-foreground">{vibratoRate >= 4 && vibratoRate <= 7 ? "✅ Rango ideal (4-7 Hz)" : "⚠ Objetivo: 4-7 Hz"}</p>
          </motion.div>
        )}

        <StageButton onClick={isListening ? () => { stopMic(); setPitchHistory([]); setVibratoRate(null); } : requestMic}
          variant={isListening ? "danger" : "primary"}>
          {isListening ? <><MicOff className="w-4 h-4 mr-2" /> Parar</> : <><Mic className="w-4 h-4 mr-2" /> Empezar</>}
        </StageButton>
      </div>
    </StudioRoom>
  );
};

export default VibratoCoach;
