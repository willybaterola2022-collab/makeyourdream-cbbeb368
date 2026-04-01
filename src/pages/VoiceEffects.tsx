import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sliders, Mic, MicOff, Volume2 } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

const EFFECTS = [
  { id: "clean", label: "Clean", emoji: "🎙️" },
  { id: "reverb", label: "Reverb", emoji: "🏛️" },
  { id: "delay", label: "Delay", emoji: "🔄" },
  { id: "pitchUp", label: "Pitch +2", emoji: "⬆️" },
  { id: "pitchDown", label: "Pitch -2", emoji: "⬇️" },
];

const VoiceEffects = () => {
  const { user } = useAuth();
  const [activeEffect, setActiveEffect] = useState("clean");
  const [isActive, setIsActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "voice-effects" }); }, []);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const gain = ctx.createGain();
      gain.gain.value = 0.8;

      if (activeEffect === "reverb") {
        const convolver = ctx.createConvolver();
        const rate = ctx.sampleRate;
        const length = rate * 2;
        const buffer = ctx.createBuffer(2, length, rate);
        for (let ch = 0; ch < 2; ch++) {
          const data = buffer.getChannelData(ch);
          for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
        convolver.buffer = buffer;
        source.connect(convolver).connect(gain).connect(ctx.destination);
      } else if (activeEffect === "delay") {
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.3;
        const feedback = ctx.createGain();
        feedback.gain.value = 0.4;
        source.connect(gain).connect(ctx.destination);
        source.connect(delay).connect(feedback).connect(delay);
        delay.connect(ctx.destination);
      } else {
        source.connect(gain).connect(ctx.destination);
      }
      setIsActive(true);
    } catch { /* mic denied */ }
  };

  const stopAudio = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    setIsActive(false);
  };

  useEffect(() => () => { stopAudio(); }, []);

  return (
    <StudioRoom roomId="vocalfx" heroContent={<div className="text-center"><Sliders className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Voice Effects</h1><p className="text-sm text-muted-foreground">Transforma tu voz en tiempo real</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <div className="grid grid-cols-5 gap-2">
          {EFFECTS.map(e => (
            <button key={e.id} onClick={() => { setActiveEffect(e.id); if (isActive) { stopAudio(); } }}
              className={`p-3 rounded-xl text-center transition-all ${e.id === activeEffect ? "bg-primary/20 ring-2 ring-primary" : "glass-card"}`}>
              <span className="text-2xl block">{e.emoji}</span>
              <p className="text-[10px] mt-1">{e.label}</p>
            </button>
          ))}
        </div>

        <div className="glass-card p-8 rounded-2xl text-center space-y-4">
          <p className="text-sm text-muted-foreground">Efecto activo: <span className="text-primary font-bold">{EFFECTS.find(e => e.id === activeEffect)?.label}</span></p>
          {isActive && <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center"><Volume2 className="w-8 h-8 text-primary" /></motion.div>}
        </div>

        <StageButton onClick={isActive ? stopAudio : startAudio} variant={isActive ? "danger" : "primary"}>
          {isActive ? <><MicOff className="w-5 h-5 mr-2" /> Detener</> : <><Mic className="w-5 h-5 mr-2" /> Activar efecto</>}
        </StageButton>
      </div>
    </StudioRoom>
  );
};

export default VoiceEffects;
