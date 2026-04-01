import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Music, Mic, MicOff, CheckCircle2 } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

const INTERVALS = [
  { name: "Unísono", semitones: 0, baseFreq: 261.63 },
  { name: "Tercera Mayor", semitones: 4, baseFreq: 261.63 },
  { name: "Quinta Justa", semitones: 7, baseFreq: 261.63 },
  { name: "Octava", semitones: 12, baseFreq: 261.63 },
];

const HarmonyTrainer = () => {
  const { user } = useAuth();
  const { isListening, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "harmony-trainer" }); }, []);

  const playReference = useCallback(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const interval = INTERVALS[current];
    const targetFreq = interval.baseFreq * Math.pow(2, interval.semitones / 12);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = targetFreq;
    gain.gain.value = 0.15;
    osc.start(); setPlaying(true);
    setTimeout(() => { osc.stop(); setPlaying(false); ctx.close(); }, 2000);
  }, [current]);

  useEffect(() => {
    if (!pitch?.frequency || !isListening) return;
    const interval = INTERVALS[current];
    const targetFreq = interval.baseFreq * Math.pow(2, interval.semitones / 12);
    const cents = 1200 * Math.log2(pitch.frequency / targetFreq);
    const acc = Math.max(0, 100 - Math.abs(cents));
    setAccuracy(Math.round(acc));
  }, [pitch?.frequency, current, isListening]);

  return (
    <StudioRoom roomId="pitch" heroContent={<div className="text-center"><Music className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Harmony Trainer</h1><p className="text-sm text-muted-foreground">Aprende intervalos cantando</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <div className="flex gap-2 justify-center flex-wrap">
          {INTERVALS.map((int, i) => (
            <button key={int.name} onClick={() => { setCurrent(i); setAccuracy(null); }}
              className={`px-3 py-2 rounded-xl text-sm ${i === current ? "bg-primary text-primary-foreground" : "glass-card"}`}>
              {int.name}
            </button>
          ))}
        </div>

        <div className="glass-card p-8 rounded-2xl text-center space-y-4">
          <p className="text-sm text-muted-foreground">Intervalo: <span className="text-primary font-bold">{INTERVALS[current].name}</span></p>
          <StageButton variant="glass" onClick={playReference} disabled={playing}>
            {playing ? "🔊 Reproduciendo..." : "▶ Escuchar nota objetivo"}
          </StageButton>
          {accuracy !== null && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <p className={`text-4xl font-display ${accuracy > 80 ? "text-primary" : accuracy > 50 ? "text-amber-400" : "text-destructive"}`}>{accuracy}%</p>
              <p className="text-xs text-muted-foreground">precisión</p>
            </motion.div>
          )}
        </div>

        <StageButton onClick={isListening ? stopMic : requestMic} variant={isListening ? "danger" : "primary"}>
          {isListening ? <><MicOff className="w-4 h-4 mr-2" /> Parar</> : <><Mic className="w-4 h-4 mr-2" /> Cantar</>}
        </StageButton>
      </div>
    </StudioRoom>
  );
};

export default HarmonyTrainer;
