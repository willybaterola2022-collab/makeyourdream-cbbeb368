import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Save } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useMicrophone } from "@/hooks/useMicrophone";
import { toast } from "sonner";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroPedals } from "@/components/studio/HeroPedals";

interface FXParam { id: string; label: string; emoji: string; value: number; active: boolean; }

const PRESETS = [
  { id: "cathedral", label: "Catedral", emoji: "⛪" },
  { id: "stadium", label: "Estadio", emoji: "🏟️" },
  { id: "radio", label: "Radio", emoji: "📻" },
  { id: "robot", label: "Vocoder", emoji: "🤖" },
  { id: "studio", label: "Estudio", emoji: "🎚️" },
];

export default function VocalFX() {
  const { isListening, waveformData, requestMic, stopMic } = useMicrophone();
  const [activePreset, setActivePreset] = useState("studio");
  const [effects, setEffects] = useState<FXParam[]>([
    { id: "reverb", label: "Reverb", emoji: "🌊", value: 45, active: true },
    { id: "delay", label: "Delay", emoji: "🔁", value: 20, active: false },
    { id: "autotune", label: "Autotune", emoji: "🎯", value: 0, active: false },
    { id: "distortion", label: "Distorsión", emoji: "⚡", value: 10, active: false },
    { id: "chorus", label: "Chorus", emoji: "👥", value: 30, active: true },
    { id: "compression", label: "Compresión", emoji: "📦", value: 60, active: true },
  ]);

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
      {/* Presets as knob-style buttons */}
      <div className="flex gap-3 justify-center overflow-x-auto pb-1">
        {PRESETS.map((p) => (
          <motion.button key={p.id} whileTap={{ scale: 0.93 }}
            onClick={() => setActivePreset(p.id)}
            className={`glass-card p-3 md:p-4 flex flex-col items-center gap-1.5 min-w-[70px] transition-all ${
              activePreset === p.id ? "border-primary/40 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]" : "opacity-50 hover:opacity-80"
            }`}>
            <span className="text-2xl">{p.emoji}</span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${activePreset === p.id ? "neon-text" : "text-muted-foreground"}`}>{p.label}</span>
          </motion.button>
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
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleToggle}
            className={`h-16 w-16 rounded-full flex items-center justify-center ${isListening ? "bg-destructive shadow-[0_0_25px_hsl(var(--destructive)/0.5)]" : "stage-gradient shadow-[0_0_25px_hsl(var(--primary)/0.3)]"}`}>
            <Mic className={`h-7 w-7 ${isListening ? "text-destructive-foreground" : "text-primary-foreground"}`} />
          </motion.button>
        </div>
      </div>

      {/* FX Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-foreground">Efectos</span>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => toast.success("Preset guardado")}
            className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Save className="h-3 w-3" /> Guardar
          </motion.button>
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
