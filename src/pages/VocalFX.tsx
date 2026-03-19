import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Sliders, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useMicrophone } from "@/hooks/useMicrophone";
import { toast } from "sonner";

interface FXParam {
  id: string;
  label: string;
  emoji: string;
  value: number;
  active: boolean;
}

const PRESETS = [
  { id: "cathedral", label: "Catedral", emoji: "⛪" },
  { id: "stadium", label: "Estadio", emoji: "🏟️" },
  { id: "radio", label: "Radio Vintage", emoji: "📻" },
  { id: "robot", label: "Vocoder", emoji: "🤖" },
  { id: "studio", label: "Estudio Pro", emoji: "🎚️" },
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
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Vocal FX Studio</h1>
        <p className="text-muted-foreground mt-1">Efectos en tiempo real mientras cantas</p>
      </div>

      {/* Presets */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PRESETS.map((p) => (
          <Button
            key={p.id}
            variant={activePreset === p.id ? "default" : "outline"}
            size="sm"
            className={`whitespace-nowrap ${activePreset === p.id ? "stage-gradient text-primary-foreground" : ""}`}
            onClick={() => setActivePreset(p.id)}
          >
            {p.emoji} {p.label}
          </Button>
        ))}
      </div>

      {/* Live Waveform */}
      <Card className="p-4 bg-card border-border/40">
        <div className="flex items-end gap-[2px] h-16 mb-4">
          {(isListening ? waveformData.slice(0, 64) : Array(64).fill(5)).map((v, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm bg-primary"
              animate={{ height: `${Math.max(v, 3)}%`, opacity: isListening ? 0.8 : 0.15 }}
              transition={{ duration: 0.05 }}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className={`h-14 w-14 rounded-full flex items-center justify-center ${
              isListening ? "bg-destructive" : "gold-gradient"
            }`}
          >
            <Mic className={`h-6 w-6 ${isListening ? "text-destructive-foreground" : "text-primary-foreground"}`} />
          </motion.button>
        </div>
      </Card>

      {/* FX Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            Efectos
          </h2>
          <Button variant="outline" size="sm" onClick={() => toast.success("Preset guardado")}>
            <Save className="h-4 w-4 mr-1" />
            Guardar preset
          </Button>
        </div>
        {effects.map((fx) => (
          <Card key={fx.id} className={`p-3 bg-card border-border/40 ${!fx.active ? "opacity-50" : ""}`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{fx.emoji}</span>
              <span className="text-sm font-medium text-foreground flex-1">{fx.label}</span>
              <span className="text-xs text-muted-foreground w-8 text-right">{fx.value}%</span>
              <Switch
                checked={fx.active}
                onCheckedChange={(checked) => updateEffect(fx.id, { active: checked })}
              />
            </div>
            {fx.active && (
              <div className="mt-2 pl-8">
                <Slider
                  value={[fx.value]}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateEffect(fx.id, { value: v })}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
