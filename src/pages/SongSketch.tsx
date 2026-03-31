import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Pause, Trash2, GripVertical, Wand2, Download, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useSupabaseRecorder } from "@/hooks/useSupabaseRecorder";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";
import { StudioRoom } from "@/components/studio/StudioRoom";

interface SketchBlock { id: string; label: string; section: string; duration: number; audioUrl: string | null; audioBlob: Blob | null; }

const SECTION_COLORS: Record<string, { bg: string; text: string }> = {
  intro: { bg: "hsl(210 80% 55% / 0.15)", text: "hsl(210 80% 55%)" },
  verso: { bg: "hsl(160 60% 50% / 0.15)", text: "hsl(160 60% 50%)" },
  coro: { bg: "hsl(275 85% 60% / 0.15)", text: "hsl(275 85% 60%)" },
  puente: { bg: "hsl(280 60% 55% / 0.15)", text: "hsl(280 60% 55%)" },
  outro: { bg: "hsl(0 70% 55% / 0.15)", text: "hsl(0 70% 55%)" },
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
    if (isCapturing) { stopRecording(); stopMic(); setIsCapturing(false); }
    else { const ok = await requestMic(); if (!ok) return; setIsCapturing(true); }
  };

  const startedRef = useRef(false);
  if (isCapturing && stream && !isRecording && !startedRef.current) {
    startedRef.current = true;
    setTimeout(() => startRecording(stream), 100);
  }
  if (!isCapturing) startedRef.current = false;

  const lastBlobRef = useRef<Blob | null>(null);
  if (audioBlob && audioBlob !== lastBlobRef.current && !isCapturing) {
    lastBlobRef.current = audioBlob;
    const newBlock: SketchBlock = { id: Date.now().toString(), label: `Idea #${blocks.length + 1}`, section: selectedSection, duration, audioUrl, audioBlob };
    setTimeout(async () => {
      setBlocks((prev) => [...prev, newBlock]);
      await saveRecording(`Idea #${blocks.length + 1} - ${selectedSection}`, { section: selectedSection });
      clearRecording();
      toast.success("¡Fragmento guardado! ☁️");
    }, 0);
  }

  const playBlock = (block: SketchBlock) => {
    if (playingId === block.id) { playingRef.current?.pause(); setPlayingId(null); return; }
    if (!block.audioUrl) return;
    if (playingRef.current) playingRef.current.pause();
    const audio = new Audio(block.audioUrl);
    audio.onended = () => setPlayingId(null);
    audio.play();
    playingRef.current = audio;
    setPlayingId(block.id);
  };

  return (
    <StudioRoom
      roomId="sketch"
      heroContent={
        <motion.div className="flex flex-col items-center z-10"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {/* Notebook hero */}
          <div className="relative w-52 h-64 md:w-64 md:h-80 rounded-lg border-2 overflow-hidden"
            style={{ borderColor: "hsl(150 50% 30%)", background: "hsl(150 10% 8%)" }}>
            {/* Pentagrama lines */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute w-full border-t" style={{ top: `${12 + i * 10}%`, borderColor: "hsl(150 50% 25% / 0.3)" }} />
            ))}
            {/* Sticky notes for blocks */}
            {blocks.slice(-4).map((b, i) => {
              const sc = SECTION_COLORS[b.section] || SECTION_COLORS.verso;
              return (
                <motion.div key={b.id} initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: -5 + i * 3 }}
                  className="absolute w-14 h-10 md:w-16 md:h-12 rounded-sm flex items-center justify-center"
                  style={{ background: sc.bg, left: `${10 + i * 20}%`, top: `${15 + (i % 2) * 25}%` }}>
                  <span className="text-[8px] font-bold uppercase" style={{ color: sc.text }}>{b.section}</span>
                </motion.div>
              );
            })}
            {/* Record button center */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleRecord}
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full flex items-center justify-center ${
                isCapturing ? "bg-destructive shadow-[0_0_25px_hsl(var(--destructive)/0.5)]" : "stage-gradient shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
              }`}>
              {isCapturing ? <Square className="h-6 w-6 text-destructive-foreground" /> : <Mic className="h-6 w-6 text-primary-foreground" />}
            </motion.button>
          </div>

          <motion.p className="mt-4 text-lg font-bold uppercase tracking-[0.2em]"
            style={{ color: "hsl(150 50% 55%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
            📓 CAPTURA IDEAS 📓
          </motion.p>
        </motion.div>
      }
    >
      {/* Section picker */}
      <div className="flex gap-2 justify-center overflow-x-auto pb-1">
        {SECTIONS.map((s) => {
          const sc = SECTION_COLORS[s];
          return (
            <motion.button key={s} whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedSection(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                selectedSection === s ? "border shadow-[0_0_15px_-5px]" : "glass-card opacity-50 hover:opacity-80"
              }`}
              style={selectedSection === s ? { borderColor: sc.text, color: sc.text, background: sc.bg, boxShadow: `0 0 15px -5px ${sc.text}` } : {}}>
              {s}
            </motion.button>
          );
        })}
      </div>

      {/* Volume indicator */}
      {isCapturing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-2xl">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-destructive rounded-full" animate={{ width: `${volume}%` }} />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Grabando: {selectedSection}</p>
        </motion.div>
      )}

      {/* Blocks Timeline */}
      {blocks.length > 0 ? (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {blocks.length} fragmentos · {blocks.reduce((s, b) => s + b.duration, 0)}s
          </span>
          {blocks.map((block, i) => {
            const sc = SECTION_COLORS[block.section] || SECTION_COLORS.verso;
            return (
              <motion.div key={block.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="glass-card p-3 flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab shrink-0" />
                <Badge variant="outline" className="text-[9px] uppercase border" style={{ borderColor: sc.text, color: sc.text, background: sc.bg }}>
                  {block.section}
                </Badge>
                <span className="text-sm font-bold text-foreground flex-1 truncate">{block.label}</span>
                <span className="text-xs text-muted-foreground">{block.duration}s</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => playBlock(block)} disabled={!block.audioUrl}
                  className="glass-card h-8 w-8 rounded-full flex items-center justify-center">
                  {playingId === block.id ? <Pause className="h-3 w-3 text-primary" /> : <Play className="h-3 w-3 text-foreground ml-0.5" />}
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { if (block.audioUrl) URL.revokeObjectURL(block.audioUrl); setBlocks(prev => prev.filter(b => b.id !== block.id)); }}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-destructive">
                  <Trash2 className="h-3 w-3" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-8 text-center rounded-2xl">
          <p className="text-muted-foreground text-sm">¡Graba tu primera idea! 🎤</p>
        </div>
      )}

      {/* AI Assemble */}
      {blocks.length >= 2 && (
        <div className="glass-card p-5 rounded-2xl border-primary/20">
          <div className="flex gap-3 justify-center">
            <motion.button whileTap={{ scale: 0.95 }}
              className="stage-gradient text-primary-foreground font-bold px-6 py-3 rounded-2xl flex items-center gap-2"
              onClick={() => toast.info("Próximamente")}>
              <Wand2 className="h-5 w-5" /> GENERAR DEMO
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }}
              className="glass-card px-6 py-3 rounded-2xl flex items-center gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => toast.info("Próximamente")}>
              <Download className="h-5 w-5" /> Exportar
            </motion.button>
          </div>
        </div>
      )}
    </StudioRoom>
  );
}
