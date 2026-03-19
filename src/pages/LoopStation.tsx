import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Square, Plus, Volume2, Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroMixer } from "@/components/studio/HeroMixer";

interface Layer {
  id: string;
  name: string;
  type: string;
  color: string;
  volume: number;
  muted: boolean;
}

const LAYER_TYPES = [
  { type: "beatbox", label: "Beatbox", color: "bg-rose-500", hex: "hsl(0 70% 55%)" },
  { type: "bass", label: "Bajo", color: "bg-blue-500", hex: "hsl(210 80% 55%)" },
  { type: "melody", label: "Melodía", color: "bg-primary", hex: "hsl(275 85% 60%)" },
  { type: "adlibs", label: "Ad-libs", color: "bg-violet-500", hex: "hsl(280 60% 55%)" },
];

export default function LoopStation() {
  const [layers, setLayers] = useState<Layer[]>([
    { id: "1", name: "Beatbox", type: "beatbox", color: "bg-rose-500", volume: 80, muted: false },
    { id: "2", name: "Bajo vocal", type: "bass", color: "bg-blue-500", volume: 70, muted: false },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const addLayer = () => {
    if (layers.length >= 6) { toast.error("Máximo 6 capas"); return; }
    const typeIdx = layers.length % LAYER_TYPES.length;
    const lt = LAYER_TYPES[typeIdx];
    setLayers((prev) => [...prev, { id: Date.now().toString(), name: `${lt.label} ${layers.length + 1}`, type: lt.type, color: lt.color, volume: 75, muted: false }]);
    toast.success("Capa añadida");
  };

  return (
    <StudioRoom
      roomId="loop"
      heroContent={
        <HeroMixer
          layerCount={layers.length}
          isRecording={isRecording}
          onClick={() => { setIsRecording(!isRecording); if (!isRecording) toast("Grabando capa..."); }}
        />
      }
    >
      {/* Transport controls */}
      <div className="flex items-center justify-center gap-4">
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => { setIsRecording(!isRecording); if (!isRecording) toast("Grabando..."); }}
          className={`h-16 w-16 rounded-full flex items-center justify-center ${isRecording ? "bg-destructive shadow-[0_0_25px_hsl(var(--destructive)/0.5)]" : "stage-gradient shadow-[0_0_25px_hsl(var(--primary)/0.3)]"}`}>
          {isRecording ? <Square className="h-7 w-7 text-destructive-foreground" /> : <Mic className="h-7 w-7 text-primary-foreground" />}
        </motion.button>
        <motion.button whileTap={{ scale: 0.93 }} onClick={() => setIsPlaying(!isPlaying)}
          className="h-16 w-16 rounded-full glass-card flex items-center justify-center text-foreground hover:border-primary/30">
          <Play className={`h-7 w-7 ${isPlaying ? "text-primary" : ""}`} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.93 }} onClick={addLayer}
          className="h-16 w-16 rounded-full glass-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30">
          <Plus className="h-7 w-7" />
        </motion.button>
      </div>

      {/* Layers as vinyl discs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 flex flex-col items-center gap-3 ${layer.muted ? "opacity-30" : ""}`}
          >
            {/* Vinyl disc */}
            <motion.div
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${layer.color}/20`}
              style={{ borderColor: LAYER_TYPES.find(t => t.type === layer.type)?.hex || "hsl(275 85% 60%)" }}
              animate={isPlaying && !layer.muted ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-4 h-4 rounded-full bg-background border border-border" />
            </motion.div>

            <span className="text-xs font-bold uppercase tracking-wider text-foreground">{layer.name}</span>

            {/* Volume */}
            <div className="flex items-center gap-2 w-full">
              <Volume2 className="h-3 w-3 text-muted-foreground shrink-0" />
              <Slider value={[layer.volume]} max={100} step={1} className="flex-1"
                onValueChange={([v]) => setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, volume: v } : l))} />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, muted: !l.muted } : l))}
                className="text-[10px] font-bold glass-card px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground">
                {layer.muted ? "MUTE" : "ON"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setLayers((prev) => prev.filter((l) => l.id !== layer.id))}
                className="glass-card px-2 py-1 rounded-lg text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </StudioRoom>
  );
}
