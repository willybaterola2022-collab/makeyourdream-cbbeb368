import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Wand2, Play, Download, Sparkles, Music, Volume2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";

const WaveformDisplay = ({ processed, seed }: { processed: boolean; seed: number }) => (
  <div className="flex items-end gap-px h-24 w-full">
    {Array.from({ length: 80 }).map((_, i) => {
      const base = 20 + Math.sin(i * 0.4 + seed) * 30 + Math.cos(i * 0.7 + seed * 1.5) * 20;
      const h = processed ? Math.min(90, base * 1.2 + 10) : base;
      return (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(5, h)}%` }}
          transition={{ duration: 0.4, delay: i * 0.01 }}
          className={`flex-1 rounded-t-sm ${processed ? "bg-primary" : "bg-muted-foreground/40"}`}
        />
      );
    })}
  </div>
);

const AutoMix = () => {
  const [eq, setEq] = useState([60, 50, 70]);
  const [reverb, setReverb] = useState([35]);
  const [compression, setCompression] = useState([50]);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [progress, setProgress] = useState(0);

  const startMix = () => {
    setProcessing(true);
    setProgress(0);
    setProcessed(false);
  };

  useEffect(() => {
    if (!processing) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setProcessing(false);
          setProcessed(true);
          return 100;
        }
        return p + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [processing]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <StaggerContainer>
        <StaggerItem>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Auto-Mix & Master</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Mezcla profesional con IA</p>
                <Badge variant="secondary" className="text-[10px] gap-1"><Sparkles className="h-3 w-3" />IA</Badge>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Original waveform */}
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Music className="h-4 w-4" />
                {processed ? "Resultado procesado" : "Grabación original"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WaveformDisplay processed={processed} seed={processed ? 5 : 2} />
              <div className="flex items-center justify-between mt-3">
                <Button variant="ghost" size="sm" className="gap-1"><Play className="h-3 w-3" />Reproducir</Button>
                <span className="text-xs text-muted-foreground">3:24</span>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Effects panel */}
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Efectos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">EQ (Bajos · Medios · Agudos)</p>
                <div className="grid grid-cols-3 gap-4">
                  {["Bajos", "Medios", "Agudos"].map((label, i) => (
                    <div key={label} className="space-y-2">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <Slider value={[eq[i]]} onValueChange={(v) => { const next = [...eq]; next[i] = v[0]; setEq(next); }} max={100} className="w-full" />
                      <span className="text-[10px] text-muted-foreground">{eq[i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Reverb</p>
                  <Slider value={reverb} onValueChange={setReverb} max={100} />
                  <span className="text-[10px] text-muted-foreground">{reverb[0]}%</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Compresión</p>
                  <Slider value={compression} onValueChange={setCompression} max={100} />
                  <span className="text-[10px] text-muted-foreground">{compression[0]}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Auto-mix button */}
        <StaggerItem>
          {processing ? (
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center space-y-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="h-8 w-8 text-primary mx-auto" />
                </motion.div>
                <p className="text-sm font-medium text-foreground">IA procesando tu mezcla...</p>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={startMix} size="lg" className="w-full gap-2 h-14 text-base">
                <Wand2 className="h-5 w-5" />
                {processed ? "Re-procesar con IA" : "Auto-Mix con IA"}
              </Button>
            </motion.div>
          )}
        </StaggerItem>

        {/* Export options */}
        {processed && (
          <StaggerItem>
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Exportar</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{ label: "TikTok", sub: "15s" }, { label: "Reels", sub: "30s" }, { label: "Full track", sub: "3:24" }].map((opt) => (
                    <Button key={opt.label} variant="outline" className="flex-col h-auto py-3 gap-0.5">
                      <Download className="h-4 w-4" />
                      <span className="text-xs">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.sub}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-3 italic">Mixed with MakeYourDream ✨</p>
              </CardContent>
            </Card>
          </StaggerItem>
        )}
      </StaggerContainer>
    </div>
  );
};

export default AutoMix;
