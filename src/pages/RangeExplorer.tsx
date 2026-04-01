import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Save, RotateCcw } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useMicrophone } from "@/hooks/useMicrophone";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const NOTES = ["C2","D2","E2","F2","G2","A2","B2","C3","D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5","B5","C6"];
const NOTE_FREQS = [65.41,73.42,82.41,87.31,98.00,110.00,123.47,130.81,146.83,164.81,174.61,196.00,220.00,246.94,261.63,293.66,329.63,349.23,392.00,440.00,493.88,523.25,587.33,659.25,698.46,783.99,880.00,987.77,1046.50];

function freqToNoteIndex(freq: number): number {
  if (freq < 60) return -1;
  let closest = 0;
  let minDist = Infinity;
  for (let i = 0; i < NOTE_FREQS.length; i++) {
    const dist = Math.abs(freq - NOTE_FREQS[i]);
    if (dist < minDist) { minDist = dist; closest = i; }
  }
  return minDist < NOTE_FREQS[closest] * 0.08 ? closest : -1;
}

const RangeExplorer = () => {
  const { user } = useAuth();
  const { isListening, requestMic, stopMic, analyserNode } = useMicrophone(2048);
  const pitch = usePitchDetection(analyserNode);
  const [hitNotes, setHitNotes] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "range-explorer" }); }, []);

  useEffect(() => {
    if (!pitch?.frequency) return;
    const idx = freqToNoteIndex(pitch.frequency);
    if (idx >= 0) setHitNotes(prev => new Set(prev).add(idx));
  }, [pitch?.frequency]);

  const lowestHit = hitNotes.size > 0 ? Math.min(...hitNotes) : -1;
  const highestHit = hitNotes.size > 0 ? Math.max(...hitNotes) : -1;

  const saveRange = async () => {
    if (!user?.id || lowestHit < 0) return;
    setSaving(true);
    try {
      await supabase.functions.invoke("vocal-fingerprint", {
        body: { user_id: user.id, vocal_range_low: NOTE_FREQS[lowestHit], vocal_range_high: NOTE_FREQS[highestHit] },
      });
      toast.success("Rango guardado en tu huella vocal");
      trackEvent(user.id, "range_saved", { low: NOTES[lowestHit], high: NOTES[highestHit] });
    } catch { toast.error("Error al guardar"); }
    setSaving(false);
  };

  return (
    <StudioRoom config={{ hero: "piano", title: "Explorador de Rango", subtitle: "Canta de grave a agudo" }}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <div className="text-center space-y-2">
          {hitNotes.size > 0 ? (
            <p className="text-sm text-muted-foreground">{NOTES[lowestHit]} → {NOTES[highestHit]} · {hitNotes.size} notas</p>
          ) : (
            <p className="text-sm text-muted-foreground">Activa el micrófono y canta desde tu nota más grave hasta la más aguda</p>
          )}
        </div>

        {/* Piano visual */}
        <div className="flex flex-col gap-0.5">
          {NOTES.map((note, i) => {
            const hit = hitNotes.has(i);
            const isCurrentNote = pitch?.frequency && freqToNoteIndex(pitch.frequency) === i;
            return (
              <motion.div key={note} className={`h-6 rounded-sm flex items-center px-2 text-xs transition-all ${hit ? "bg-primary/80 text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.3)]" : "bg-muted/20 text-muted-foreground/40"} ${isCurrentNote ? "ring-2 ring-primary scale-x-105" : ""}`}
                animate={isCurrentNote ? { scale: [1, 1.02, 1] } : {}}>
                <span className="w-8 font-mono text-[10px]">{note}</span>
                {hit && <div className="flex-1 h-2 bg-primary/40 rounded-full ml-2" />}
              </motion.div>
            );
          }).reverse()}
        </div>

        <div className="flex gap-3 justify-center">
          <StageButton onClick={isListening ? stopMic : requestMic} variant={isListening ? "destructive" : "default"}>
            {isListening ? <><MicOff className="w-4 h-4 mr-2" /> Parar</> : <><Mic className="w-4 h-4 mr-2" /> Empezar</>}
          </StageButton>
          {hitNotes.size > 0 && (
            <>
              <StageButton variant="outline" onClick={() => setHitNotes(new Set())}><RotateCcw className="w-4 h-4" /></StageButton>
              <StageButton variant="outline" onClick={saveRange} disabled={saving}><Save className="w-4 h-4 mr-1" /> Guardar</StageButton>
            </>
          )}
        </div>
      </div>
    </StudioRoom>
  );
};

export default RangeExplorer;
