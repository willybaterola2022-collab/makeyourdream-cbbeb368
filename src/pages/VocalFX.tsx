import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, Save } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useMicrophone } from "@/hooks/useMicrophone";
import { toast } from "sonner";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroPedals } from "@/components/studio/HeroPedals";
import { StageButton } from "@/components/ui/StageButton";

interface FXParam { id: string; label: string; emoji: string; value: number; active: boolean; }

const PRESETS = [
  { id: "cathedral", label: "Catedral", emoji: "⛪" },
  { id: "stadium", label: "Estadio", emoji: "🏟️" },
  { id: "radio", label: "Radio", emoji: "📻" },
  { id: "robot", label: "Vocoder", emoji: "🤖" },
  { id: "studio", label: "Estudio", emoji: "🎚️" },
];

export default function VocalFX() {
  const { isListening, waveformData, requestMic, stopMic, stream, analyserNode } = useMicrophone(2048);
  const [activePreset, setActivePreset] = useState("studio");
  const [effects, setEffects] = useState<FXParam[]>([
    { id: "reverb", label: "Reverb", emoji: "🌊", value: 45, active: true },
    { id: "delay", label: "Delay", emoji: "🔁", value: 20, active: false },
    { id: "eq-low", label: "EQ Graves", emoji: "📢", value: 50, active: true },
    { id: "eq-high", label: "EQ Agudos", emoji: "✨", value: 50, active: true },
    { id: "distortion", label: "Distorsión", emoji: "⚡", value: 10, active: false },
    { id: "compression", label: "Compresión", emoji: "📦", value: 60, active: true },
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nodesRef = useRef<{
    delay?: DelayNode;
    delayGain?: GainNode;
    eqLow?: BiquadFilterNode;
    eqHigh?: BiquadFilterNode;
    distortion?: WaveShaperNode;
    compressor?: DynamicsCompressorNode;
    masterGain?: GainNode;
  }>({});

  // Build audio processing chain when mic is active
  const buildAudioChain = useCallback(() => {
    if (!stream) return;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    sourceRef.current = source;

    // Create nodes
    const delayNode = ctx.createDelay(1.0);
    delayNode.delayTime.value = 0.3;
    const delayGain = ctx.createGain();
    delayGain.gain.value = 0;

    const eqLow = ctx.createBiquadFilter();
    eqLow.type = "lowshelf";
    eqLow.frequency.value = 300;
    eqLow.gain.value = 0;

    const eqHigh = ctx.createBiquadFilter();
    eqHigh.type = "highshelf";
    eqHigh.frequency.value = 3000;
    eqHigh.gain.value = 0;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.ratio.value = 4;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;

    // Chain: source → eqLow → eqHigh → compressor → masterGain → destination
    source.connect(eqLow);
    eqLow.connect(eqHigh);
    eqHigh.connect(compressor);
    compressor.connect(masterGain);

    // Delay as parallel send
    source.connect(delayNode);
    delayNode.connect(delayGain);
    delayGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    nodesRef.current = { delay: delayNode, delayGain, eqLow, eqHigh, compressor, masterGain };
  }, [stream]);

  // Update FX params in real-time
  useEffect(() => {
    const nodes = nodesRef.current;
    if (!audioCtxRef.current) return;

    const getVal = (id: string) => effects.find(e => e.id === id);

    const delay = getVal("delay");
    if (nodes.delayGain && delay) {
      nodes.delayGain.gain.value = delay.active ? delay.value / 100 * 0.6 : 0;
    }
    if (nodes.delay && delay?.active) {
      nodes.delay.delayTime.value = 0.1 + (delay.value / 100) * 0.5;
    }

    const eqLow = getVal("eq-low");
    if (nodes.eqLow && eqLow) {
      nodes.eqLow.gain.value = eqLow.active ? (eqLow.value - 50) * 0.4 : 0;
    }

    const eqHigh = getVal("eq-high");
    if (nodes.eqHigh && eqHigh) {
      nodes.eqHigh.gain.value = eqHigh.active ? (eqHigh.value - 50) * 0.4 : 0;
    }

    const comp = getVal("compression");
    if (nodes.compressor && comp) {
      nodes.compressor.ratio.value = comp.active ? 2 + (comp.value / 100) * 10 : 1;
    }
  }, [effects]);

  useEffect(() => {
    if (isListening && stream) {
      buildAudioChain();
    }
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [isListening, stream, buildAudioChain]);

  const updateEffect = (id: string, updates: Partial<FXParam>) => {
    setEffects((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const handleToggle = async () => {
    if (isListening) stopMic();
    else await requestMic();
  };

  return (
    <StudioRoom
      roomId="vocalfx"
      heroContent={
        <HeroPedals
          activeEffects={effects.filter(e => e.active).map(e => e.id)}
          onClick={handleToggle}
        />
      }
    >
      {/* Presets */}
      <div className="flex gap-3 justify-center overflow-x-auto pb-1">
        {PRESETS.map((p) => (
          <StageButton
            key={p.id}
            variant="capsule"
            active={activePreset === p.id}
            onClick={() => setActivePreset(p.id)}
          >
            <span className="text-lg">{p.emoji}</span>
            <span className="text-[9px]">{p.label}</span>
          </StageButton>
        ))}
      </div>

      {/* Waveform */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-end gap-[2px] h-12 mb-4">
          {(isListening ? waveformData.slice(0, 64) : Array(64).fill(5)).map((v, i) => (
            <motion.div key={i} className="flex-1 rounded-sm bg-primary"
              animate={{ height: `${Math.max(v, 3)}%`, opacity: isListening ? 0.8 : 0.15 }}
              transition={{ duration: 0.05 }} />
          ))}
        </div>
        <div className="flex justify-center">
          <StageButton
            variant={isListening ? "danger" : "primary"}
            icon={<Mic className="h-6 w-6" />}
            onClick={handleToggle}
          >
            {isListening ? "DETENER" : "ESCUCHAR"}
          </StageButton>
        </div>
      </div>

      {/* FX Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-foreground">Efectos</span>
          <StageButton variant="lever" icon={<Save className="h-3 w-3" />} onClick={() => toast.success("Preset guardado")}>
            Guardar
          </StageButton>
        </div>
        {effects.map((fx) => (
          <div key={fx.id} className={`glass-card p-3 rounded-xl ${!fx.active ? "opacity-40" : ""}`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{fx.emoji}</span>
              <span className="text-sm font-bold text-foreground flex-1">{fx.label}</span>
              <span className="text-xs text-muted-foreground w-8 text-right">{fx.value}%</span>
              <Switch checked={fx.active} onCheckedChange={(checked) => updateEffect(fx.id, { active: checked })} />
            </div>
            {fx.active && (
              <div className="mt-2 pl-8">
                <Slider value={[fx.value]} max={100} step={1} onValueChange={([v]) => updateEffect(fx.id, { value: v })} />
              </div>
            )}
          </div>
        ))}
      </div>
    </StudioRoom>
  );
}
