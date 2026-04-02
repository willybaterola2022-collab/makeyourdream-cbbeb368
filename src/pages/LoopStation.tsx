import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Square, Plus, Volume2, Trash2, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { HeroMixer } from "@/components/studio/HeroMixer";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { useAuth } from "@/contexts/AuthContext";
import { useTrainingSession } from "@/hooks/useTrainingSession";
import { trackEvent } from "@/lib/trackEvent";

interface Layer {
  id: string;
  name: string;
  type: string;
  color: string;
  volume: number;
  muted: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
}

const LAYER_TYPES = [
  { type: "beatbox", label: "Beatbox", color: "bg-rose-500", hex: "hsl(0 70% 55%)" },
  { type: "bass", label: "Bajo", color: "bg-blue-500", hex: "hsl(210 80% 55%)" },
  { type: "melody", label: "Melodía", color: "bg-primary", hex: "hsl(275 85% 60%)" },
  { type: "adlibs", label: "Ad-libs", color: "bg-violet-500", hex: "hsl(280 60% 55%)" },
];

export default function LoopStation() {
  const { user } = useAuth();
  const { isListening, requestMic, stream } = useMicrophone();
  const { saveSession } = useTrainingSession();

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "loop-station" }); }, []);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingLayerIdx, setRecordingLayerIdx] = useState<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const addLayer = () => {
    if (layers.length >= 6) { toast.error("Máximo 6 capas"); return; }
    const typeIdx = layers.length % LAYER_TYPES.length;
    const lt = LAYER_TYPES[typeIdx];
    setLayers((prev) => [...prev, {
      id: Date.now().toString(),
      name: `${lt.label} ${layers.length + 1}`,
      type: lt.type,
      color: lt.color,
      volume: 75,
      muted: false,
      audioUrl: null,
      audioBlob: null,
    }]);
  };

  const startRecordingLayer = useCallback(async (layerIdx: number) => {
    let s = stream;
    if (!isListening) {
      const ok = await requestMic();
      if (!ok) return;
      // Stream may not be immediately available; we'll use the ref
      await new Promise(r => setTimeout(r, 200));
    }
    // Re-get stream from navigator
    const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
    const recorder = new MediaRecorder(ms, { mimeType });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setLayers((prev) => prev.map((l, i) => i === layerIdx ? { ...l, audioUrl: url, audioBlob: blob } : l));
      toast.success("Capa grabada");
    };
    recorderRef.current = recorder;
    recorder.start(250);
    setIsRecording(true);
    setRecordingLayerIdx(layerIdx);
  }, [isListening, requestMic, stream]);

  const stopRecordingLayer = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setIsRecording(false);
    setRecordingLayerIdx(null);
  }, []);

  const playAll = useCallback(() => {
    layers.forEach((l) => {
      if (l.audioUrl && !l.muted) {
        const audio = new Audio(l.audioUrl);
        audio.volume = l.volume / 100;
        audio.loop = true;
        audio.play();
        audioRefs.current.set(l.id, audio);
      }
    });
    setIsPlaying(true);
  }, [layers]);

  const stopAll = useCallback(async () => {
    audioRefs.current.forEach((audio) => { audio.pause(); audio.currentTime = 0; });
    audioRefs.current.clear();
    setIsPlaying(false);
    // Save session when stopping playback with recorded layers
    const recordedLayers = layers.filter(l => l.audioUrl);
    if (recordedLayers.length >= 2) {
      const session = await saveSession({ module: "loop-station", overall_score: Math.min(100, recordedLayers.length * 25), song_title: `Loop ${recordedLayers.length} capas` });
      if (session) toast.success(`+XP 🎶 ${recordedLayers.length} capas`);
    }
  }, [layers, saveSession]);

  return (
    <StudioRoom
      roomId="loop"
      heroContent={
        <HeroMixer
          layerCount={layers.length}
          isRecording={isRecording}
          onClick={() => {
            if (isRecording) stopRecordingLayer();
            else if (layers.length > 0) startRecordingLayer(layers.length - 1);
            else { addLayer(); toast.info("Añade una capa y graba"); }
          }}
        />
      }
    >
      {/* Transport controls */}
      <div className="flex items-center justify-center gap-4">
        <StageButton
          variant={isRecording ? "danger" : "primary"}
          icon={isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          onClick={() => {
            if (isRecording) stopRecordingLayer();
            else if (layers.length > 0) startRecordingLayer(layers.length - 1);
            else { addLayer(); }
          }}
        >
          {isRecording ? "PARAR" : "GRABAR"}
        </StageButton>
        <StageButton
          variant="glass"
          icon={isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          onClick={() => isPlaying ? stopAll() : playAll()}
        >
          {isPlaying ? "PAUSA" : "PLAY"}
        </StageButton>
        <StageButton variant="glass" icon={<Plus className="h-6 w-6" />} onClick={addLayer}>
          CAPA
        </StageButton>
      </div>

      {/* Layers */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 flex flex-col items-center gap-3 ${layer.muted ? "opacity-30" : ""}`}
          >
            <motion.div
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${layer.color}/20`}
              style={{ borderColor: LAYER_TYPES.find(t => t.type === layer.type)?.hex || "hsl(275 85% 60%)" }}
              animate={isPlaying && !layer.muted && layer.audioUrl ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {layer.audioUrl ? (
                <div className="w-4 h-4 rounded-full bg-background border border-border" />
              ) : (
                <Mic className="h-5 w-5 text-muted-foreground" />
              )}
            </motion.div>

            <span className="text-xs font-bold uppercase tracking-wider text-foreground">{layer.name}</span>
            <span className="text-[9px] text-muted-foreground">{layer.audioUrl ? "Grabado ✓" : "Sin audio"}</span>

            <div className="flex items-center gap-2 w-full">
              <Volume2 className="h-3 w-3 text-muted-foreground shrink-0" />
              <Slider value={[layer.volume]} max={100} step={1} className="flex-1"
                onValueChange={([v]) => setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, volume: v } : l))} />
            </div>

            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => setLayers((prev) => prev.map((l) => l.id === layer.id ? { ...l, muted: !l.muted } : l))}
                className="text-[10px] font-bold glass-card px-3 py-1 rounded-lg text-muted-foreground hover:text-foreground">
                {layer.muted ? "MUTE" : "ON"}
              </motion.button>
              {!layer.audioUrl && !isRecording && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => startRecordingLayer(i)}
                  className="text-[10px] font-bold glass-card px-3 py-1 rounded-lg text-primary hover:text-foreground">
                  REC
                </motion.button>
              )}
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setLayers((prev) => prev.filter((l) => l.id !== layer.id))}
                className="glass-card px-2 py-1 rounded-lg text-destructive hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </motion.button>
            </div>
          </motion.div>
        ))}

        {layers.length === 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={addLayer}
            className="col-span-2 md:col-span-3 glass-card border-dashed p-8 flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground hover:border-primary/30"
          >
            <Plus className="h-10 w-10" />
            <span className="text-sm font-bold">Añade tu primera capa</span>
          </motion.button>
        )}
      </div>
    </StudioRoom>
  );
}
