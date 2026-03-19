import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Mic, MicOff, Headphones, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Participant {
  name: string;
  initials: string;
  role: string;
  color: string;
  muted: boolean;
}

const PARTICIPANTS: Participant[] = [
  { name: "Tú", initials: "MK", role: "Melodía", color: "bg-primary", muted: false },
  { name: "Luna Vox", initials: "LV", role: "Armonía", color: "bg-violet-500", muted: false },
  { name: "Echo Rivera", initials: "ER", role: "Beatbox", color: "bg-rose-500", muted: true },
];

export default function CollabRoom() {
  const [participants, setParticipants] = useState(PARTICIPANTS);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMsg, setChatMsg] = useState("");

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Collab Room</h1>
          <p className="text-muted-foreground mt-1">Canta en grupo. Crea juntos.</p>
        </div>
      </div>

      {/* Room Status */}
      <Card className="p-4 bg-card border-primary/20 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Sala: Golden Vibes 🎶</p>
          <p className="text-xs text-muted-foreground">{participants.length}/4 participantes</p>
        </div>
        <Badge className="stage-gradient text-primary-foreground">EN VIVO</Badge>
      </Card>

      {/* Participants */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {participants.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className={`p-4 bg-card border-border/40 text-center ${p.muted ? "opacity-50" : ""}`}>
              <Avatar className="h-14 w-14 mx-auto mb-2">
                <AvatarFallback className={`${p.color}/20 text-foreground font-semibold`}>{p.initials}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-foreground">{p.name}</p>
              <Badge variant="outline" className="text-[10px] mt-1">{p.role}</Badge>

              {/* Mini waveform */}
              {!p.muted && (
                <div className="flex items-end justify-center gap-[2px] h-6 mt-3">
                  {Array.from({ length: 12 }).map((_, j) => (
                    <motion.div
                      key={j}
                      className={`w-1 rounded-sm ${p.color}`}
                      animate={{ height: `${20 + Math.random() * 80}%` }}
                      transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse", delay: j * 0.05 }}
                    />
                  ))}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() =>
                  setParticipants((prev) =>
                    prev.map((pp, ii) => (ii === i ? { ...pp, muted: !pp.muted } : pp))
                  )
                }
              >
                {p.muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </Card>
          </motion.div>
        ))}

        {/* Add slot */}
        {participants.length < 4 && (
          <Card className="p-4 bg-card border-dashed border-border/40 flex flex-col items-center justify-center min-h-[160px] cursor-pointer hover:border-primary/40 transition-colors" onClick={() => toast.info("Invitación enviada")}>
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Invitar</p>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          size="lg"
          className={isRecording ? "bg-destructive text-destructive-foreground" : "gold-gradient text-primary-foreground"}
          onClick={() => {
            setIsRecording(!isRecording);
            toast(isRecording ? "Grabación detenida" : "Grabando sesión...");
          }}
        >
          {isRecording ? "⏹ DETENER GRABACIÓN" : "⏺ GRABAR SESIÓN"}
        </Button>
      </div>

      {/* Chat */}
      <Card className="p-4 bg-card border-border/40">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" /> Chat de la sala
        </h3>
        <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
          <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">Luna:</span> ¿Probamos en La menor?</p>
          <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">Echo:</span> Dale, yo meto el beatbox</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Escribe..." value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} className="text-sm" />
          <Button size="sm" variant="outline" onClick={() => { setChatMsg(""); toast.success("Mensaje enviado"); }}>Enviar</Button>
        </div>
      </Card>
    </div>
  );
}
