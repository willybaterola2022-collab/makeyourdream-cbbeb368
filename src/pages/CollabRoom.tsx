import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Plus, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { StudioRoom } from "@/components/studio/StudioRoom";

interface Participant { name: string; initials: string; role: string; color: string; muted: boolean; }

const INITIAL_PARTICIPANTS: Participant[] = [
  { name: "Tú", initials: "MK", role: "Melodía", color: "hsl(275 85% 60%)", muted: false },
  { name: "Luna Vox", initials: "LV", role: "Armonía", color: "hsl(280 60% 55%)", muted: false },
  { name: "Echo Rivera", initials: "ER", role: "Beatbox", color: "hsl(0 70% 55%)", muted: true },
];

export default function CollabRoom() {
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMsg, setChatMsg] = useState("");

  return (
    <StudioRoom
      roomId="collab"
      heroContent={
        <motion.div className="flex flex-col items-center z-10"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {/* Round table from above */}
          <div className="relative w-48 h-48 md:w-60 md:h-60">
            {/* Table */}
            <div className="absolute inset-6 rounded-full border-2 border-border/40 bg-card/30 backdrop-blur-sm" />
            {/* Participants around the table */}
            {participants.map((p, i) => {
              const angle = (i / Math.max(participants.length, 3)) * 2 * Math.PI - Math.PI / 2;
              const r = 42;
              const x = 50 + r * Math.cos(angle);
              const y = 50 + r * Math.sin(angle);
              return (
                <motion.div key={i}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                  animate={!p.muted ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: p.muted ? "hsl(0 0% 25%)" : p.color, background: `${p.color}20` }}>
                    <span className="text-xs font-bold" style={{ color: p.muted ? "hsl(0 0% 40%)" : p.color }}>{p.initials}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Badge className="mt-2 stage-gradient text-primary-foreground">EN VIVO · {participants.length}/4</Badge>

          <motion.p className="mt-3 text-lg font-bold uppercase tracking-[0.2em] neon-text"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
            🎙️ SALA: GOLDEN VIBES 🎙️
          </motion.p>
        </motion.div>
      }
    >
      {/* Participant controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {participants.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            className={`glass-card p-4 text-center ${p.muted ? "opacity-40" : ""}`}>
            <Avatar className="h-12 w-12 mx-auto mb-2">
              <AvatarFallback className="text-xs font-bold" style={{ background: `${p.color}20`, color: p.color }}>{p.initials}</AvatarFallback>
            </Avatar>
            <p className="text-xs font-bold text-foreground">{p.name}</p>
            <span className="text-[9px] text-muted-foreground uppercase">{p.role}</span>
            {!p.muted && (
              <div className="flex items-end justify-center gap-[2px] h-5 mt-2">
                {Array.from({ length: 8 }).map((_, j) => (
                  <motion.div key={j} className="w-1 rounded-sm" style={{ background: p.color }}
                    animate={{ height: `${20 + Math.random() * 80}%` }}
                    transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse", delay: j * 0.05 }} />
                ))}
              </div>
            )}
            <motion.button whileTap={{ scale: 0.9 }} className="mt-2 glass-card p-1.5 rounded-lg"
              onClick={() => setParticipants(prev => prev.map((pp, ii) => ii === i ? { ...pp, muted: !pp.muted } : pp))}>
              {p.muted ? <MicOff className="h-3 w-3 text-muted-foreground" /> : <Mic className="h-3 w-3 text-foreground" />}
            </motion.button>
          </motion.div>
        ))}

        {participants.length < 4 && (
          <motion.button whileTap={{ scale: 0.95 }}
            className="glass-card border-dashed p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] text-muted-foreground hover:text-foreground hover:border-primary/30"
            onClick={() => toast.info("Invitación enviada")}>
            <Plus className="h-8 w-8" />
            <span className="text-xs font-bold">Invitar</span>
          </motion.button>
        )}
      </div>

      {/* Record button */}
      <div className="flex justify-center">
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { setIsRecording(!isRecording); toast(isRecording ? "Grabación detenida" : "Grabando sesión..."); }}
          className={`px-8 py-4 rounded-2xl font-bold text-lg ${isRecording ? "bg-destructive text-destructive-foreground" : "stage-gradient text-primary-foreground shadow-[0_0_25px_hsl(var(--primary)/0.3)]"}`}>
          {isRecording ? "⏹ DETENER" : "⏺ GRABAR SESIÓN"}
        </motion.button>
      </div>

      {/* Chat */}
      <div className="glass-card p-4 rounded-2xl">
        <span className="text-xs font-bold text-foreground flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-primary" /> Chat
        </span>
        <div className="space-y-1 mb-3 max-h-24 overflow-y-auto">
          <p className="text-xs text-muted-foreground"><span className="text-foreground font-bold">Luna:</span> ¿Probamos en La menor?</p>
          <p className="text-xs text-muted-foreground"><span className="text-foreground font-bold">Echo:</span> Dale, yo meto el beatbox</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Escribe..." value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} className="text-sm" />
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setChatMsg(""); toast.success("Enviado"); }}
            className="glass-card px-4 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground">
            Enviar
          </motion.button>
        </div>
      </div>
    </StudioRoom>
  );
}
