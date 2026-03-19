import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Pause, Trash2, GripVertical, Wand2, Download, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { toast } from "sonner";

interface SketchBlock {
  id: string;
  label: string;
  section: string;
  duration: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
}

const SECTION_COLORS: Record<string, string> = {
  intro: "bg-blue-500/20 border-blue-500/40 text-blue-400",
  verso: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
  coro: "bg-primary/20 border-primary/40 text-primary",
  puente: "bg-violet-500/20 border-violet-500/40 text-violet-400",
  outro: "bg-rose-500/20 border-rose-500/40 text-rose-400",
};

const SECTIONS = ["intro", "verso", "coro", "puente", "outro"];

export default function SongSketch() {
  const { isListening, volume, requestMic, stopMic, stream } = useMicrophone();
  const { isRecording, audioBlob, audioUrl, duration, startRecording, stopRecording, clearRecording, saveRecording } = useSupabaseRecorder("song-sketch");
  const [blocks, setBlocks] = useState<SketchBlock[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedSection, setSelectedSection] = useState("verso");
  const playingRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleRecord = async () => {
    if (isCapturing) {
      // Stop recording and save block
      stopRecording();
      stopMic();
      setIsCapturing(false);
    } else {
      // Start
      const ok = await requestMic();
      if (!ok) return;
      // Wait a tick for stream to be available
      setTimeout(() => {
        const mic = document.querySelector("body"); // just a delay trick
      }, 50);
      setIsCapturing(true);
    }
  };

  // Start MediaRecorder once stream is ready and we're capturing
  const startedRef = useRef(false);
  if (isCapturing && stream && !isRecording && !startedRef.current) {
    startedRef.current = true;
    setTimeout(() => startRecording(stream), 100);
  }
  if (!isCapturing) startedRef.current = false;

  // When recording finishes, add a block
  const lastBlobRef = useRef<Blob | null>(null);
  if (audioBlob && audioBlob !== lastBlobRef.current && !isCapturing) {
    lastBlobRef.current = audioBlob;
    const newBlock: SketchBlock = {
      id: Date.now().toString(),
      label: `Idea #${blocks.length + 1}`,
      section: selectedSection,
      duration: duration,
      audioUrl: audioUrl,
      audioBlob: audioBlob,
    };
    // Use setTimeout to avoid setState during render
    setTimeout(async () => {
      setBlocks((prev) => [...prev, newBlock]);
      // Save to cloud
      await saveRecording(`Idea #${blocks.length + 1} - ${selectedSection}`, { section: selectedSection });
      clearRecording();
      toast.success("¡Fragmento guardado en la nube! ☁️");
    }, 0);
  }

  const removeBlock = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (block?.audioUrl) URL.revokeObjectURL(block.audioUrl);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const playBlock = (block: SketchBlock) => {
    if (playingId === block.id) {
      playingRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (!block.audioUrl) return;
    if (playingRef.current) playingRef.current.pause();
    const audio = new Audio(block.audioUrl);
    audio.onended = () => setPlayingId(null);
    audio.play();
    playingRef.current = audio;
    setPlayingId(block.id);
  };

  const totalDuration = blocks.reduce((s, b) => s + b.duration, 0);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Song Sketch</h1>
        <p className="text-muted-foreground mt-1">Graba ideas en cualquier momento. Arma tu canción pieza a pieza.</p>
      </div>

      {/* Section picker */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SECTIONS.map((s) => (
          <Button
            key={s}
            variant={selectedSection === s ? "default" : "outline"}
            size="sm"
            className={`capitalize ${selectedSection === s ? "stage-gradient text-primary-foreground" : ""}`}
            onClick={() => setSelectedSection(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* Quick Record */}
      <Card className="p-6 bg-card border-border/40 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {isCapturing ? "Grabando tu idea..." : "Captura una idea rápida"}
        </p>
        <motion.button
          onClick={handleRecord}
          whileTap={{ scale: 0.95 }}
          className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center transition-all ${
            isCapturing
              ? "bg-destructive shadow-[0_0_30px_hsl(var(--destructive)/0.5)]"
              : "stage-gradient shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
          }`}
        >
          {isCapturing ? (
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
              <Square className="h-8 w-8 text-destructive-foreground" />
            </motion.div>
          ) : (
            <Mic className="h-8 w-8 text-primary-foreground" />
          )}
        </motion.button>
        {isCapturing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <div className="h-2 w-32 mx-auto bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-destructive rounded-full" animate={{ width: `${volume}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Sección: {selectedSection}</p>
          </motion.div>
        )}
      </Card>

      {/* Blocks Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">TUS BLOQUES</h2>
          <span className="text-sm text-muted-foreground">
            {blocks.length} fragmentos · {totalDuration}s total
          </span>
        </div>

        {blocks.length === 0 ? (
          <Card className="p-8 bg-card border-border/40 text-center">
            <p className="text-muted-foreground text-sm">Aún no hay bloques. ¡Graba tu primera idea! 🎤</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {blocks.map((block, i) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-3 bg-card border-border/40 flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                  <Badge variant="outline" className={`text-[10px] uppercase ${SECTION_COLORS[block.section]}`}>
                    {block.section}
                  </Badge>
                  <span className="text-sm text-foreground flex-1 truncate">{block.label}</span>
                  <span className="text-xs text-muted-foreground">{block.duration}s</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => playBlock(block)}
                    disabled={!block.audioUrl}
                  >
                    {playingId === block.id ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBlock(block.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AI Assemble */}
      {blocks.length >= 2 && (
        <Card className="p-5 bg-card border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <Wand2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Ensamblar con IA</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            La IA detectará la tonalidad de cada bloque, sugerirá un orden y aplicará crossfade automático.
          </p>
          <div className="flex gap-2">
            <Button className="stage-gradient text-primary-foreground" onClick={() => toast.info("Requiere backend — próximamente")}>
              <Wand2 className="h-4 w-4 mr-2" />
              GENERAR DEMO
            </Button>
            <Button variant="outline" onClick={() => toast.info("Requiere backend — próximamente")}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
