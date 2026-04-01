import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music2, Mic, MicOff, Trash2 } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
function freqToMidi(freq: number) {
  if (freq < 20) return null;
  return Math.round(12 * Math.log2(freq / 440) + 69);
}
function midiToName(midi: number) {
  const n = midi % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[n]}${oct}`;
}

interface MelodyNote { midi: number; time: number; }

const MelodyMaker = () => {
  const { user } = useAuth();
  const { isListening, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const [notes, setNotes] = useState<MelodyNote[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [lastMidi, setLastMidi] = useState<number | null>(null);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "melody-maker" }); }, []);

  useEffect(() => {
    if (!pitch?.frequency || !isListening) return;
    const midi = freqToMidi(pitch.frequency);
    if (midi && midi !== lastMidi) {
      setLastMidi(midi);
      setNotes(prev => [...prev, { midi, time: Date.now() - startTime }]);
    }
  }, [pitch?.frequency, isListening, lastMidi, startTime]);

  const handleStart = () => { setStartTime(Date.now()); setNotes([]); setLastMidi(null); requestMic(); };
  const midiRange = notes.length > 0 ? { min: Math.min(...notes.map(n => n.midi)), max: Math.max(...notes.map(n => n.midi)) } : { min: 60, max: 72 };
  const range = midiRange.max - midiRange.min || 12;

  return (
    <StudioRoom roomId="sketch" heroContent={<div className="text-center"><Music2 className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Melody Maker</h1><p className="text-sm text-muted-foreground">Canta y crea melodías</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        {/* Piano roll */}
        <div className="glass-card p-4 rounded-2xl overflow-x-auto">
          <div className="relative h-40 min-w-[300px]">
            {notes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Canta para ver las notas aquí</div>
            ) : (
              notes.map((n, i) => {
                const y = ((midiRange.max - n.midi) / range) * 100;
                const x = (i / Math.max(notes.length, 1)) * 100;
                return (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute w-3 h-3 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    title={midiToName(n.midi)} />
                );
              })
            )}
          </div>
        </div>

        {notes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {notes.map((n, i) => (
              <span key={i} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">{midiToName(n.midi)}</span>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <StageButton onClick={isListening ? () => { stopMic(); } : handleStart} variant={isListening ? "danger" : "primary"}>
            {isListening ? <><MicOff className="w-4 h-4 mr-2" /> Parar</> : <><Mic className="w-4 h-4 mr-2" /> Grabar melodía</>}
          </StageButton>
          {notes.length > 0 && <StageButton variant="glass" onClick={() => setNotes([])}><Trash2 className="w-4 h-4" /></StageButton>}
        </div>
      </div>
    </StudioRoom>
  );
};

export default MelodyMaker;
