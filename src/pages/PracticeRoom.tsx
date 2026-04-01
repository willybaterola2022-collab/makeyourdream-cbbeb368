import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Timer } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useMetronome } from "@/hooks/useMetronome";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
function freqToNote(freq: number): string {
  if (freq < 20) return "—";
  const n = 12 * Math.log2(freq / 440) + 69;
  const noteIdx = Math.round(n) % 12;
  const octave = Math.floor(Math.round(n) / 12) - 1;
  return `${NOTE_NAMES[noteIdx < 0 ? noteIdx + 12 : noteIdx]}${octave}`;
}

const PracticeRoom = () => {
  const { user } = useAuth();
  const { isListening, volume, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const [bpm, setBpm] = useState(80);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const metronome = useMetronome(bpm);
  const currentNote = pitch?.frequency ? freqToNote(pitch.frequency) : "—";

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "practice-room" }); }, []);

  const toggleMetronome = () => {
    if (metronomeOn) { metronome.stop(); } else { metronome.start(); }
    setMetronomeOn(!metronomeOn);
  };

  return (
    <StudioRoom roomId="exercises" heroContent={<div className="text-center"><h1 className="text-xl font-display">Sala de Práctica</h1><p className="text-sm text-muted-foreground">Sin presión. Solo tú y tu voz.</p></div>}>
      <div className="max-w-lg mx-auto space-y-8 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl text-center space-y-3">
          <p className="text-6xl font-display text-primary tabular-nums">{currentNote}</p>
          <p className="text-xs text-muted-foreground">{pitch?.frequency ? `${Math.round(pitch.frequency)} Hz` : "Esperando señal..."}</p>
          <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
            <motion.div className="h-full bg-primary/60 rounded-full" animate={{ width: `${Math.min(volume * 100, 100)}%` }} transition={{ duration: 0.1 }} />
          </div>
        </motion.div>

        <div className="glass-card p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center gap-2"><Timer className="w-4 h-4" /> Metrónomo</h3>
            <StageButton variant={metronomeOn ? "danger" : "capsule"} onClick={toggleMetronome}>
              {metronomeOn ? "Parar" : "Iniciar"}
            </StageButton>
          </div>
          <input type="range" min={40} max={200} value={bpm} onChange={e => setBpm(+e.target.value)} className="w-full accent-primary" />
          <p className="text-center text-2xl font-mono text-primary">{bpm} BPM</p>
        </div>

        <StageButton onClick={isListening ? stopMic : requestMic} variant={isListening ? "danger" : "primary"}>
          {isListening ? <><MicOff className="w-5 h-5 mr-2" /> Cerrar micrófono</> : <><Mic className="w-5 h-5 mr-2" /> Abrir micrófono</>}
        </StageButton>
      </div>
    </StudioRoom>
  );
};

export default PracticeRoom;
