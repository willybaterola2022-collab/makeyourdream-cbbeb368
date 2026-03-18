import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Square, Plus, Volume2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Layer {
  id: string;
  name: string;
  type: string;
  color: string;
  volume: number;
  muted: boolean;
}

const LAYER_TYPES = [
  { type: "beatbox", label: "Beatbox", color: "bg-rose-500" },
  { type: "bass", label: "Bajo vocal", color: "bg-blue-500" },
  { type: "melody", label: "Melodía", color: "bg-primary" },
  { type: "adlibs", label: "Ad-libs", color: "bg-violet-500" },
];

export default function LoopStation() {
  const [layers, setLayers] = useState<Layer[]>([
    { id: "1", name: "Beatbox base", type: "beatbox", color: "bg-rose-500", volume: 80, muted: false },
    { id: "2", name: "Bajo vocal", type: "bass", color: "bg-blue-500", volume: 70, muted: false },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const addLayer = () => {
    if (layers.length >= 6) {
      toast.error("Máximo 6 capas");
      return;
    }
    const typeIdx = layers.length % LAYER_TYPES.length;
    const lt = LAYER_TYPES[typeIdx];
    setLayers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: `${lt.label} ${layers.length + 1}`, type: lt.type, color: lt.color, volume: 75, muted: false },
    ]);
    toast.success("Capa añadida — graba encima");
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Loop Station</h1>
        <p className="text-muted-foreground mt-1">Graba capas de voz en vivo, una sobre otra</p>
      </div>

      {/* Transport */}
      <Card className="p-4 bg-card border-border/40 flex items-center justify-center gap-4">
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="lg"
          onClick={() => { setIsRecording(!isRecording); if (!isRecording) toast("Grabando capa..."); }}
        >
          {isRecording ? <Square className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
          {isRecording ? "DETENER" : "GRABAR"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <Play className={`h-5 w-5 mr-2 ${isPlaying ? "text-primary" : ""}`} />
          {isPlaying ? "PAUSAR" : "REPRODUCIR"}
        </Button>
        <Button variant="outline" size="lg" onClick={addLayer}>
          <Plus className="h-5 w-5 mr-2" />
          CAPA
        </Button>
      </Card>

      {/* Layers */}
      <div className="space-y-3">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`p-4 bg-card border-border/40 ${layer.muted ? "opacity-40" : ""}`}>
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${layer.color} shrink-0`} />
                <span className="text-sm font-medium text-foreground flex-1">{layer.name}</span>
                <Badge variant="outline" className="text-[10px] uppercase">{layer.type}</Badge>
              </div>

              {/* Waveform placeholder */}
              <div className="mt-3 flex items-end gap-[1px] h-8">
                {Array.from({ length: 60 }).map((_, j) => (
                  <div
                    key={j}
                    className={`flex-1 rounded-sm ${layer.color}`}
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      opacity: isPlaying ? 0.7 : 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Volume */}
              <div className="mt-3 flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[layer.volume]}
                  max={100}
                  step={1}
                  className="flex-1"
                  onValueChange={([v]) =>
                    setLayers((prev) => prev.map((l) => (l.id === layer.id ? { ...l, volume: v } : l)))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() =>
                    setLayers((prev) => prev.map((l) => (l.id === layer.id ? { ...l, muted: !l.muted } : l)))
                  }
                >
                  <span className="text-[10px]">{layer.muted ? "MUTE" : "ON"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => setLayers((prev) => prev.filter((l) => l.id !== layer.id))}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
